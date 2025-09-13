// Debug Frontend Match Loading - Run in Browser Console
// This will help debug why the David vs Kunle match isn't showing

console.log('🔍 Starting frontend debug...');

// Check if the match is coming from the API
fetch('/api/votes')
  .then(response => response.json())
  .then(data => {
    console.log('📥 API Response:', data);
    
    if (data.success && data.matches) {
      console.log(`📊 Total matches from API: ${data.matches.length}`);
      
      data.matches.forEach((match, index) => {
        console.log(`\n🏟️ Match ${index + 1}:`);
        console.log(`  - ID: ${match.id}`);
        console.log(`  - Wrestler1: "${match.wrestler1}"`);
        console.log(`  - Wrestler2: "${match.wrestler2}"`);
        console.log(`  - Status: ${match.status}`);
        console.log(`  - Event: ${match.event_name}`);
        
        // Test the hardcoded filter logic
        const hardcodedNames = [
          'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
          'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
          'gable steveson', 'geno petriashvili'
        ];
        
        const wrestler1Lower = (match.wrestler1 || '').toLowerCase();
        const wrestler2Lower = (match.wrestler2 || '').toLowerCase();
        
        const isHardcoded = hardcodedNames.some(name => 
          wrestler1Lower.includes(name) || wrestler2Lower.includes(name)
        );
        
        console.log(`  - Wrestler1 Lower: "${wrestler1Lower}"`);
        console.log(`  - Wrestler2 Lower: "${wrestler2Lower}"`);
        console.log(`  - Is Hardcoded: ${isHardcoded}`);
        
        if (isHardcoded) {
          console.log(`  ❌ This match would be FILTERED OUT as hardcoded`);
          
          // Find which name caused the match
          hardcodedNames.forEach(name => {
            if (wrestler1Lower.includes(name)) {
              console.log(`    - Wrestler1 "${wrestler1Lower}" includes hardcoded "${name}"`);
            }
            if (wrestler2Lower.includes(name)) {
              console.log(`    - Wrestler2 "${wrestler2Lower}" includes hardcoded "${name}"`);
            }
          });
        } else {
          console.log(`  ✅ This match would PASS the hardcoded filter`);
        }
      });
      
      // Find the specific David vs Kunle match
      const davidKunleMatch = data.matches.find(m => 
        m.id === '423f65d9-1011-4156-9a8a-59bb956be59a'
      );
      
      if (davidKunleMatch) {
        console.log('\n🎯 Found David vs Kunle match:');
        console.log('✅ Match exists in API response');
        console.log('ID:', davidKunleMatch.id);
        console.log('Wrestlers:', davidKunleMatch.wrestler1, 'vs', davidKunleMatch.wrestler2);
      } else {
        console.log('\n❌ David vs Kunle match NOT found in API response');
      }
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error);
  });

// Also check what's in the frontend state
setTimeout(() => {
  // Try to access React state (this might not work in all cases)
  console.log('\n🔍 Checking frontend state...');
  
  // Check localStorage for any cached data
  const bettingPools = localStorage.getItem('wrestlebet_betting_pools');
  if (bettingPools) {
    console.log('💾 Betting pools in localStorage:', JSON.parse(bettingPools));
  }
  
  console.log('🔄 Debug complete - check console output above');
}, 1000);
