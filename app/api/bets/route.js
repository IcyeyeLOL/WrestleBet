import { supabase } from '../../../lib/supabase'

// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Input validation helper
const validateBetInput = (data) => {
  const { userId, matchId, wrestlerChoice, betAmount, odds } = data
  
  if (!userId || !matchId || !wrestlerChoice) {
    return { isValid: false, error: 'Missing required fields: userId, matchId, or wrestlerChoice' }
  }
  
  if (typeof betAmount !== 'number' || betAmount <= 0 || betAmount > 10000) {
    return { isValid: false, error: 'Invalid bet amount (must be 1-10000)' }
  }
  
  if (typeof odds !== 'number' || odds < 1.1) {
    return { isValid: false, error: 'Invalid odds (must be >= 1.1)' }
  }
  
  if (!['wrestler1', 'wrestler2'].includes(wrestlerChoice)) {
    return { isValid: false, error: 'Invalid wrestler choice (must be wrestler1 or wrestler2)' }
  }
  
  return { isValid: true }
}

export async function POST(request) {
  try {
    console.log('💰 Betting API called');
    const requestData = await request.json()
    console.log('📊 Request data:', requestData);
    
    // Validate input
    const validation = validateBetInput(requestData)
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.error);
      return Response.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    const { userId, matchId, wrestlerChoice, betAmount, odds } = requestData

    // Check if Supabase is configured
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('🔌 Supabase configured:', supabaseConfigured);
    
    if (!supabaseConfigured) {
      console.log('⚠️ Running in demo mode - Supabase not configured');
      // Return success response for demo mode
      return Response.json({
        success: true,
        demo: true,
        bet: {
          id: `demo-${Date.now()}`,
          user_id: userId,
          match_id: matchId,
          wrestler_choice: wrestlerChoice,
          bet_amount: betAmount,
          odds: odds,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        newOdds: { [wrestlerChoice]: odds },
        wrestlerTotals: { [wrestlerChoice]: betAmount }
      })
    }

    try {
      // Step 1: Verify match exists
      console.log('🔍 Verifying match exists:', matchId);
      const { data: matchCheck, error: matchError } = await supabase
        .from('matches')
        .select('id, wrestler1, wrestler2')
        .eq('id', matchId)
        .single();

      if (matchError) {
        console.error('❌ Match verification failed:', matchError);
        throw new Error(`Match not found: ${matchError.message}`);
      }

      console.log('✅ Match verified:', matchCheck);

      // Step 2: Insert new bet with detailed logging
      console.log('� Inserting bet into database...');
      const betData = {
        user_id: userId,
        match_id: matchId,
        wrestler_choice: wrestlerChoice,
        amount: betAmount,
        odds: odds,
        status: 'pending'
      };
      console.log('📊 Bet data to insert:', betData);

      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert(betData)
        .select()
        .single()

      if (betError) {
        console.error('❌ Bet insertion failed:', betError);
        throw new Error(`Failed to create bet: ${betError.message}`)
      }

      console.log('✅ Bet inserted successfully:', bet);

      // Step 3: Calculate updated odds and pools
      console.log('🔄 Calculating updated odds and pools...');
      
      // Get all bets for this match
      const { data: allBets, error: betsError } = await supabase
        .from('bets')
        .select('wrestler_choice, amount')
        .eq('match_id', matchId)
        .eq('status', 'pending');

      if (betsError) {
        console.error('❌ Error fetching all bets:', betsError);
        throw betsError;
      }

      console.log(`📊 Found ${allBets?.length || 0} total bets for match:`, allBets);

      // Calculate pool totals
      const wrestler1Pool = allBets
        .filter(bet => bet.wrestler_choice === 'wrestler1')
        .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
      
      const wrestler2Pool = allBets
        .filter(bet => bet.wrestler_choice === 'wrestler2')
        .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
      
      const totalPool = wrestler1Pool + wrestler2Pool;

      console.log('💰 Pool calculations:', {
        wrestler1Pool,
        wrestler2Pool,
        totalPool
      });

      // Calculate dynamic odds (minimum 1.10)
      const odds1 = wrestler1Pool > 0 ? Math.max(1.10, totalPool / wrestler1Pool) : 1.10;
      const odds2 = wrestler2Pool > 0 ? Math.max(1.10, totalPool / wrestler2Pool) : 1.10;

      console.log('🎲 Calculated odds:', { odds1, odds2 });

      // Step 4: Update match table with new odds and pools
      console.log('🔄 Updating match table...');
      const { error: matchUpdateError } = await supabase
        .from('matches')
        .update({
          odds_wrestler1: odds1.toFixed(1),
          odds_wrestler2: odds2.toFixed(1),
          wrestler1_pool: wrestler1Pool,
          wrestler2_pool: wrestler2Pool,
          total_pool: totalPool,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (matchUpdateError) {
        console.error('❌ Match update failed:', matchUpdateError);
        // Don't throw here - bet was successful, just odds update failed
      } else {
        console.log('✅ Match table updated successfully');
      }

      // Calculate final response data
      const wrestlerTotals = {
        wrestler1: wrestler1Pool,
        wrestler2: wrestler2Pool
      };

      const newOdds = {
        wrestler1: odds1.toFixed(1),
        wrestler2: odds2.toFixed(1)
      };

      const response = {
        success: true,
        bet: bet,
        newOdds: newOdds,
        wrestlerTotals: wrestlerTotals,
        totalPool: totalPool
      };

      console.log('✅ Betting API success response:', response);
      return Response.json(response);

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      // Return detailed error for debugging
      return Response.json({
        success: false,
        error: `Database error: ${dbError.message}`,
        details: dbError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Bets POST API error:', error);
    return Response.json(
      { 
        success: false, 
        error: `Failed to process bet: ${error.message}`,
        details: error 
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Check if Supabase is configured
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseConfigured) {
      // Return empty bets array when Supabase is not configured
      return Response.json({
        success: true,
        bets: []
      })
    }

    try {
      let query = supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Only filter by userId if it's a valid value (not null, undefined, or "null" string)
      if (userId && userId !== 'null' && userId !== 'undefined') {
        query = query.eq('user_id', userId)
      }
      
      const { data: bets, error } = await query

      if (error) throw error

      return Response.json({
        success: true,
        bets: bets || []
      })
    } catch (dbError) {
      console.log('⚠️ Database error, returning empty bets:', dbError.message);
      return Response.json({
        success: true,
        bets: []
      })
    }
  } catch (error) {
    console.error('❌ Bets API error:', error);
    // Always return empty bets array on any error to prevent network failures
    return Response.json({
      success: true,
      bets: []
    })
  }
}
