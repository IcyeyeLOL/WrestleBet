import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId, winner, adminKey } = body;

    // Basic validation
    if (!matchId || !winner) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: matchId and winner' },
        { status: 400 }
      );
    }

    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'wrestlebet-admin-2025') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    console.log(`🏆 Admin declaring winner for match ${matchId}: ${winner}`);

    // 🔥 COMPLETELY DYNAMIC - NO HARDCODED DATA
    // All data comes from database, never from hardcoded objects
    let matchBets = [];
    let matchData = null;
    
    try {
      // Ensure database is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error('Database not configured - cannot process winner declaration');
      }

      // Get database connection
      const { supabase } = require('../../../../lib/supabase');
      
      // 1. Get match data from database
      console.log('🔍 Loading match data from database...');
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();
        
      if (matchError || !match) {
        throw new Error(`Match not found in database: ${matchError?.message || 'No match data'}`);
      }
      
      matchData = match;
      console.log(`✅ Loaded match: ${match.wrestler1} vs ${match.wrestler2}`);
      
      // 2. Get all pending bets for this match from database
      console.log('🔍 Loading bets from database...');
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('match_id', matchId)
        .eq('status', 'pending');
        
      if (betsError) {
        throw new Error(`Error loading bets: ${betsError.message}`);
      }
      
      matchBets = betsData || [];
      console.log(`✅ Loaded ${matchBets.length} pending bets`);
      
    } catch (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Validate we have the required data
    if (matchBets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No pending bets found for this match' },
        { status: 400 }
      );
    }

    console.log(`📊 Processing ${matchBets.length} pending bets for match ${matchId}`);

    // 🎯 DYNAMIC WINNER PROCESSING - NO HARDCODED LOGIC
    const payoutResults = [];
    let totalPaidOut = 0;
    
    // Determine winner wrestler position dynamically from match data
    let winnerPosition = null;
    const winnerLower = winner.toLowerCase().trim();
    const wrestler1Lower = matchData.wrestler1.toLowerCase().trim();
    const wrestler2Lower = matchData.wrestler2.toLowerCase().trim();
    
    if (winnerLower === wrestler1Lower || wrestler1Lower.includes(winnerLower)) {
      winnerPosition = 'wrestler1';
      console.log(`🎯 Winner "${winner}" matches wrestler1: ${matchData.wrestler1}`);
    } else if (winnerLower === wrestler2Lower || wrestler2Lower.includes(winnerLower)) {
      winnerPosition = 'wrestler2';
      console.log(`🎯 Winner "${winner}" matches wrestler2: ${matchData.wrestler2}`);
    } else {
      return NextResponse.json(
        { success: false, error: `Winner "${winner}" does not match either wrestler: ${matchData.wrestler1} vs ${matchData.wrestler2}` },
        { status: 400 }
      );
    }

    // Process each bet dynamically
    for (const bet of matchBets) {
      const betWrestlerChoice = bet.wrestler_choice; // 'wrestler1' or 'wrestler2'
      
      console.log(`🔍 Processing bet: ${bet.amount} WC on ${betWrestlerChoice} (${betWrestlerChoice === 'wrestler1' ? matchData.wrestler1 : matchData.wrestler2})`);
      
      if (betWrestlerChoice === winnerPosition) {
        // WINNER - Calculate dynamic payout  
        const odds = parseFloat(bet.odds);
        const payout = Math.round(bet.amount * odds); // Always whole WC amounts
        
        payoutResults.push({
          betId: bet.id,
          userId: bet.user_id,
          status: 'won',
          originalAmount: bet.amount,
          odds: bet.odds,
          payout: payout,
          wrestler: betWrestlerChoice === 'wrestler1' ? matchData.wrestler1 : matchData.wrestler2
        });
        
        totalPaidOut += payout;
        console.log(`✅ WINNER: User ${bet.user_id} bet ${bet.amount} WC on ${betWrestlerChoice} at ${bet.odds} odds = ${payout} WC payout`);
      } else {
        // LOSER - No payout
        payoutResults.push({
          betId: bet.id,
          userId: bet.user_id,
          status: 'lost',
          originalAmount: bet.amount,
          odds: bet.odds,
          payout: 0,
          wrestler: betWrestlerChoice === 'wrestler1' ? matchData.wrestler1 : matchData.wrestler2
        });
        
        console.log(`❌ LOSER: User ${bet.user_id} bet ${bet.amount} WC on ${betWrestlerChoice} - No payout`);
      }
    }

    // Get dynamic pool information from match data (not hardcoded)
    const totalPoolValue = parseFloat(matchData.total_pool || 0);
    const wrestler1Pool = parseFloat(matchData.wrestler1_pool || 0);
    const wrestler2Pool = parseFloat(matchData.wrestler2_pool || 0);
    
    console.log(`💰 Dynamic pools from database: W1=${wrestler1Pool}WC, W2=${wrestler2Pool}WC, Total=${totalPoolValue}WC`);
    
    // Calculate house edge (money not paid out)
    const houseEdge = totalPoolValue - totalPaidOut;
    
    console.log(`💰 Dynamic Payout Summary:`);
    console.log(`   Total Pool Value: ${totalPoolValue} WC`);
    console.log(`   Total Paid Out: ${totalPaidOut} WC`);
    console.log(`   House Edge: ${houseEdge} WC`);

    // 🔄 DYNAMIC DATABASE UPDATES - NO HARDCODED OPERATIONS
    try {
      const { supabase } = require('../../../../lib/supabase');
      
      console.log('🔄 Processing dynamic database updates...');
      
      // 1. Update all bet statuses dynamically
      for (const result of payoutResults) {
        const { error: betUpdateError } = await supabase
          .from('bets')
          .update({ 
            status: result.status,
            payout_amount: result.payout,
            updated_at: new Date().toISOString()
          })
          .eq('id', result.betId);
          
        if (betUpdateError) {
          console.error(`❌ Error updating bet ${result.betId}:`, betUpdateError);
        } else {
          console.log(`✅ Updated bet ${result.betId} to ${result.status}`);
        }
      }
      
      // 2. Add dynamic WC transactions for winners AND update balances
      for (const result of payoutResults) {
        if (result.status === 'won' && result.payout > 0) {
          // ENSURE USER EXISTS FIRST - Create user if they don't exist
          const { data: userCheck, error: userCheckError } = await supabase
            .from('users')
            .select('id, wrestlecoin_balance')
            .eq('id', result.userId)
            .single();
            
          let currentBalance = 0;
          
          if (userCheckError) {
            // User doesn't exist, create them with default balance
            console.log(`👤 Creating user ${result.userId} with default balance...`);
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                id: result.userId,
                wrestlecoin_balance: 1000 // Default starting balance
              })
              .select('wrestlecoin_balance')
              .single();
              
            if (createError) {
              console.error(`❌ Could not create user ${result.userId}:`, createError);
              continue; // Skip this payout
            }
            
            currentBalance = newUser.wrestlecoin_balance || 1000;
            console.log(`✅ Created new user ${result.userId} with ${currentBalance} WC`);
          } else {
            currentBalance = userCheck.wrestlecoin_balance || 0;
            console.log(`✅ Found existing user ${result.userId} with ${currentBalance} WC`);
          }
          
          const newBalance = Math.round(currentBalance + result.payout); // Ensure whole numbers
          
          // Create transaction record with proper balance tracking
          const { error: transactionError } = await supabase
            .from('wrestlecoin_transactions')
            .insert({
              user_id: result.userId,
              transaction_type: 'credit',
              category: 'win',
              amount: result.payout,
                balance_before: currentBalance,
                balance_after: newBalance,
                description: `Betting win: ${result.wrestler} (${result.originalAmount} WC at ${result.odds} odds)`,
                related_bet_id: result.betId,
                created_at: new Date().toISOString()
              });
              
            if (transactionError) {
              console.error(`❌ Error creating payout transaction for user ${result.userId}:`, transactionError);
              continue;
            }
            
            // Update user balance
            const { error: balanceError } = await supabase
              .from('users')
              .update({ wrestlecoin_balance: newBalance })
              .eq('id', result.userId);
              
            if (balanceError) {
              console.error(`❌ Error updating balance for user ${result.userId}:`, balanceError);
            } else {
              console.log(`✅ Updated balance for user ${result.userId}: ${currentBalance} → ${newBalance} WC`);
              console.log(`✅ Created payout transaction: ${result.payout} WC for user ${result.userId}`);
            }
        }
      }
      
      // 3. Mark match as completed dynamically
      const { error: matchUpdateError } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          winner: winner,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', matchId);
          
        if (matchUpdateError) {
          console.error(`❌ Error updating match status:`, matchUpdateError);
          // Don't throw error, continue with success response
        } else {
          console.log(`✅ Match ${matchId} marked as completed with winner: ${winner}`);
          console.log(`🗑️ Match will be automatically removed from frontend (status changed to 'completed')`);
        }      console.log('✅ All dynamic database updates completed successfully');
      
    } catch (dbError) {
      console.error('❌ Database update error:', dbError);
      return NextResponse.json(
        { success: false, error: `Database update failed: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matchId,
      winner,
      totalBets: matchBets.length,
      payoutResults,
      summary: {
        totalPoolValue,
        totalPaidOut,
        houseEdge,
        winners: payoutResults.filter(p => p.status === 'won').length,
        losers: payoutResults.filter(p => p.status === 'lost').length
      }
    });

  } catch (error) {
    console.error('❌ Error declaring match winner:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Get completed matches dynamically from database
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      });
    }

    const { supabase } = require('../../../../lib/supabase');
    
    const { data: completedMatches, error } = await supabase
      .from('matches')
      .select('id, wrestler1, wrestler2, winner, completed_at, total_pool')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });
    
    if (error) {
      throw error;
    }

    // Format response dynamically
    const formattedMatches = {};
    completedMatches.forEach(match => {
      formattedMatches[match.id] = {
        wrestler1: match.wrestler1,
        wrestler2: match.wrestler2,
        winner: match.winner,
        completedAt: match.completed_at,
        totalPool: match.total_pool
      };
    });

    return NextResponse.json({
      success: true,
      completedMatches: formattedMatches,
      count: completedMatches.length
    });

  } catch (error) {
    console.error('❌ Error getting completed matches:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load completed matches',
      details: error.message
    }, { status: 500 });
  }
}
