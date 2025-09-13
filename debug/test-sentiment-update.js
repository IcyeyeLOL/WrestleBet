// Test placing a bet to see if sentiment bars update
const testSentimentUpdate = async () => {
  try {
    console.log('🎯 Testing sentiment update with manual bet...');
    
    // First, get a match ID from our test matches
    const matchesResponse = await fetch('http://localhost:3001/api/admin/matches');
    const matchesResult = await matchesResponse.json();
    
    if (!matchesResult.success || !matchesResult.matches.length) {
      console.log('❌ No matches found');
      return;
    }
    
    const testMatch = matchesResult.matches.find(m => m.status === 'upcoming');
    if (!testMatch) {
      console.log('❌ No upcoming matches found');
      return;
    }
    
    console.log('🥊 Testing with match:', testMatch.wrestler1, 'vs', testMatch.wrestler2);
    
    // Place a bet on wrestler1
    const betData = {
      userId: `test-user-${Date.now()}`,
      matchId: testMatch.id,
      wrestlerChoice: testMatch.wrestler1,
      betAmount: 10,
      odds: 2.0,
      isSentimentVote: true
    };
    
    console.log('💰 Placing test bet:', betData);
    
    const betResponse = await fetch('http://localhost:3001/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(betData)
    });
    
    const betResult = await betResponse.json();
    console.log('📊 Bet result:', betResult);
    
    if (betResult.success) {
      console.log('✅ Bet placed successfully!');
      
      // Wait a moment then check updated match data
      setTimeout(async () => {
        const updatedResponse = await fetch('http://localhost:3001/api/admin/matches');
        const updatedResult = await updatedResponse.json();
        
        const updatedMatch = updatedResult.matches.find(m => m.id === testMatch.id);
        if (updatedMatch) {
          console.log('📈 Updated match pools:', {
            wrestler1_pool: updatedMatch.wrestler1_pool,
            wrestler2_pool: updatedMatch.wrestler2_pool,
            total_pool: updatedMatch.total_pool,
            wrestler1_percentage: updatedMatch.wrestler1_percentage,
            wrestler2_percentage: updatedMatch.wrestler2_percentage
          });
        }
      }, 1000);
      
    } else {
      console.log('❌ Bet failed:', betResult.error);
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testSentimentUpdate();
