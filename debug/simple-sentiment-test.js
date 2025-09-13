// Simple Dynamic Sentiment Test Script
// Run this in the browser console at http://localhost:3001

console.log('🔧 Simple Dynamic Sentiment Test');

async function testSentiment() {
  try {
    // Step 1: Get matches
    console.log('1. Getting matches...');
    const response = await fetch('/api/admin/matches');
    const data = await response.json();
    
    console.log('Matches response:', data);
    
    if (!data.success || !data.matches || data.matches.length === 0) {
      console.log('❌ No matches found. Let me create one...');
      
      // Create a test match
      const createResponse = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrestler1: 'John Cena',
          wrestler2: 'The Rock',
          event: 'Sentiment Test Event',
          eventDate: new Date().toISOString(),
          status: 'active'
        })
      });
      
      const createResult = await createResponse.json();
      console.log('Create match result:', createResult);
      
      if (!createResult.success) {
        console.error('❌ Failed to create match:', createResult.error);
        return;
      }
    }
    
    // Step 2: Place a bet
    console.log('\n2. Placing test bet...');
    
    const testMatch = data.matches?.[0] || createResult.match;
    
    const betResponse = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-' + Date.now(),
        matchId: testMatch.id,
        wrestlerChoice: 'wrestler1',
        betAmount: 15,
        odds: 2.0
      })
    });
    
    const betResult = await betResponse.json();
    console.log('Bet result:', betResult);
    
    if (betResult.success) {
      console.log('✅ Bet placed! Pools updated:', betResult.pools);
    } else {
      console.error('❌ Bet failed:', betResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Auto-run
testSentiment();
