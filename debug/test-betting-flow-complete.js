/**
 * COMPREHENSIVE BETTING SYSTEM TEST
 * This script tests the entire betting flow from placing bets to updating pools
 */

console.log('🧪 COMPREHENSIVE BETTING SYSTEM TEST');
console.log('=====================================');

const testBettingSystem = async () => {
  // Step 1: Check if we have valid matches
  console.log('\n📋 STEP 1: Checking for valid matches...');
  
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .in('status', ['active', 'upcoming']);

  if (matchError) {
    console.error('❌ Error loading matches:', matchError);
    return;
  }

  if (!matches || matches.length === 0) {
    console.log('⚠️ No matches found. Create a match in the admin panel first.');
    console.log('🔗 Go to: /admin');
    return;
  }

  console.log(`✅ Found ${matches.length} matches:`, matches.map(m => ({
    id: m.id,
    wrestlers: `${m.wrestler1} vs ${m.wrestler2}`,
    current_pool: m.total_pool || 0,
    odds: `${m.odds_wrestler1 || 'N/A'} / ${m.odds_wrestler2 || 'N/A'}`
  })));

  // Step 2: Test betting on the first match
  const testMatch = matches[0];
  console.log(`\n💰 STEP 2: Testing bet on match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
  
  const testBet = {
    userId: 'test-user-' + Date.now(),
    matchId: testMatch.id,
    wrestlerChoice: 'wrestler1', // Bet on wrestler1
    betAmount: 25,
    odds: 1.50
  };

  console.log('🎯 Placing test bet:', testBet);

  try {
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBet)
    });

    const result = await response.json();
    console.log('📤 Bet API response:', result);

    if (!result.success) {
      console.error('❌ Bet placement failed:', result.error);
      return;
    }

    // Step 3: Check if match was updated
    console.log('\n🔄 STEP 3: Checking if match was updated...');
    
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', testMatch.id)
      .single();

    if (updateError) {
      console.error('❌ Error checking updated match:', updateError);
      return;
    }

    console.log('📊 Updated match data:', {
      id: updatedMatch.id,
      wrestlers: `${updatedMatch.wrestler1} vs ${updatedMatch.wrestler2}`,
      total_pool: updatedMatch.total_pool,
      odds_wrestler1: updatedMatch.odds_wrestler1,
      odds_wrestler2: updatedMatch.odds_wrestler2,
      old_pool: testMatch.total_pool,
      pool_change: (updatedMatch.total_pool || 0) - (testMatch.total_pool || 0)
    });

    // Step 4: Verify bet was recorded
    console.log('\n📝 STEP 4: Verifying bet was recorded...');
    
    const { data: recordedBets, error: betError } = await supabase
      .from('bets')
      .select('*')
      .eq('match_id', testMatch.id)
      .eq('user_id', testBet.userId);

    if (betError) {
      console.error('❌ Error checking recorded bets:', betError);
      return;
    }

    console.log('💸 Recorded bets for this user/match:', recordedBets);

    // Step 5: Test pool calculation
    console.log('\n🧮 STEP 5: Testing pool calculations...');
    
    const { data: allBets, error: allBetsError } = await supabase
      .from('bets')
      .select('wrestler_choice, amount')
      .eq('match_id', testMatch.id)
      .eq('status', 'pending');

    if (allBetsError) {
      console.error('❌ Error getting all bets:', allBetsError);
      return;
    }

    const wrestler1Pool = allBets
      .filter(bet => bet.wrestler_choice === 'wrestler1')
      .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
    
    const wrestler2Pool = allBets
      .filter(bet => bet.wrestler_choice === 'wrestler2')
      .reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
    
    const calculatedTotal = wrestler1Pool + wrestler2Pool;

    console.log('📊 Pool calculations:', {
      wrestler1_pool: wrestler1Pool,
      wrestler2_pool: wrestler2Pool,
      calculated_total: calculatedTotal,
      database_total: updatedMatch.total_pool,
      pools_match: calculatedTotal === (updatedMatch.total_pool || 0)
    });

    // Step 6: Calculate expected odds
    console.log('\n🎲 STEP 6: Calculating expected odds...');
    
    const expectedOdds1 = wrestler1Pool > 0 ? Math.max(1.10, calculatedTotal / wrestler1Pool) : 1.10;
    const expectedOdds2 = wrestler2Pool > 0 ? Math.max(1.10, calculatedTotal / wrestler2Pool) : 1.10;

    console.log('🎯 Odds comparison:', {
      wrestler1: {
        expected: expectedOdds1.toFixed(2),
        database: updatedMatch.odds_wrestler1,
        match: Math.abs(expectedOdds1 - parseFloat(updatedMatch.odds_wrestler1 || 0)) < 0.01
      },
      wrestler2: {
        expected: expectedOdds2.toFixed(2), 
        database: updatedMatch.odds_wrestler2,
        match: Math.abs(expectedOdds2 - parseFloat(updatedMatch.odds_wrestler2 || 0)) < 0.01
      }
    });

    // Final results
    console.log('\n🎉 TEST RESULTS SUMMARY:');
    console.log('========================');
    
    const poolsUpdated = (updatedMatch.total_pool || 0) > (testMatch.total_pool || 0);
    const oddsCalculated = updatedMatch.odds_wrestler1 && updatedMatch.odds_wrestler2;
    const betRecorded = recordedBets.length > 0;
    
    console.log(`✅ Bet recorded in database: ${betRecorded}`);
    console.log(`✅ Pool updated (${testMatch.total_pool || 0} → ${updatedMatch.total_pool || 0}): ${poolsUpdated}`);
    console.log(`✅ Odds calculated: ${oddsCalculated}`);
    
    if (poolsUpdated && oddsCalculated && betRecorded) {
      console.log('🎊 SUCCESS: Betting system is working correctly!');
      console.log('💡 You should now see updated pools and percentages in the UI');
    } else {
      console.log('⚠️ ISSUES DETECTED: Some parts of the betting system need attention');
      
      if (!betRecorded) console.log('  - Bets are not being recorded properly');
      if (!poolsUpdated) console.log('  - Match pools are not being updated');
      if (!oddsCalculated) console.log('  - Odds are not being calculated');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Make test function available globally
window.testBettingSystem = testBettingSystem;

console.log('\n💡 USAGE: Run window.testBettingSystem() to test your betting system');
console.log('🎯 This will place a test bet and verify all systems are working');
