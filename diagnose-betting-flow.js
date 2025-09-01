// DIAGNOSE BETTING DATA FLOW - Run in Browser Console
// This will show exactly what data is being used for calculations

console.log('🔍 BETTING DATA FLOW DIAGNOSIS');
console.log('==============================');

async function diagnoseBettingDataFlow() {
  try {
    console.log('📡 Step 1: Fetch match data from API...');
    
    const response = await fetch('/api/votes');
    const data = await response.json();
    
    if (!data.success || !data.matches) {
      console.log('❌ Failed to get match data:', data);
      return;
    }
    
    const firstMatch = data.matches[0];
    console.log('\n📊 MATCH DATA STRUCTURE:');
    console.log('All available columns:', Object.keys(firstMatch));
    
    console.log('\n🎯 BETTING COLUMNS (New):');
    console.log('wrestler1_pool:', firstMatch.wrestler1_pool, '(should show actual bet amounts)');
    console.log('wrestler2_pool:', firstMatch.wrestler2_pool, '(should show actual bet amounts)');
    console.log('total_pool:', firstMatch.total_pool, '(should be sum of above)');
    
    console.log('\n🎲 ODDS COLUMNS:');
    console.log('odds_wrestler1:', firstMatch.odds_wrestler1);
    console.log('odds_wrestler2:', firstMatch.odds_wrestler2);
    
    // Test the frontend calculation
    console.log('\n🧮 FRONTEND CALCULATION TEST:');
    
    const wrestler1Pool = parseFloat(firstMatch.wrestler1_pool) || 0;
    const wrestler2Pool = parseFloat(firstMatch.wrestler2_pool) || 0;
    const totalPool = wrestler1Pool + wrestler2Pool;
    
    console.log('Parsed pools:', {
      wrestler1Pool,
      wrestler2Pool,
      totalPool
    });
    
    if (totalPool === 0) {
      console.log('⚠️ NO BETS DETECTED: All pools are 0');
      console.log('🔍 This means either:');
      console.log('  1. Database schema not deployed (new columns missing)');
      console.log('  2. Triggers not working (bets not updating match table)');
      console.log('  3. No bets actually placed yet');
    } else {
      const w1Percent = Math.round((wrestler1Pool / totalPool) * 100);
      const w2Percent = Math.round((wrestler2Pool / totalPool) * 100);
      
      console.log('📊 CALCULATED PERCENTAGES:');
      console.log(`${firstMatch.wrestler1}: ${w1Percent}%`);
      console.log(`${firstMatch.wrestler2}: ${w2Percent}%`);
      console.log(`Total: ${w1Percent + w2Percent}%`);
      
      console.log('\n✅ EXPECTED vs ACTUAL:');
      console.log('Expected: Percentages based on actual bet amounts');
      console.log('Actual: Check if the bar and percentages match above');
    }
    
    // Check if new columns exist
    if (firstMatch.wrestler1_pool === undefined && firstMatch.wrestler2_pool === undefined) {
      console.log('\n❌ PROBLEM IDENTIFIED: NEW COLUMNS MISSING');
      console.log('🚨 Solution: Deploy FIX_USERID_TYPE.sql in Supabase SQL Editor');
      console.log('The database doesn\'t have the new columns needed for proper calculations.');
    } else if (totalPool === 0) {
      console.log('\n❌ PROBLEM IDENTIFIED: COLUMNS EXIST BUT NO DATA');
      console.log('🚨 Solution: Check if triggers are working or place a test bet');
    } else {
      console.log('\n✅ DATABASE STRUCTURE LOOKS GOOD');
      console.log('The issue might be in the frontend calculation or display logic');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

// Run the diagnosis
diagnoseBettingDataFlow();

console.log('\n📋 NEXT STEPS:');
console.log('1. Run this diagnosis');
console.log('2. If "NEW COLUMNS MISSING" - deploy the SQL script');
console.log('3. If "NO DATA" - check triggers or place a test bet');
console.log('4. If data exists but UI is wrong - check frontend logic');
