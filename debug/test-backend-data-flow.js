// BACKEND DATA FLOW TEST - Run in Browser Console
// This will test if the backend is updating data correctly

console.log('🔄 BACKEND DATA FLOW TEST');
console.log('==========================');

async function testBackendDataFlow() {
  try {
    console.log('📊 Step 1: Check initial match data...');
    
    const initialResponse = await fetch('/api/votes');
    const initialData = await initialResponse.json();
    
    if (!initialData.success || !initialData.matches) {
      console.log('❌ Failed to get initial match data');
      return;
    }
    
    const testMatch = initialData.matches[0];
    if (!testMatch) {
      console.log('❌ No matches found');
      return;
    }
    
    console.log(`✅ Found test match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
    console.log('📊 Initial match data:', {
      total_pool: testMatch.total_pool,
      odds_wrestler1: testMatch.odds_wrestler1,
      odds_wrestler2: testMatch.odds_wrestler2
    });
    
    console.log('\n💰 Step 2: Placing test bet via API...');
    
    const testBet = {
      userId: 'test-user-' + Date.now(), // Use simple string ID
      matchId: testMatch.id,
      wrestlerChoice: 'wrestler2', // Bet on wrestler2
      betAmount: 50,
      odds: 1.1 // Use minimum valid odds
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
    console.log('📡 Bet response:', betResult);
    
    if (betResult.success) {
      console.log('✅ Bet placed successfully!');
      console.log('💰 Response data:', {
        newOdds: betResult.newOdds,
        wrestlerTotals: betResult.wrestlerTotals,
        totalPool: betResult.totalPool
      });
      
      console.log('\n🔍 Step 3: Wait and check if match data was updated...');
      
      // Wait 3 seconds for database update
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedResponse = await fetch('/api/votes');
      const updatedData = await updatedResponse.json();
      
      if (updatedData.success) {
        const updatedMatch = updatedData.matches.find(m => m.id === testMatch.id);
        
        if (updatedMatch) {
          console.log('📊 Updated match data:', {
            total_pool: updatedMatch.total_pool,
            odds_wrestler1: updatedMatch.odds_wrestler1,
            odds_wrestler2: updatedMatch.odds_wrestler2
          });
          
          console.log('\n📈 COMPARISON:');
          console.log(`Total Pool: ${testMatch.total_pool || 0} → ${updatedMatch.total_pool || 0}`);
          console.log(`Odds 1: ${testMatch.odds_wrestler1} → ${updatedMatch.odds_wrestler1}`);
          console.log(`Odds 2: ${testMatch.odds_wrestler2} → ${updatedMatch.odds_wrestler2}`);
          
          if (updatedMatch.total_pool > (testMatch.total_pool || 0)) {
            console.log('✅ SUCCESS: Backend is updating data correctly!');
            console.log('🔍 Issue is likely in frontend real-time sync or data fetching');
          } else {
            console.log('❌ ISSUE: Backend is not updating match data');
            console.log('🔍 Problem is in the API bet processing or database triggers');
          }
        } else {
          console.log('❌ Could not find updated match');
        }
      } else {
        console.log('❌ Failed to fetch updated data');
      }
      
    } else {
      console.log('❌ Bet failed:', betResult.error);
    }
    
    console.log('\n🔍 Step 4: Check Supabase direct query...');
    
    if (window.supabase) {
      // Check bets table directly
      const { data: bets, error: betsError } = await window.supabase
        .from('bets')
        .select('*')
        .eq('match_id', testMatch.id);
      
      if (betsError) {
        console.log('❌ Direct Supabase query failed:', betsError);
      } else {
        console.log(`📊 Direct query found ${bets?.length || 0} bets for this match:`, bets);
        
        if (bets && bets.length > 0) {
          const totalAmount = bets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
          console.log(`💰 Total bet amount from direct query: ${totalAmount} WC`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBackendDataFlow();

console.log('\n🎯 CHECK RESULTS ABOVE');
console.log('========================');
