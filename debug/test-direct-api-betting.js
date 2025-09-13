// DIRECT API BETTING TEST - Run in Browser Console
// This will test the betting API directly and show all responses

console.log('🧪 DIRECT API BETTING TEST');
console.log('=========================');

async function testBettingAPI() {
  try {
    // Step 1: Get match ID from current page
    console.log('📊 Step 1: Getting match ID...');
    
    const matchId = '391f7afb-4d6d-4c02-82cb-10288243578b'; // From your console log
    console.log('✅ Using match ID:', matchId);
    
    // Step 2: Test the betting API directly
    console.log('\n💰 Step 2: Testing betting API...');
    
    const testBet = {
      userId: 'test-user-direct-api',
      matchId: matchId,
      wrestlerChoice: 'wrestler2', // Bet on wrestler2 
      betAmount: 100,
      odds: 2.0
    };
    
    console.log('🔄 Sending bet request:', testBet);
    
    const response = await fetch('/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBet)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📊 API Response:', result);
    
    if (result.success) {
      console.log('✅ API CALL SUCCESSFUL!');
      console.log('💰 Bet data:', result.bet);
      console.log('🎲 New odds:', result.newOdds);
      console.log('📊 Wrestler totals:', result.wrestlerTotals);
      
      // Step 3: Check if the match was updated in database
      console.log('\n🔍 Step 3: Checking match update in database...');
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      // Check via votes API (which includes match data)
      const matchResponse = await fetch('/api/votes');
      const matchData = await matchResponse.json();
      
      if (matchData.success && matchData.matches) {
        const updatedMatch = matchData.matches.find(m => m.id === matchId);
        if (updatedMatch) {
          console.log('📊 Updated match from database:', updatedMatch);
          console.log(`💰 Total pool: ${updatedMatch.total_pool} (should be > 0)`);
          console.log(`🎲 Odds: ${updatedMatch.odds_wrestler1} / ${updatedMatch.odds_wrestler2}`);
          
          if (updatedMatch.total_pool > 0) {
            console.log('✅ SUCCESS: Match was updated in database!');
            console.log('🎯 Problem is likely in frontend refresh timing');
          } else {
            console.log('❌ ISSUE: Match total_pool is still 0');
            console.log('🔍 Database update failed or not triggered');
          }
        } else {
          console.log('❌ Could not find updated match');
        }
      } else {
        console.log('❌ Could not fetch updated match data');
      }
      
    } else {
      console.log('❌ API CALL FAILED:', result.error);
      
      if (result.error && result.error.includes('Demo mode')) {
        console.log('⚠️ Running in demo mode - check Supabase configuration');
      }
    }
    
    // Step 4: Check if any bets exist in database
    console.log('\n📋 Step 4: Checking all bets in database...');
    
    if (window.supabase) {
      const { data: allBets, error } = await window.supabase
        .from('bets')
        .select('*')
        .eq('match_id', matchId);
      
      if (error) {
        console.error('❌ Error fetching bets:', error);
      } else {
        console.log(`📊 Total bets for this match: ${allBets?.length || 0}`);
        console.log('Bets:', allBets);
        
        if (allBets && allBets.length > 0) {
          const totalAmount = allBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
          console.log(`💰 Total bet amount: ${totalAmount} WC`);
        }
      }
    } else {
      console.log('⚠️ Supabase client not available for direct query');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBettingAPI();

console.log('\n🎯 CHECK RESULTS ABOVE');
console.log('======================');
