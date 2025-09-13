// Direct database test to update match pools and see if frontend updates
const testDirectPoolUpdate = async () => {
  try {
    console.log('🔧 Testing direct pool update...');
    
    // Get a test match
    const matchesResponse = await fetch('http://localhost:3001/api/admin/matches');
    const matchesResult = await matchesResponse.json();
    
    const testMatch = matchesResult.matches.find(m => m.status === 'upcoming');
    if (!testMatch) {
      console.log('❌ No upcoming matches found');
      return;
    }
    
    console.log('🥊 Using match:', testMatch.wrestler1, 'vs', testMatch.wrestler2);
    console.log('📊 Current pools:', {
      wrestler1_pool: testMatch.wrestler1_pool,
      wrestler2_pool: testMatch.wrestler2_pool,
      total_pool: testMatch.total_pool
    });
    
    // Simulate updating pools by calling a custom API endpoint
    // We'll create a simple endpoint to manually update pools for testing
    console.log('🎯 This test shows what we need to implement...');
    console.log('💡 We need either:');
    console.log('   1. Database triggers to auto-update match pools when bets are inserted');
    console.log('   2. The betting API to manually update match pools after inserting bets');
    console.log('   3. Frontend to recalculate pools from bets table in real-time');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

testDirectPoolUpdate();
