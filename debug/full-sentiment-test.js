// Add Test Matches and Test Dynamic Sentiment
// Run this script to set up test data and verify dynamic sentiment works

const testData = {
  matches: [
    {
      wrestler1: 'John Cena',
      wrestler2: 'The Rock',
      event: 'WrestleMania Test',
      eventDate: new Date().toISOString(),
      status: 'active'
    },
    {
      wrestler1: 'Stone Cold',
      wrestler2: 'The Undertaker',
      event: 'Raw Test Event',
      eventDate: new Date().toISOString(), 
      status: 'active'
    }
  ]
};

async function setupTestData() {
  console.log('🔧 Setting up test data for dynamic sentiment...');
  
  try {
    // Add test matches
    for (const matchData of testData.matches) {
      console.log(`\n📝 Creating match: ${matchData.wrestler1} vs ${matchData.wrestler2}`);
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      
      const result = await response.json();
      if (result.success) {
        console.log(`✅ Match created with ID: ${result.match.id}`);
      } else {
        console.log(`⚠️ Match creation failed: ${result.error}`);
      }
    }
    
    console.log('\n🎯 Test data setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

async function testDynamicSentiment() {
  console.log('\n🧪 Testing dynamic sentiment system...');
  
  try {
    // Get matches
    const matchesResponse = await fetch('/api/admin/matches');
    const matchesResult = await matchesResponse.json();
    
    if (!matchesResult.success || !matchesResult.matches.length) {
      console.log('❌ No matches found for testing');
      return;
    }
    
    const testMatch = matchesResult.matches[0];
    console.log(`\n🥊 Testing with: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
    console.log(`📊 Current pools: W1=${testMatch.wrestler1_pool || 0}, W2=${testMatch.wrestler2_pool || 0}`);
    
    // Place test bets to create sentiment
    const testBets = [
      { wrestlerChoice: 'wrestler1', betAmount: 20 },
      { wrestlerChoice: 'wrestler2', betAmount: 5 },
      { wrestlerChoice: 'wrestler1', betAmount: 15 }
    ];
    
    for (let i = 0; i < testBets.length; i++) {
      const bet = testBets[i];
      console.log(`\n💰 Placing bet ${i + 1}: ${bet.betAmount} WC on ${bet.wrestlerChoice}`);
      
      const betResponse = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: `test-user-${Date.now()}-${i}`,
          matchId: testMatch.id,
          wrestlerChoice: bet.wrestlerChoice,
          betAmount: bet.betAmount,
          odds: 2.0
        })
      });
      
      const betResult = await betResponse.json();
      if (betResult.success) {
        console.log(`✅ Bet placed! New pools:`, betResult.pools);
      } else {
        console.log(`❌ Bet failed:`, betResult.error);
      }
      
      // Wait a moment between bets
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const finalResponse = await fetch('/api/admin/matches');
    const finalResult = await finalResponse.json();
    
    if (finalResult.success) {
      const finalMatch = finalResult.matches.find(m => m.id === testMatch.id);
      if (finalMatch) {
        const w1Pool = finalMatch.wrestler1_pool || 0;
        const w2Pool = finalMatch.wrestler2_pool || 0;
        const total = w1Pool + w2Pool;
        
        console.log(`\n📊 Final state:`);
        console.log(`   ${finalMatch.wrestler1}: ${w1Pool} WC (${total > 0 ? Math.round((w1Pool/total)*100) : 50}%)`);
        console.log(`   ${finalMatch.wrestler2}: ${w2Pool} WC (${total > 0 ? Math.round((w2Pool/total)*100) : 50}%)`);
        
        if (total > 0 && (w1Pool !== w2Pool)) {
          console.log('🎉 SUCCESS: Dynamic sentiment is working! Pools are different.');
          console.log('💡 Refresh the page to see the sentiment bars update!');
        } else {
          console.log('⚠️ Pools are still equal - may need more testing');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run
async function runFullTest() {
  await setupTestData();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for data to settle
  await testDynamicSentiment();
  
  console.log('\n🎯 Test complete! Check the frontend for updated sentiment bars.');
  console.log('📝 The sentiment bars should now show percentages based on betting amounts.');
}

// Make available globally
if (typeof window !== 'undefined') {
  window.setupTestData = setupTestData;
  window.testDynamicSentiment = testDynamicSentiment;
  window.runFullTest = runFullTest;
  
  console.log('🛠️ Available functions:');
  console.log('- setupTestData() - Add test matches');
  console.log('- testDynamicSentiment() - Test sentiment updates');
  console.log('- runFullTest() - Run complete test');
  
  // Auto-run the full test
  runFullTest();
}
