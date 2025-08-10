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

    // Insert new bet with error handling
    const { data: bet, error } = await supabase
      .from('bets')
      .insert({
        user_id: userId,
        match_id: matchId,
        wrestler_choice: wrestlerChoice,
        bet_amount: betAmount,
        odds: odds,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to create bet: ${error.message}`)
    }

    // Calculate new odds based on betting volume
    const { data: allBets, error: betsError } = await supabase
      .from('bets')
      .select('wrestler_choice, bet_amount')
      .eq('match_id', matchId)

    if (betsError) throw betsError

    // Calculate total money on each wrestler
    const wrestlerTotals = allBets.reduce((acc, bet) => {
      acc[bet.wrestler_choice] = (acc[bet.wrestler_choice] || 0) + parseFloat(bet.bet_amount)
      return acc
    }, {})

    const totalPool = Object.values(wrestlerTotals).reduce((sum, amount) => sum + amount, 0)

    // Calculate new odds (simplified odds calculation)
    const newOdds = {}
    Object.keys(wrestlerTotals).forEach(wrestler => {
      const wrestlerShare = wrestlerTotals[wrestler] / totalPool
      // More money on a wrestler = lower odds (more likely to win)
      newOdds[wrestler] = Math.max(1.1, 2.0 - wrestlerShare).toFixed(2)
    })

    return Response.json({
      success: true,
      bet: bet,
      newOdds: newOdds,
      wrestlerTotals: wrestlerTotals
    })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const { data: bets, error } = await supabase
      .from('bets')
      .select(`
        *,
        matches (
          wrestler_a,
          wrestler_b,
          event_name,
          weight_class
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({
      success: true,
      bets: bets
    })
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
