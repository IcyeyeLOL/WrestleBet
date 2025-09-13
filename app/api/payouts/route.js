import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabase-admin.js';

export const revalidate = 0;

// Enhanced database client selector
const getDbClient = () => {
  if (supabaseAdmin) {
    console.log('🔑 Using admin client for payout processing');
    return supabaseAdmin;
  }
  console.log('⚠️ Using regular client for payout processing');
  return supabase;
};

// Payout calculation utility
class PayoutCalculator {
  static calculatePayouts(matchId, winner, allBets) {
    console.log(`💰 Calculating payouts for match ${matchId}, winner: ${winner}`);
    
    // Filter winning and losing bets
    const winningBets = allBets.filter(bet => bet.wrestler_choice === winner);
    const losingBets = allBets.filter(bet => bet.wrestler_choice !== winner);
    
    console.log(`📊 Bet breakdown:`, {
      totalBets: allBets.length,
      winningBets: winningBets.length,
      losingBets: losingBets.length
    });
    
    // Calculate total pools
    const totalPool = allBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const winningPool = winningBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const losingPool = totalPool - winningPool;
    
    console.log(`💰 Pool breakdown:`, {
      totalPool,
      winningPool,
      losingPool
    });
    
    // Calculate payouts for each winning bet
    const payouts = winningBets.map(bet => {
      const betAmount = parseFloat(bet.amount);
      const payoutAmount = winningPool > 0 ? (betAmount / winningPool) * totalPool : betAmount;
      
      return {
        betId: bet.id,
        userId: bet.user_id,
        betAmount,
        payoutAmount: Math.round(payoutAmount * 100) / 100, // Round to 2 decimal places
        profit: Math.round((payoutAmount - betAmount) * 100) / 100
      };
    });
    
    console.log(`🎯 Calculated ${payouts.length} payouts:`, payouts);
    
    return {
      totalPool,
      winningPool,
      losingPool,
      payouts,
      totalPayout: payouts.reduce((sum, payout) => sum + payout.payoutAmount, 0)
    };
  }
  
