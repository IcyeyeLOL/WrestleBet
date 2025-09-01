// COMPREHENSIVE BETTING DIAGNOSTIC - Run in Browser Console
// This will test every step of the betting flow to find the exact issue

console.log('🧪 COMPREHENSIVE BETTING DIAGNOSTIC STARTING...');
console.log('=====================================');

// Step 1: Check if we can access the current match
console.log('\n📊 STEP 1: Checking current match data...');

fetch('/api/votes')
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    
    if (data.success && data.matches && data.matches.length > 0) {
      const match = data.matches[0]; // Use the first match
      console.log(`✅ Found match: ${match.wrestler1} vs ${match.wrestler2}`);
      console.log(`📋 Match ID: ${match.id}`);
      console.log(`💰 Current total_pool: ${match.total_pool || 'undefined'}`);
      console.log(`🎲 Current odds: ${match.odds_wrestler1} / ${match.odds_wrestler2}`);
      
      // Step 2: Test the betting API directly
      console.log('\n💰 STEP 2: Testing betting API directly...');
      
      const testBet = {
        userId: 'test-user-diagnostic',
        matchId: match.id, // Use the actual database match ID
        wrestlerChoice: 'wrestler2', // Bet on wrestler2 (Ajani in your case)
        betAmount: 100, // Test with 100 WC
        odds: 2.0
      };
      
      console.log('🔄 Sending bet request:', testBet);
      
      fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testBet)
      })
      .then(response => {
        console.log(`📡 Bet API Response Status: ${response.status}`);
        return response.json();
      })
      .then(betResult => {
        console.log('💰 Bet API Result:', betResult);
        
        if (betResult.success) {
          console.log('✅ BET PLACED SUCCESSFULLY!');
          console.log('🆕 New odds from API:', betResult.newOdds);
          console.log('📊 Wrestler totals from API:', betResult.wrestlerTotals);
          
          // Step 3: Check if the match data was updated in database
          console.log('\n🔍 STEP 3: Checking if match data was updated...');
          
          setTimeout(() => {
            fetch('/api/votes')
              .then(response => response.json())
              .then(updatedData => {
                if (updatedData.success && updatedData.matches) {
                  const updatedMatch = updatedData.matches.find(m => m.id === match.id);
                  
                  if (updatedMatch) {
                    console.log('📊 UPDATED MATCH DATA:');
                    console.log(`  - Total pool: ${updatedMatch.total_pool} (was: ${match.total_pool || 0})`);
                    console.log(`  - Odds wrestler1: ${updatedMatch.odds_wrestler1} (was: ${match.odds_wrestler1})`);
                    console.log(`  - Odds wrestler2: ${updatedMatch.odds_wrestler2} (was: ${match.odds_wrestler2})`);
                    
                    // Calculate what the percentages should be
                    const totalPool = updatedMatch.total_pool || 0;
                    const odds1 = parseFloat(updatedMatch.odds_wrestler1) || 1.0;
                    const odds2 = parseFloat(updatedMatch.odds_wrestler2) || 1.0;
                    
                    const percentage1 = Math.round((1 / odds1) * 100);
                    const percentage2 = Math.round((1 / odds2) * 100);
                    
                    console.log('📊 CALCULATED PERCENTAGES:');
                    console.log(`  - ${updatedMatch.wrestler1}: ${percentage1}%`);
                    console.log(`  - ${updatedMatch.wrestler2}: ${percentage2}%`);
                    
                    if (totalPool > match.total_pool) {
                      console.log('✅ SUCCESS: Database was updated!');
                      
                      // Step 4: Check if frontend should update
                      console.log('\n🎨 STEP 4: Frontend should now update...');
                      console.log('🔄 If the UI is not updating, there may be a frontend sync issue');
                      console.log('📱 Check if real-time subscriptions are working');
                      
                    } else {
                      console.log('❌ ISSUE: Database was not updated properly');
                      console.log('🔍 This suggests a problem with the betting API');
                    }
                    
                  } else {
                    console.log('❌ Could not find updated match in response');
                  }
                } else {
                  console.log('❌ Could not fetch updated match data');
                }
              })
              .catch(error => {
                console.error('❌ Error fetching updated data:', error);
              });
          }, 2000); // Wait 2 seconds for database update
          
        } else {
          console.log('❌ BET FAILED:', betResult.error);
          
          // Check if it's a demo mode issue
          if (betResult.error && betResult.error.includes('Demo mode')) {
            console.log('⚠️ POSSIBLE ISSUE: Running in demo mode - check Supabase configuration');
          }
        }
      })
      .catch(error => {
        console.error('❌ Bet API request failed:', error);
        console.log('🔍 This suggests a network or API endpoint issue');
      });
      
    } else {
      console.log('❌ No matches found to test with');
      console.log('🔍 Create a match first through the admin panel');
    }
  })
  .catch(error => {
    console.error('❌ Failed to fetch initial match data:', error);
  });

// Step 5: Check browser console for real-time updates
console.log('\n📡 STEP 5: Watch for real-time update messages...');
console.log('Look for these messages in console:');
console.log('  - "🔄 Syncing bet to database..."');
console.log('  - "✅ Bet synced to global database"');  
console.log('  - "🔄 Real-time bet update"');
console.log('  - "💰 Real-time betting update"');

console.log('\n🎯 DIAGNOSTIC COMPLETE - Check results above');
console.log('=====================================');
