// Test Betting Sync Integration
// This file helps test the betting data sync between front page and betting page

console.log('🎯 Testing Betting Sync Integration');
console.log('===================================');

// Test 1: Check if betting data is being tracked
function testBettingDataTracking() {
  console.log('\n📊 Test 1: Betting Data Tracking');
  console.log('--------------------------------');
  
  const bets = localStorage.getItem('wrestlebet_bets');
  const stats = localStorage.getItem('wrestlebet_stats');
  
  if (bets) {
    const parsedBets = JSON.parse(bets);
    console.log(`✅ Found ${parsedBets.length} bets in localStorage:`, parsedBets);
  } else {
    console.log('❌ No bets found in localStorage');
  }
  
  if (stats) {
    const parsedStats = JSON.parse(stats);
    console.log('✅ Found betting stats:', parsedStats);
  } else {
    console.log('❌ No betting stats found');
  }
}

// Test 2: Simulate placing a bet
function simulatePlaceBet() {
  console.log('\n🎲 Test 2: Simulate Placing Bet');
  console.log('-------------------------------');
  
  const testBet = {
    id: Date.now(),
    matchId: 'taylor-yazdani',
    match: 'David Taylor vs. Hassan Yazdani',
    event: 'World Wrestling Championships 2025',
    weight: '86kg Final',
    bet: 'taylor to win',
    wrestler: 'taylor',
    amount: 50,
    odds: '1.85',
    potential: (50 * 1.85).toFixed(2),
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    result: 'Pending'
  };
  
  // Add to existing bets
  const existingBets = JSON.parse(localStorage.getItem('wrestlebet_bets') || '[]');
  const updatedBets = [...existingBets, testBet];
  localStorage.setItem('wrestlebet_bets', JSON.stringify(updatedBets));
  
  // Update stats
  const stats = {
    totalBets: updatedBets.length,
    wonBets: updatedBets.filter(bet => bet.status === 'won').length,
    lostBets: updatedBets.filter(bet => bet.status === 'lost').length,
    pendingBets: updatedBets.filter(bet => bet.status === 'pending').length,
    totalWinnings: updatedBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + (parseFloat(bet.potential) - bet.amount), 0),
    totalSpent: updatedBets.reduce((sum, bet) => sum + bet.amount, 0),
    winRate: 0
  };
  
  const completedBets = stats.wonBets + stats.lostBets;
  stats.winRate = completedBets > 0 ? Math.round((stats.wonBets / completedBets) * 100) : 0;
  
  localStorage.setItem('wrestlebet_stats', JSON.stringify(stats));
  
  console.log('✅ Test bet placed:', testBet);
  console.log('✅ Updated stats:', stats);
}

// Test 3: Simulate bet results
function simulateBetResults() {
  console.log('\n🏆 Test 3: Simulate Bet Results');
  console.log('-------------------------------');
  
  const bets = JSON.parse(localStorage.getItem('wrestlebet_bets') || '[]');
  if (bets.length === 0) {
    console.log('❌ No bets to simulate results for');
    return;
  }
  
  // Make the first pending bet a winner
  const pendingBets = bets.filter(bet => bet.status === 'pending');
  if (pendingBets.length > 0) {
    const winningBet = pendingBets[0];
    winningBet.status = 'won';
    winningBet.result = `Won ${(parseFloat(winningBet.potential) - winningBet.amount).toFixed(2)} WC`;
    
    console.log('✅ Simulated winning bet:', winningBet);
  }
  
  // Save updated bets
  localStorage.setItem('wrestlebet_bets', JSON.stringify(bets));
  
  // Recalculate stats
  const stats = {
    totalBets: bets.length,
    wonBets: bets.filter(bet => bet.status === 'won').length,
    lostBets: bets.filter(bet => bet.status === 'lost').length,
    pendingBets: bets.filter(bet => bet.status === 'pending').length,
    totalWinnings: bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + (parseFloat(bet.potential) - bet.amount), 0),
    totalSpent: bets.reduce((sum, bet) => sum + bet.amount, 0),
    winRate: 0
  };
  
  const completedBets = stats.wonBets + stats.lostBets;
  stats.winRate = completedBets > 0 ? Math.round((stats.wonBets / completedBets) * 100) : 0;
  
  localStorage.setItem('wrestlebet_stats', JSON.stringify(stats));
  console.log('✅ Updated stats after win:', stats);
}

// Test 4: Clear all betting data
function clearBettingData() {
  console.log('\n🧹 Test 4: Clear Betting Data');
  console.log('-----------------------------');
  
  localStorage.removeItem('wrestlebet_bets');
  localStorage.removeItem('wrestlebet_stats');
  
  console.log('✅ All betting data cleared');
}

// Export test functions
window.BettingSyncTester = {
  testBettingDataTracking,
  simulatePlaceBet,
  simulateBetResults,
  clearBettingData
};

// Auto-run basic test
console.log('\n🚀 Quick Commands:');
console.log('   BettingSyncTester.testBettingDataTracking() - Check current data');
console.log('   BettingSyncTester.simulatePlaceBet() - Add test bet');
console.log('   BettingSyncTester.simulateBetResults() - Simulate winning a bet');
console.log('   BettingSyncTester.clearBettingData() - Clear all betting data');

// Show current status
testBettingDataTracking();
