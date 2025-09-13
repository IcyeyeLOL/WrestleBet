// QUICK DATABASE TEST - Run in Browser Console
// This will show what data is actually being returned from the API

console.log('🔍 DATABASE COLUMN TEST');
console.log('========================');

async function testDatabaseColumns() {
  try {
    console.log('📡 Fetching match data from API...');
    
    const response = await fetch('/api/votes');
    const data = await response.json();
    
    if (!data.success || !data.matches) {
      console.log('❌ Failed to get match data:', data);
      return;
    }
    
    const firstMatch = data.matches[0];
    console.log('📊 First match data structure:');
    console.log('Available columns:', Object.keys(firstMatch));
    
    console.log('\n🎯 Betting-related columns:');
    console.log('total_pool:', firstMatch.total_pool);
    console.log('wrestler1_pool:', firstMatch.wrestler1_pool);
    console.log('wrestler2_pool:', firstMatch.wrestler2_pool);
    console.log('odds_wrestler1:', firstMatch.odds_wrestler1);
    console.log('odds_wrestler2:', firstMatch.odds_wrestler2);
    
    if (firstMatch.wrestler1_pool !== undefined && firstMatch.wrestler2_pool !== undefined) {
      console.log('✅ NEW COLUMNS EXIST! Database schema is deployed correctly.');
      
      const w1Pool = parseFloat(firstMatch.wrestler1_pool) || 0;
      const w2Pool = parseFloat(firstMatch.wrestler2_pool) || 0;
      const total = w1Pool + w2Pool;
      
      if (total > 0) {
        const w1Percent = Math.round((w1Pool / total) * 100);
        const w2Percent = Math.round((w2Pool / total) * 100);
        
        console.log('\n📊 CALCULATED PERCENTAGES:');
        console.log(`${firstMatch.wrestler1}: ${w1Percent}%`);
        console.log(`${firstMatch.wrestler2}: ${w2Percent}%`);
        console.log(`Total: ${w1Percent + w2Percent}%`);
        
        if (w1Percent + w2Percent === 100) {
          console.log('✅ Percentages add up to 100% - Math is correct!');
        } else {
          console.log('⚠️ Percentages don\'t add up to 100%');
        }
      } else {
        console.log('⚠️ No bets placed yet (pools are 0)');
      }
    } else {
      console.log('❌ NEW COLUMNS MISSING! You need to deploy FIX_USERID_TYPE.sql');
      console.log('Go to Supabase SQL Editor and run the script.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseColumns();

console.log('\n🎯 WHAT TO CHECK:');
console.log('1. If NEW COLUMNS MISSING - deploy FIX_USERID_TYPE.sql in Supabase');
console.log('2. If NEW COLUMNS EXIST but pools are 0 - place a bet to test');
console.log('3. If percentages are wrong - check the frontend calculation');
