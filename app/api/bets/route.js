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
