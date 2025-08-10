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

    // Get current betting pools and bets from localStorage simulation
    // In a real app, this would come from your database
    const bettingPools = {
      'taylor-yazdani': { wrestler1: 100, wrestler2: 50 },
      'dake-punia': { wrestler1: 75, wrestler2: 125 },
      'steveson-petriashvili': { wrestler1: 30, wrestler2: 80 },
      'chamizo-takahashi': { wrestler1: 60, wrestler2: 90 }
    };

    // Simulate bets from database
    const allBets = [
      { id: '1', matchId: 'taylor-yazdani', wrestler: 'taylor', amount: 50, odds: '2.50', userId: 'user1', status: 'pending' },
      { id: '2', matchId: 'taylor-yazdani', wrestler: 'yazdani', amount: 30, odds: '1.80', userId: 'user2', status: 'pending' },
      { id: '3', matchId: 'dake-punia', wrestler: 'dake', amount: 100, odds: '1.75', userId: 'user3', status: 'pending' },
      { id: '4', matchId: 'steveson-petriashvili', wrestler: 'petriashvili', amount: 75, odds: '1.90', userId: 'user4', status: 'pending' }
    ];

    // Get all bets for this match
    const matchBets = allBets.filter(bet => bet.matchId === matchId && bet.status === 'pending');
    
    if (matchBets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No pending bets found for this match' },
        { status: 400 }
      );
    }

    console.log(`📊 Found ${matchBets.length} pending bets for match ${matchId}`);

    // Calculate payouts
    const payoutResults = [];
    let totalPaidOut = 0;
    
    // Map winner to the correct wrestler key format
    const normalizeWrestlerName = (name) => {
      return name.toLowerCase().replace(/\s+/g, '').split(' ')[0];
    };
    
    const winnerKey = normalizeWrestlerName(winner);
    console.log(`🎯 Winner key normalized: "${winnerKey}"`);

    for (const bet of matchBets) {
      const betWrestlerKey = normalizeWrestlerName(bet.wrestler);
      console.log(`🔍 Checking bet: ${bet.wrestler} (key: ${betWrestlerKey}) vs winner: ${winner} (key: ${winnerKey})`);
      
      if (betWrestlerKey === winnerKey || bet.wrestler.toLowerCase() === winner.toLowerCase()) {
        // WINNER - Calculate payout
        const odds = parseFloat(bet.odds);
        const payout = Math.round(bet.amount * odds * 100) / 100; // Precise calculation
        
        payoutResults.push({
          betId: bet.id,
          userId: bet.userId,
          status: 'won',
          originalAmount: bet.amount,
          odds: bet.odds,
          payout: payout,
          wrestler: bet.wrestler
        });
        
        totalPaidOut += payout;
        console.log(`✅ WINNER: User ${bet.userId} bet ${bet.amount} WC on ${bet.wrestler} at ${bet.odds} odds = ${payout} WC payout`);
      } else {
        // LOSER - No payout
        payoutResults.push({
          betId: bet.id,
          userId: bet.userId,
          status: 'lost',
          originalAmount: bet.amount,
          odds: bet.odds,
          payout: 0,
          wrestler: bet.wrestler
        });
        
        console.log(`❌ LOSER: User ${bet.userId} bet ${bet.amount} WC on ${bet.wrestler} - No payout`);
      }
    }

    // Get pool information for the match
    const pool = bettingPools[matchId];
    const totalPoolValue = pool ? (pool.wrestler1 + pool.wrestler2) : 0;
    
    // Calculate house edge (money not paid out)
    const houseEdge = totalPoolValue - totalPaidOut;
    
    console.log(`💰 Payout Summary:`);
    console.log(`   Total Pool Value: ${totalPoolValue} WC`);
    console.log(`   Total Paid Out: ${totalPaidOut} WC`);
    console.log(`   House Edge: ${houseEdge} WC`);

    // In a real implementation, you would:
    // 1. Update all bet statuses in database
    // 2. Add WC to winners' accounts
    // 3. Create transaction records
    // 4. Mark match as completed
    // 5. Send notifications to users

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
  // Get completed matches
  return NextResponse.json({
    success: true,
    completedMatches: {
      // This would come from your database
      'example-completed': {
        winner: 'Taylor',
        completedAt: new Date().toISOString(),
        totalPayout: 500
      }
    }
  });
}
