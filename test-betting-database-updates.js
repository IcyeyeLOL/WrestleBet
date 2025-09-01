// BETTING DATABASE UPDATE TEST - Run in Browser Console
// This will test if bets are actually being saved to the database

console.log('🔍 TESTING BETTING DATABASE UPDATES...');
console.log('=====================================');

async function testBettingDatabaseUpdates() {
  try {
    // Step 1: Get current matches
    console.log('📊 Step 1: Getting current matches...');
    const matchesResponse = await fetch('/api/votes');
    const matchesData = await matchesResponse.json();
    
    if (!matchesData.success || !matchesData.matches || matchesData.matches.length === 0) {
      console.log('❌ No matches found to test with');
      return;
    }
    
    const testMatch = matchesData.matches[0];
    console.log(`✅ Testing with match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
    console.log(`📋 Match ID: ${testMatch.id}`);
    console.log(`💰 Current total_pool: ${testMatch.total_pool || 0}`);
    
    // Step 2: Check current bets in database
    console.log('\n📊 Step 2: Checking current bets in database...');
    const { data: currentBets, error: betsError } = await window.supabase
      .from('bets')
      .select('*')
      .eq('match_id', testMatch.id);
    
    if (betsError) {
      console.error('❌ Error fetching bets:', betsError);
    } else {
      console.log(`📋 Current bets for this match: ${currentBets?.length || 0}`);
      console.log('Current bets:', currentBets);
    }
    
    // Step 3: Place a test bet
    console.log('\n💰 Step 3: Placing test bet...');
    const testBet = {
      userId: 'test-user-' + Date.now(),
      matchId: testMatch.id,
      wrestlerChoice: 'wrestler2', // Bet on wrestler2
      betAmount: 50,
      odds: 2.0
    };
    
    console.log('🔄 Sending bet:', testBet);
    
    const betResponse = await fetch('/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBet)
    });
    
    const betResult = await betResponse.json();
    console.log('📡 Bet API Response:', betResult);
    
    if (betResult.success) {
      console.log('✅ BET API SUCCESSFUL!');
      console.log('🆕 New odds:', betResult.newOdds);
      console.log('📊 Wrestler totals:', betResult.wrestlerTotals);
      
      // Step 4: Check if bet was actually saved to database
      console.log('\n🔍 Step 4: Verifying bet was saved to database...');
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const { data: updatedBets, error: updatedBetsError } = await window.supabase
        .from('bets')
        .select('*')
        .eq('match_id', testMatch.id);
      
      if (updatedBetsError) {
        console.error('❌ Error fetching updated bets:', updatedBetsError);
      } else {
        console.log(`📋 Updated bets for this match: ${updatedBets?.length || 0}`);
        console.log('Updated bets:', updatedBets);
        
        if (updatedBets && updatedBets.length > (currentBets?.length || 0)) {
          console.log('✅ SUCCESS: Bet was saved to database!');
          
          // Step 5: Check if match was updated
          console.log('\n📊 Step 5: Checking if match was updated...');
          
          const { data: updatedMatch, error: matchError } = await window.supabase
            .from('matches')
            .select('*')
            .eq('id', testMatch.id)
            .single();
          
          if (matchError) {
            console.error('❌ Error fetching updated match:', matchError);
          } else {
            console.log('📊 Updated match data:', updatedMatch);
            console.log(`💰 New total_pool: ${updatedMatch.total_pool} (was: ${testMatch.total_pool || 0})`);
            console.log(`🎲 New odds: ${updatedMatch.odds_wrestler1} / ${updatedMatch.odds_wrestler2}`);
            
            if (updatedMatch.total_pool > (testMatch.total_pool || 0)) {
              console.log('✅ SUCCESS: Match pools were updated!');
              console.log('🎯 DATABASE INTEGRATION IS WORKING CORRECTLY');
              console.log('🔍 Issue is likely in frontend real-time sync');
            } else {
              console.log('❌ ISSUE: Match pools were not updated');
              console.log('🔍 Problem might be in the API route or database triggers');
            }
          }
          
        } else {
          console.log('❌ ISSUE: Bet was not saved to database');
          console.log('🔍 Problem is in the /api/bets route');
        }
      }
      
    } else {
      console.log('❌ BET API FAILED:', betResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testBettingDatabaseUpdates();

console.log('\n🎯 TEST COMPLETE - Check results above');
console.log('=====================================');
