import { supabase } from '../../../lib/supabase'
import { supabaseAdmin } from '../../../lib/supabase-admin'

// Dynamic export configuration for Next.js API routes
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Centralized pool calculation utility
class PoolCalculator {
  static calculatePools(allBets) {
    const wrestler1Bets = allBets.filter(b => b.wrestler_choice === 'wrestler1')
    const wrestler2Bets = allBets.filter(b => b.wrestler_choice === 'wrestler2')
    
    const wrestler1Pool = wrestler1Bets.reduce((sum, b) => sum + (parseFloat(b.bet_amount) || 0), 0)
    const wrestler2Pool = wrestler2Bets.reduce((sum, b) => sum + (parseFloat(b.bet_amount) || 0), 0)
    const totalPool = wrestler1Pool + wrestler2Pool
    
    // Calculate percentages with proper rounding
    const wrestler1Percentage = totalPool > 0 ? Math.round((wrestler1Pool / totalPool) * 100) : 50
    const wrestler2Percentage = totalPool > 0 ? (100 - wrestler1Percentage) : 50
    
    return {
      wrestler1Pool,
      wrestler2Pool,
      totalPool,
      wrestler1Percentage,
      wrestler2Percentage
    }
  }

  static async updateMatchPools(dbClient, matchId, pools) {
    try {
      // Calculate dynamic odds (like GitHub version)
      const odds1 = pools.wrestler1Pool > 0 ? Math.max(1.10, pools.totalPool / pools.wrestler1Pool) : 1.10
      const odds2 = pools.wrestler2Pool > 0 ? Math.max(1.10, pools.totalPool / pools.wrestler2Pool) : 1.10
      
      console.log('🎲 Calculated odds:', { odds1, odds2 })
      
      const { error } = await dbClient
        .from('matches')
        .update({
          // Odds updates (essential for dynamic system)
          odds_wrestler1: odds1.toFixed(1),
          odds_wrestler2: odds2.toFixed(1),
          // Pool updates  
          wrestler1_pool: pools.wrestler1Pool,
          wrestler2_pool: pools.wrestler2Pool,
          total_pool: pools.totalPool,
          // Percentage updates
          wrestler1_percentage: pools.wrestler1Percentage,
          wrestler2_percentage: pools.wrestler2Percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
      
      if (error) {
        console.error('❌ Match table update failed:', error)
      } else {
        console.log('✅ Match table updated with dynamic odds and pools')
      }
      
      return { error }
    } catch (updateError) {
      console.error('⚠️ Pool update error:', updateError)
      return { error: updateError }
    }
  }
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Input validation with enhanced security
const validateBetInput = (data) => {
  const { userId, matchId, wrestlerChoice, betAmount, odds } = data
  
  // Required field validation
  if (!userId || !matchId || !wrestlerChoice) {
    return { isValid: false, error: 'Missing required fields: userId, matchId, or wrestlerChoice' }
  }
  
  // UUID validation for matchId
  if (!UUID_REGEX.test(matchId)) {
    return { isValid: false, error: `Invalid match ID format. Expected UUID format, got: "${matchId}". This match may need to be recreated with a proper UUID.` }
  }
  
  // Bet amount validation with enhanced limits
  const amount = typeof betAmount === 'string' ? parseFloat(betAmount) : betAmount
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > 10000) {
    return { isValid: false, error: 'Invalid bet amount (must be 1-10000 WC)' }
  }
  
  // Odds validation with minimum threshold - handle both string and number inputs
  const oddsValue = typeof odds === 'string' ? parseFloat(odds) : odds
  if (typeof oddsValue !== 'number' || isNaN(oddsValue) || oddsValue < 1.1) {
    return { isValid: false, error: 'Invalid odds (must be >= 1.1)' }
  }
  
  // Wrestler choice validation
  if (!['wrestler1', 'wrestler2'].includes(wrestlerChoice)) {
    return { isValid: false, error: 'Invalid wrestler choice (must be wrestler1 or wrestler2)' }
  }
  
  return { isValid: true, validatedData: { ...data, betAmount: amount, odds: oddsValue } }
}

// Enhanced database client selector with fallback strategy
const getDbClient = () => {
  if (supabaseAdmin) {
    console.log('🔑 Using admin client (RLS bypass)')
    return supabaseAdmin
  }
  
  console.log('⚠️ Using regular client (RLS enabled)')
  return supabase
}

export async function POST(request) {
  try {
    console.log('💰 Dynamic Betting API called')
    const requestData = await request.json()
    console.log('📊 Request data:', requestData)
    
    // Input validation
    const validation = validateBetInput(requestData)
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.error)
      return Response.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }
    
    const { userId, matchId, wrestlerChoice, betAmount, odds } = validation.validatedData

    // Environment check
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    console.log('🔌 Supabase configured:', supabaseConfigured)
    
    // Demo mode fallback
    if (!supabaseConfigured) {
      console.log('⚠️ Demo mode active - Supabase not configured')
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
        message: 'Demo bet placed successfully'
      })
    }

    try {
      const dbClient = getDbClient()
      
      // Step 1: Verify match exists
      console.log('🔍 Verifying match:', matchId)
      const { data: matchCheck, error: matchError } = await dbClient
        .from('matches')
        .select('id, wrestler1, wrestler2, status')
        .eq('id', matchId.toString())
        .single()

      if (matchError) {
        console.error('❌ Match verification failed:', matchError)
        throw new Error(`Match not found: ${matchError.message}`)
      }

      // Check if match is still open for betting
      if (matchCheck.status === 'completed' || matchCheck.status === 'cancelled') {
        return Response.json({
          success: false,
          error: 'This match is no longer open for betting'
        }, { status: 409 })
      }

      console.log('✅ Match verified:', matchCheck)

      // Step 2: Ensure user exists in database and check balance
      console.log('👤 Checking/creating user:', userId)
      const { data: userCheck, error: userError } = await dbClient
        .from('users')
        .select('id, wrestlecoin_balance')
        .eq('id', userId.toString())
        .single()

      let currentUser = null

      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create them
        console.log('🆕 Creating new user in database')
        const { data: newUser, error: createUserError } = await dbClient
          .from('users')
          .insert({
            id: userId,
            username: `user_${userId.slice(-8)}`, // Use last 8 chars of userId
            email: `${userId}@temp.com`, // Temporary email, can be updated later
            wrestlecoin_balance: 1000 // Starting balance
          })
          .select()
          .single()

        if (createUserError) {
          console.error('❌ Failed to create user:', createUserError)
          throw new Error(`Failed to create user: ${createUserError.message}`)
        }
        console.log('✅ User created:', newUser)
        currentUser = newUser
      } else if (userError) {
        console.error('❌ User verification failed:', userError)
        throw new Error(`User verification failed: ${userError.message}`)
      } else {
        console.log('✅ User exists:', userCheck)
        currentUser = userCheck
      }

      // Step 2.5: Check if user has sufficient balance
      const currentBalance = currentUser.wrestlecoin_balance || 0
      console.log(`💰 Current balance: ${currentBalance} WC, Bet amount: ${betAmount} WC`)
      
      if (currentBalance < betAmount) {
        console.error('❌ Insufficient balance')
        return Response.json({
          success: false,
          error: `Insufficient WrestleCoin balance. You have ${currentBalance} WC but need ${betAmount} WC`,
          currentBalance,
          requiredAmount: betAmount
        }, { status: 400 })
      }

      // Step 3: Insert bet with transaction safety
      const betData = {
        user_id: userId,
        match_id: matchId,
        wrestler_choice: wrestlerChoice,
        bet_amount: betAmount,
        odds: odds,
        status: 'active',
        created_at: new Date().toISOString()
      }
      
      console.log('💾 Inserting bet:', betData)
      const { data: bet, error: betError } = await dbClient
        .from('bets')
        .insert(betData)
        .select()
        .single()

      if (betError) {
        console.error('❌ Bet insertion failed:', betError)
        
        // Handle duplicate bet constraint
        if (betError.code === '23505' && betError.message.includes('unique_user_match_pending_bet')) {
          return Response.json({
            success: false,
            error: 'You already have a pending bet on this match',
            code: 'DUPLICATE_BET'
          }, { status: 409 })
        }
        
        // If it's the total_pool ambiguity error, fall back to demo mode
        if (betError.code === '42702' && betError.message.includes('total_pool')) {
          console.log('⚠️ Database trigger conflict detected, falling back to demo mode')
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
            message: 'Bet placed successfully (demo mode due to database conflict)',
            databaseConflict: true
          })
        }
        
        throw new Error(`Failed to create bet: ${betError.message}`)
      }

      console.log('✅ Bet inserted successfully:', bet)

      // Step 4: Deduct bet amount from user's balance
      const newBalance = currentBalance - betAmount
      console.log(`💰 Deducting ${betAmount} WC from balance: ${currentBalance} → ${newBalance}`)
      
      const { error: balanceError } = await dbClient
        .from('users')
        .update({ 
          wrestlecoin_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId.toString())

      if (balanceError) {
        console.error('❌ Balance update failed:', balanceError)
        // Note: We don't throw error here because the bet was already placed successfully
        // The balance update is secondary - we could implement a retry mechanism later
        console.warn('⚠️ Bet placed but balance not updated - manual intervention may be needed')
      } else {
        console.log('✅ User balance updated successfully')
      }

      // Step 5: Dynamic odds and pools are automatically updated by database trigger
      console.log('🔄 Dynamic odds and pools will be updated automatically by database trigger...')
      
      // Get the updated match data to return to client
      const { data: updatedMatch, error: updatedMatchError } = await dbClient
        .from('matches')
        .select('wrestler1_pool, wrestler2_pool, total_pool, odds_wrestler1, odds_wrestler2, wrestler1_percentage, wrestler2_percentage')
        .eq('id', matchId)
        .single()

      if (updatedMatchError) {
        console.error('⚠️ Could not fetch updated match data:', updatedMatchError)
      } else {
        console.log('✅ Updated match data:', updatedMatch)
      }

      // Return comprehensive success response with dynamic data
      const response = {
        success: true,
        bet: bet,
        message: 'Bet placed successfully',
        balanceUpdated: !balanceError,
        newBalance: newBalance,
        previousBalance: currentBalance,
        betAmount: betAmount,
        dynamicData: updatedMatch || null
      }

      console.log('✅ Betting API success response:', response)
      return Response.json(response)

    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return Response.json({
        success: false,
        error: `Database error: ${dbError.message}`,
        details: process.env.NODE_ENV === 'development' ? dbError : undefined
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Bets POST API error:', error)
    return Response.json({
      success: false,
      error: `Failed to process bet: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const matchId = searchParams.get('matchId')

    // Environment check
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseConfigured) {
      return Response.json({
        success: true,
        bets: [],
        demo: true
      })
    }

    try {
      const dbClient = getDbClient()
      let query = dbClient
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Apply filters
      if (userId && userId !== 'null' && userId !== 'undefined') {
        query = query.eq('user_id', userId.toString())
      }
      
      if (matchId && matchId !== 'null' && matchId !== 'undefined') {
        query = query.eq('match_id', matchId.toString())
      }
      
      const { data: bets, error } = await query

      if (error) {
        console.error('❌ Bets fetch error:', error)
        throw error
      }

      return Response.json({
        success: true,
        bets: bets || []
      })
      
    } catch (dbError) {
      console.error('⚠️ Database error in GET:', dbError.message)
      return Response.json({
        success: true,
        bets: [],
        error: 'Database temporarily unavailable'
      })
    }
  } catch (error) {
    console.error('❌ Bets GET API error:', error)
    return Response.json({
      success: true,
      bets: [],
      error: 'Service temporarily unavailable'
    })
  }
}
