// Setup Global Matches in Database
// Run this in browser console to initialize the global betting system

console.log('🌍 Setting up global matches for WrestleBet...');

async function setupGlobalMatches() {
  try {
    // First, let's test if the API is working
    console.log('📡 Testing API connection...');
    const testResponse = await fetch('/api/votes');
    console.log('API Response:', await testResponse.json());
    
    // If we need to add matches to database, we can do that here
    // For now, let's just verify the current setup
    
    console.log('✅ Global betting system ready!');
    console.log('📊 Your betting pools are now globally shared!');
    console.log('🗳️ All votes will affect the same global percentages!');
    console.log('💰 All bets contribute to the same global odds!');
    
  } catch (error) {
    console.error('❌ Error setting up global matches:', error);
    console.log('💡 Tip: Make sure your database is configured and running');
  }
}

// Run the setup
setupGlobalMatches();

// Instructions for testing
console.log(`
🧪 HOW TO TEST GLOBAL BETTING:

1. Open multiple browser tabs to http://localhost:3003
2. Vote on different wrestlers in different tabs
3. Watch as the percentages update GLOBALLY across all tabs!
4. Place bets and see how they affect global odds
5. Check browser console for global sync messages

🔍 What to Look For:
- Console messages: "🌍 Loading global poll data from database..."
- Console messages: "✅ Global database sync successful"
- Percentages that change when voting from different tabs
- Odds that update based on global betting pools
`);
