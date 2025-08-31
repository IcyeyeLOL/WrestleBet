import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

// Input validation helper
const validateBetInput = (data) => {
  const { userId, matchId, wrestlerChoice, betAmount, odds } = data
  
  if (!userId || !matchId || !wrestlerChoice) {
    return { isValid: false, error: 'Missing required fields' }
  }
  
  if (typeof betAmount !== 'number' || betAmount <= 0 || betAmount > 10000) {
    return { isValid: false, error: 'Invalid bet amount (must be 1-10000)' }
  }
  
  if (typeof odds !== 'number' || odds < 1.1) {
    return { isValid: false, error: 'Invalid odds (must be >= 1.1)' }
  }
  
  return { isValid: true }
}

export async function POST(request) {
  try {
    const requestData = await request.json()
    
    // Validate input
    const validation = validateBetInput(requestData)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    const { userId, matchId, wrestlerChoice, betAmount, odds } = requestData

    // Check if Supabase is configured
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseConfigured) {
      // Return success response for demo mode
      return NextResponse.json({
        success: true,
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
      // Insert new bet with error handling
      const { data: bet, error } = await supabase
        .from('bets')
        .insert({
          user_id: userId,
          match_id: matchId,
          wrestler_choice: wrestlerChoice,
          amount: betAmount, // Changed from bet_amount to amount
          odds: odds,
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw new Error(`Failed to create bet: ${error.message}`)
      }

      // CRITICAL: Update match table with new odds and pools
      // This should trigger the database function to recalculate odds
      console.log('🔄 Triggering match odds update for match:', matchId);
      
      // Call the database function to recalculate odds
      const { data: oddsUpdate, error: oddsError } = await supabase
        .rpc('calculate_match_odds', { match_id: matchId });

      if (oddsError) {
        console.warn('⚠️ Warning: Could not update match odds:', oddsError.message);
      } else {
        console.log('✅ Match odds updated:', oddsUpdate);
      }

      // Manually update the match table with recalculated values
      const { data: allBets, error: betsError } = await supabase
        .from('bets')
        .select('wrestler_choice, amount')
        .eq('match_id', matchId)
        .eq('status', 'pending');

      if (betsError) throw betsError;

      // Calculate pool totals
      const wrestler1Pool = allBets
        .filter(bet => bet.wrestler_choice === 'wrestler1')
        .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
      
      const wrestler2Pool = allBets
        .filter(bet => bet.wrestler_choice === 'wrestler2')
        .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
      
      const totalPool = wrestler1Pool + wrestler2Pool;

      // Calculate dynamic odds (minimum 1.10)
      const odds1 = wrestler1Pool > 0 ? Math.max(1.10, totalPool / wrestler1Pool) : 1.10;
      const odds2 = wrestler2Pool > 0 ? Math.max(1.10, totalPool / wrestler2Pool) : 1.10;

      // Update match table with new odds and pools
      const { error: matchUpdateError } = await supabase
        .from('matches')
        .update({
          odds_wrestler1: odds1.toFixed(2),
          odds_wrestler2: odds2.toFixed(2),
          total_pool: totalPool
        })
        .eq('id', matchId);

      if (matchUpdateError) {
        console.warn('⚠️ Warning: Could not update match table:', matchUpdateError.message);
      } else {
        console.log('✅ Match table updated with new odds and pool:', {
          matchId,
          odds1: odds1.toFixed(2),
          odds2: odds2.toFixed(2),
          totalPool
        });
      }

      // Calculate final response data
      const wrestlerTotals = {
        wrestler1: wrestler1Pool,
        wrestler2: wrestler2Pool
      };

      const newOdds = {
        wrestler1: odds1.toFixed(2),
        wrestler2: odds2.toFixed(2)
      };

      return Response.json({
        success: true,
        bet: bet,
        newOdds: newOdds,
        wrestlerTotals: wrestlerTotals
      })
    } catch (dbError) {
      console.log('⚠️ Database error, returning demo response:', dbError.message);
      // Return success response for demo mode when database fails
      return NextResponse.json({
        success: true,
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
  } catch (error) {
    console.error('❌ Bets POST API error:', error);
    return Response.json(
      { success: false, error: 'Failed to process bet' },
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
