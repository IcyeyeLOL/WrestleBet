// COMPLETE BETTING SYSTEM DEPLOYMENT
// This script contains all the fixes needed for the betting system

console.log('🚀 COMPLETE BETTING SYSTEM DEPLOYMENT');
console.log('=====================================');

// Instructions:
// 1. First deploy the database schema in Supabase
// 2. Then refresh your frontend
// 3. Test betting functionality

console.log('📋 STEP 1: Deploy Database Schema');
console.log('Go to Supabase SQL Editor and run FIX_USERID_TYPE.sql');
console.log('This will:');
console.log('  ✅ Fix user_id type (TEXT instead of UUID)');
console.log('  ✅ Add wrestler1_pool and wrestler2_pool columns');
console.log('  ✅ Fix trigger function variable conflicts');
console.log('  ✅ Create proper percentage calculation support');

console.log('\n📋 STEP 2: Test the Fixed System');
console.log('After running the SQL script, test with this:');

async function testFixedBettingSystem() {
  try {
    console.log('🔄 Testing fixed betting system...');
    
    // Get initial data
    const initialResponse = await fetch('/api/votes');
    const initialData = await initialResponse.json();
    
    if (!initialData.success || !initialData.matches) {
      console.log('❌ Failed to get match data');
      return;
    }
    
    const testMatch = initialData.matches[0];
    console.log(`✅ Testing with match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
    
    // Place a test bet
    const testBet = {
      userId: 'test-user-' + Date.now(),
      matchId: testMatch.id,
      wrestlerChoice: 'wrestler1',
      betAmount: 50,
      odds: 1.1
    };
    
    console.log('💰 Placing test bet...', testBet);
    
    const betResponse = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBet)
    });
    
    const betResult = await betResponse.json();
    
    if (betResult.success) {
      console.log('✅ Bet placed successfully!');
      console.log('📊 Response:', betResult);
      
      // Wait and check for updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedResponse = await fetch('/api/votes');
      const updatedData = await updatedResponse.json();
      
      if (updatedData.success) {
        const updatedMatch = updatedData.matches.find(m => m.id === testMatch.id);
        
        if (updatedMatch) {
          console.log('📈 UPDATED MATCH DATA:');
          console.log('  Total Pool:', updatedMatch.total_pool || 0, 'WC');
          console.log('  Wrestler1 Pool:', updatedMatch.wrestler1_pool || 0, 'WC');
          console.log('  Wrestler2 Pool:', updatedMatch.wrestler2_pool || 0, 'WC');
          console.log('  Odds 1:', updatedMatch.odds_wrestler1);
          console.log('  Odds 2:', updatedMatch.odds_wrestler2);
          
          // Calculate percentages
          const w1Pool = parseFloat(updatedMatch.wrestler1_pool) || 0;
          const w2Pool = parseFloat(updatedMatch.wrestler2_pool) || 0;
          const total = w1Pool + w2Pool;
          
          if (total > 0) {
            const w1Percent = Math.round((w1Pool / total) * 100);
            const w2Percent = Math.round((w2Pool / total) * 100);
            
            console.log('📊 CALCULATED PERCENTAGES:');
            console.log(`  ${testMatch.wrestler1}: ${w1Percent}%`);
            console.log(`  ${testMatch.wrestler2}: ${w2Percent}%`);
            console.log(`  Total: ${w1Percent + w2Percent}%`);
            
            if (w1Percent + w2Percent === 100) {
              console.log('✅ SUCCESS: Percentages add up to 100%!');
            } else {
              console.log('⚠️ Warning: Percentages don\'t add up to 100%');
            }
          }
        }
      }
      
    } else {
      console.log('❌ Bet failed:', betResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('\n📋 STEP 3: Run Test');
console.log('Copy and paste this command after deploying the database:');
console.log('testFixedBettingSystem()');

console.log('\n🎯 EXPECTED RESULTS:');
console.log('✅ Bets save successfully');
console.log('✅ Percentages calculated correctly');
console.log('✅ Both percentages add up to 100%');
console.log('✅ Real-time updates work');
console.log('✅ Pool amounts stored correctly');

// Export the test function to global scope
window.testFixedBettingSystem = testFixedBettingSystem;
