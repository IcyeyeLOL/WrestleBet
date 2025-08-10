// Quick test to verify the data structure and flow
// Run this in browser console to debug the voting system

function testVotingFlow() {
  console.log('🧪 Testing voting data flow...');
  
  // Check if pollData exists in the context
  const pollDataFromStorage = localStorage.getItem('wrestlebet_polls');
  console.log('📦 Local storage data:', pollDataFromStorage ? JSON.parse(pollDataFromStorage) : 'No data');
  
  // Create test data structure
  const testData = {
    'taylor-yazdani': {
      taylor: 5,
      yazdani: 3,
      totalVotes: 8,
      wrestler1: 'David Taylor',
      wrestler2: 'Hassan Yazdani',
      matchId: 'test-uuid-1'
    },
    'dake-punia': {
      dake: 7,
      punia: 2,
      totalVotes: 9,
      wrestler1: 'Kyle Dake',
      wrestler2: 'Bajrang Punia',
      matchId: 'test-uuid-2'
    }
  };
  
  // Save test data
  localStorage.setItem('wrestlebet_polls', JSON.stringify(testData));
  console.log('✅ Saved test data to localStorage');
  
  // Test percentage calculation
  function testGetPercentage(matchId, wrestler) {
    const data = JSON.parse(localStorage.getItem('wrestlebet_polls'));
    const match = data[matchId];
    
    if (!match || !match.totalVotes || match.totalVotes === 0) {
      return 0;
    }
    
    const wrestlerKey = wrestler.toLowerCase();
    const wrestlerVotes = match[wrestlerKey] || 0;
    const percentage = Math.round((wrestlerVotes / match.totalVotes) * 100);
    
    console.log(`📊 ${matchId} - ${wrestler}: ${wrestlerVotes}/${match.totalVotes} = ${percentage}%`);
    return percentage;
  }
  
  // Test all wrestlers
  testGetPercentage('taylor-yazdani', 'taylor');  // Should be 62%
  testGetPercentage('taylor-yazdani', 'yazdani'); // Should be 38%
  testGetPercentage('dake-punia', 'dake');        // Should be 78%
  testGetPercentage('dake-punia', 'punia');       // Should be 22%
  
  console.log('🎉 Test completed! Reload the page to see the data.');
}

// Auto-run the test
testVotingFlow();
