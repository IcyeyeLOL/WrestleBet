// Test Betting Flow - Run in Browser Console
// This will test the complete betting flow and percentage updates

console.log('🧪 Testing betting flow and percentage updates...');

// First, let's check the current match data
fetch('/api/votes')
  .then(response => response.json())
  .then(data => {
    console.log('📊 Current matches:', data);
    
    if (data.success && data.matches && data.matches.length > 0) {
      const testMatch = data.matches[0]; // Use first available match
      console.log(`\n🎯 Testing with match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
      console.log(`📋 Match ID: ${testMatch.id}`);
      console.log(`💰 Current pool: ${testMatch.total_pool || 0} WC`);
      console.log(`🎲 Current odds: ${testMatch.odds_wrestler1} / ${testMatch.odds_wrestler2}`);
      
      // Test placing a bet
      console.log('\n🔄 Placing test bet...');
      
      fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'test-user',
          matchId: testMatch.id,
          wrestlerChoice: 'wrestler1', // Bet on first wrestler
          betAmount: 100,
          odds: 2.0
        })
      })
      .then(response => response.json())
      .then(betResult => {
        console.log('\n💰 Bet result:', betResult);
        
        if (betResult.success) {
          console.log('✅ Bet placed successfully!');
          console.log('🆕 New odds:', betResult.newOdds);
          console.log('📊 Wrestler totals:', betResult.wrestlerTotals);
          
          // Now check if the match data has been updated
          setTimeout(() => {
            console.log('\n🔍 Checking updated match data...');
            
            fetch('/api/votes')
              .then(response => response.json())
              .then(updatedData => {
                if (updatedData.success && updatedData.matches) {
                  const updatedMatch = updatedData.matches.find(m => m.id === testMatch.id);
                  
                  if (updatedMatch) {
                    console.log('📊 Updated match data:');
                    console.log(`  - Total pool: ${updatedMatch.total_pool} WC (was: ${testMatch.total_pool || 0})`);
                    console.log(`  - Odds wrestler1: ${updatedMatch.odds_wrestler1} (was: ${testMatch.odds_wrestler1})`);
                    console.log(`  - Odds wrestler2: ${updatedMatch.odds_wrestler2} (was: ${testMatch.odds_wrestler2})`);
                    
                    // Calculate expected percentages
                    const totalPool = updatedMatch.total_pool || 0;
                    const odds1 = parseFloat(updatedMatch.odds_wrestler1) || 1.0;
                    const odds2 = parseFloat(updatedMatch.odds_wrestler2) || 1.0;
                    
                    const percentage1 = Math.round((1 / odds1) * 100);
                    const percentage2 = Math.round((1 / odds2) * 100);
                    
                    console.log('📊 Expected percentages:');
                    console.log(`  - ${updatedMatch.wrestler1}: ${percentage1}%`);
                    console.log(`  - ${updatedMatch.wrestler2}: ${percentage2}%`);
                    
                    if (totalPool > testMatch.total_pool) {
                      console.log('✅ SUCCESS: Match data updated correctly!');
                      console.log('🔄 The percentages and bars should now update in the UI');
                    } else {
                      console.log('❌ ISSUE: Match data not updated properly');
                    }
                  } else {
                    console.log('❌ Could not find updated match');
                  }
                }
              })
              .catch(error => {
                console.error('Error checking updated data:', error);
              });
          }, 1000); // Wait 1 second for database to update
          
        } else {
          console.log('❌ Bet failed:', betResult.error);
        }
      })
      .catch(error => {
        console.error('❌ Error placing bet:', error);
      });
      
    } else {
      console.log('❌ No matches found to test with');
    }
  })
  .catch(error => {
    console.error('❌ Error fetching matches:', error);
  });

console.log('🔄 Test initiated - check console output above');
