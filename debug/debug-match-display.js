// Debug New Matches Not Showing Up
// Run this in browser console to test match creation and display

console.log('🔍 Debugging why new matches are not showing up...');

const debugMatchDisplay = async () => {
  try {
    // Step 1: Check current matches in database
    console.log('\n📊 Step 1: Checking current matches in database...');
    const matchesResponse = await fetch('/api/matches/dynamic');
    const matchesData = await matchesResponse.json();
    
    console.log('Database matches response:', matchesData);
    
    if (matchesData.success && matchesData.matches) {
      console.log(`Found ${matchesData.matches.length} matches in database:`);
      matchesData.matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.id}: ${match.wrestler1} vs ${match.wrestler2}`);
        console.log(`   Status: ${match.status}`);
        console.log(`   Created: ${match.created_at}`);
        console.log(`   Pools: W1=${match.wrestler1_pool || 0} WC, W2=${match.wrestler2_pool || 0} WC`);
      });
    } else {
      console.log('❌ No matches found or API error');
    }
    
    // Step 2: Create a test match
    console.log('\n🆕 Step 2: Creating a test match...');
    const testMatchData = {
      action: 'create',
      wrestler1: 'Test Wrestler A',
      wrestler2: 'Test Wrestler B',
      eventName: 'Debug Test Event',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const createResponse = await fetch('/api/matches/dynamic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMatchData)
    });
    
    const createResult = await createResponse.json();
    console.log('Match creation result:', createResult);
    
    if (createResult.success) {
      console.log('✅ Test match created successfully!');
      console.log(`🆔 Match ID: ${createResult.match.id}`);
      console.log(`🥊 Match: ${createResult.match.wrestler1} vs ${createResult.match.wrestler2}`);
      
      // Step 3: Wait and check if match appears in database
      console.log('\n⏳ Step 3: Waiting 2 seconds and checking if match appears...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedMatchesResponse = await fetch('/api/matches/dynamic');
      const updatedMatchesData = await updatedMatchesResponse.json();
      
      if (updatedMatchesData.success) {
        const newMatch = updatedMatchesData.matches.find(m => m.id === createResult.match.id);
        if (newMatch) {
          console.log('✅ New match found in database:', newMatch);
        } else {
          console.log('❌ New match NOT found in database');
        }
        
        console.log(`📊 Total matches now: ${updatedMatchesData.matches.length}`);
      }
      
      // Step 4: Check frontend state
      console.log('\n🖥️ Step 4: Checking frontend match state...');
      
      // Try to access React state (this might not work in console)
      if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
        console.log('📊 React debugging not available in console');
      }
      
      // Alternative: Check DOM for matches
      const matchElements = document.querySelectorAll('[data-match-id], .match-card, .wrestler-card');
      console.log(`🎯 Found ${matchElements.length} match elements in DOM`);
      
      matchElements.forEach((element, index) => {
        console.log(`DOM Match ${index + 1}:`, {
          element: element.tagName,
          classes: element.className,
          content: element.textContent?.substring(0, 100) + '...'
        });
      });
      
      // Step 5: Force reload to check if match appears
      console.log('\n🔄 Step 5: Reloading page to check if match appears...');
      console.log('💡 Watch for the new match after page reload!');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } else {
      console.log('❌ Failed to create test match:', createResult.error);
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
};

// Also create a function to check current frontend state
const checkFrontendMatches = () => {
  console.log('🔍 Checking current frontend match display...');
  
  // Look for match-related elements
  const matchSelectors = [
    '.match-card',
    '.wrestler-card', 
    '[data-match-id]',
    '.bg-slate-800',
    '.group'
  ];
  
  matchSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements with selector "${selector}"`);
      elements.forEach((el, i) => {
        const text = el.textContent?.substring(0, 50);
        console.log(`  ${i + 1}. "${text}..."`);
      });
    }
  });
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
  if (loadingElements.length > 0) {
    console.log(`⏳ Found ${loadingElements.length} loading indicators`);
  }
  
  // Check for error messages
  const errorElements = document.querySelectorAll('[class*="error"], .text-red');
  if (errorElements.length > 0) {
    console.log(`❌ Found ${errorElements.length} error indicators`);
    errorElements.forEach(el => console.log(`Error: ${el.textContent}`));
  }
};

// Run the debug
console.log('🚀 Starting match display debug...');
debugMatchDisplay();

// Make functions available globally
window.debugMatchDisplay = debugMatchDisplay;
window.checkFrontendMatches = checkFrontendMatches;

console.log('\n🛠️ Available functions:');
console.log('💡 debugMatchDisplay() - Full debug workflow');
console.log('🔍 checkFrontendMatches() - Check current DOM state');