  static async processPayouts(dbClient, matchId, winner, payoutData) {
    console.log(`🔄 Processing payouts for match ${matchId}`);
    
    try {
      // Start transaction-like processing
      const results = {
        successfulPayouts: [],
        failedPayouts: [],
        totalProcessed: 0
      };
      
      // Process each payout
      for (const payout of payoutData.payouts) {
        try {
          console.log(`💰 Processing payout for user ${payout.userId}: ${payout.payoutAmount} WC`);
          
          // Get current user balance
          const { data: userData, error: userError } = await dbClient
            .from('users')
            .select('wrestlecoin_balance')
            .eq('id', payout.userId)
            .single();
          
          if (userError) {
            console.error(`❌ Failed to get user balance for ${payout.userId}:`, userError);
            results.failedPayouts.push({ ...payout, error: userError.message });
            continue;
          }
          
          const currentBalance = userData?.wrestlecoin_balance || 0;
          const newBalance = currentBalance + payout.payoutAmount;
          
          // Update user balance
          const { error: balanceError } = await dbClient
            .from('users')
            .update({ 
              wrestlecoin_balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', payout.userId);
          
          if (balanceError) {
            console.error(`❌ Failed to update balance for ${payout.userId}:`, balanceError);
            results.failedPayouts.push({ ...payout, error: balanceError.message });
            continue;
          }
          
          // Record transaction
          const { error: transactionError } = await dbClient
            .from('wrestlecoin_transactions')
            .insert({
              user_id: payout.userId,
              transaction_type: 'credit',
              category: 'winnings',
              amount: payout.payoutAmount,
              description: `Match ${matchId} winnings - ${payout.betAmount} WC bet → ${payout.payoutAmount} WC payout`,
              reference_id: payout.betId
            });
          
          if (transactionError) {
            console.error(`❌ Failed to record transaction for ${payout.userId}:`, transactionError);
            // Don't fail the payout for transaction recording errors
          }
          
          // Update bet status to 'won'
          const { error: betError } = await dbClient
            .from('bets')
            .update({ 
              status: 'won',
              payout_amount: payout.payoutAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', payout.betId);
          
          if (betError) {
            console.error(`❌ Failed to update bet status for ${payout.betId}:`, betError);
            // Don't fail the payout for bet status update errors
          }
          
          results.successfulPayouts.push(payout);
          results.totalProcessed += payout.payoutAmount;
          
          console.log(`✅ Successfully processed payout for user ${payout.userId}`);
          
        } catch (payoutError) {
          console.error(`❌ Error processing payout for user ${payout.userId}:`, payoutError);
          results.failedPayouts.push({ ...payout, error: payoutError.message });
        }
      }
      
      // Update losing bets status
      const { error: losingBetsError } = await dbClient
        .from('bets')
        .update({ 
          status: 'lost',
          payout_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('match_id', matchId)
        .neq('wrestler_choice', winner);
      
      if (losingBetsError) {
        console.error('❌ Failed to update losing bets status:', losingBetsError);
      } else {
        console.log('✅ Updated losing bets status');
      }
      
      console.log(`🎉 Payout processing complete:`, {
        successful: results.successfulPayouts.length,
        failed: results.failedPayouts.length,
        totalProcessed: results.totalProcessed
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ Error in payout processing:', error);
      throw error;
    }
  }
}

// POST - Declare winner and process payouts
export async function POST(request) {
  try {
    console.log('🏆 Winner declaration API called');
    
    const { matchId, winner, adminKey } = await request.json();
    
    // Basic validation
    if (!matchId || !winner) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: matchId and winner'
      }, { status: 400 });
    }
    
    // Simple admin key validation (in production, use proper authentication)
    if (adminKey !== 'admin-declare-winner-2024') {
      return NextResponse.json({
        success: false,
        error: 'Invalid admin key'
      }, { status: 401 });
    }
    
    const dbClient = getDbClient();
    
    // Get match details
    const { data: match, error: matchError } = await dbClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      console.error('❌ Match not found:', matchError);
      return NextResponse.json({
        success: false,
        error: 'Match not found'
      }, { status: 404 });
    }
    
    // Check if match already has a winner
    if (match.winner) {
      return NextResponse.json({
        success: false,
        error: 'Match already has a declared winner'
      }, { status: 400 });
    }
    
    // Get all pending bets for this match
    const { data: allBets, error: betsError } = await dbClient
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .eq('status', 'pending');
    
    if (betsError) {
      console.error('❌ Failed to fetch bets:', betsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bets'
      }, { status: 500 });
    }
    
    if (!allBets || allBets.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No pending bets found for this match'
      }, { status: 400 });
    }
    
    // Calculate payouts
    const payoutData = PayoutCalculator.calculatePayouts(matchId, winner, allBets);
    
    // Process payouts
    const payoutResults = await PayoutCalculator.processPayouts(dbClient, matchId, winner, payoutData);
    
    // Update match with winner and payout info
    const { error: matchUpdateError } = await dbClient
      .from('matches')
      .update({
        winner: winner,
        total_payout: payoutData.totalPayout,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);
    
    if (matchUpdateError) {
      console.error('❌ Failed to update match:', matchUpdateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update match'
      }, { status: 500 });
    }
    
    console.log('🎉 Winner declaration and payout processing completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Winner declared and payouts processed successfully',
      data: {
        matchId,
        winner,
        totalPool: payoutData.totalPool,
        totalPayout: payoutData.totalPayout,
        successfulPayouts: payoutResults.successfulPayouts.length,
        failedPayouts: payoutResults.failedPayouts.length,
        payoutDetails: payoutResults
      }
    });
    
  } catch (error) {
    console.error('❌ Winner declaration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET - Get payout information for a match
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    
    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }
    
    const dbClient = getDbClient();
    
    // Get match details
    const { data: match, error: matchError } = await dbClient
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
    
    if (matchError || !match) {
      return NextResponse.json({
        success: false,
        error: 'Match not found'
      }, { status: 404 });
    }
    
    // Get all bets for this match
    const { data: bets, error: betsError } = await dbClient
      .from('bets')
      .select('*')
      .eq('match_id', matchId);
    
    if (betsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bets'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        match,
        bets: bets || [],
        totalBets: bets?.length || 0,
        hasWinner: !!match.winner,
        totalPool: match.total_pool || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Get payout info error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

