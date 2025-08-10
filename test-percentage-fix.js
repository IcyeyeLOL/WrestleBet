// Test script to manually verify the percentage calculation fix
// Paste this into browser console to test the voting system

function testVotingFix() {
  console.log('🧪 Testing the percentage calculation fix...');
  
  // Clear any existing data
  localStorage.removeItem('wrestlebet_polls');
  
  // Create the exact structure that DatabaseBettingContext creates
  const testPollData = {
    'taylor-yazdani': {
      taylor: 0,
      yazdani: 0,
      'David Taylor': 0,
      'Hassan Yazdani': 0,
      totalVotes: 0,
      wrestler1: 'David Taylor',
      wrestler2: 'Hassan Yazdani',
      matchId: null
    },
    'dake-punia': {
      dake: 0,
      punia: 0,
      'Kyle Dake': 0,
      'Bajrang Punia': 0,
      totalVotes: 0,
      wrestler1: 'Kyle Dake',
      wrestler2: 'Bajrang Punia',
      matchId: null
    },
    'steveson-petriashvili': {
      steveson: 0,
      petriashvili: 0,
      'Gable Steveson': 0,
      'Geno Petriashvili': 0,
      totalVotes: 0,
      wrestler1: 'Gable Steveson',
      wrestler2: 'Geno Petriashvili',
      matchId: null
    }
  };
  
  console.log('📦 Initial poll data structure:', testPollData);
  
  // Simulate voting (as handleVote function would do)
  function simulateVote(matchId, wrestler) {
    const match = testPollData[matchId];
    const wrestlerKey = wrestler.toLowerCase(); // 'taylor', 'yazdani', etc.
    
    console.log(`🗳️ Simulating vote for ${wrestler} (key: ${wrestlerKey}) in ${matchId}`);
    console.log(`   Before: ${wrestlerKey} = ${match[wrestlerKey]}, total = ${match.totalVotes}`);
    
    // Add vote
    match[wrestlerKey] = (match[wrestlerKey] || 0) + 1;
    match.totalVotes = (match.totalVotes || 0) + 1;
    
    console.log(`   After: ${wrestlerKey} = ${match[wrestlerKey]}, total = ${match.totalVotes}`);
  }
  
  // Test the getPercentage function (as FrontPage would do)
  function testGetPercentage(matchId, wrestler) {
    const match = testPollData[matchId];
    
    if (!match || !match.totalVotes || match.totalVotes === 0) {
      console.log(`❌ No votes for ${matchId} - ${wrestler}: 0%`);
      return 0;
    }
    
    const wrestlerKey = wrestler.toLowerCase();
    const wrestlerVotes = match[wrestlerKey] || match[wrestler] || 0;
    const percentage = Math.round((wrestlerVotes / match.totalVotes) * 100);
    
    console.log(`📊 ${matchId} - ${wrestler} (${wrestlerKey}): ${wrestlerVotes}/${match.totalVotes} = ${percentage}%`);
    return percentage;
  }
  
  // Test sequence
  console.log('\n🎯 Test 1: Initial state (should be 0%)');
  testGetPercentage('taylor-yazdani', 'taylor');
  testGetPercentage('taylor-yazdani', 'yazdani');
  
  console.log('\n🎯 Test 2: Add votes and check percentages');
  simulateVote('taylor-yazdani', 'taylor');
  simulateVote('taylor-yazdani', 'taylor');
  simulateVote('taylor-yazdani', 'yazdani');
  
  // Should be: Taylor = 2 votes (67%), Yazdani = 1 vote (33%)
  testGetPercentage('taylor-yazdani', 'taylor');   // Should be 67%
  testGetPercentage('taylor-yazdani', 'yazdani');  // Should be 33%
  
  console.log('\n🎯 Test 3: Add more votes');
  simulateVote('taylor-yazdani', 'yazdani');
  simulateVote('taylor-yazdani', 'yazdani');
  
  // Should be: Taylor = 2 votes (40%), Yazdani = 3 votes (60%)
  testGetPercentage('taylor-yazdani', 'taylor');   // Should be 40%
  testGetPercentage('taylor-yazdani', 'yazdani');  // Should be 60%
  
  // Save to localStorage so the app can use it
  localStorage.setItem('wrestlebet_polls', JSON.stringify(testPollData));
  
  console.log('\n✅ Test completed! Data saved to localStorage.');
  console.log('📊 Final poll data:', testPollData);
  console.log('🔄 Reload the page to see the percentages in action!');
}

// Run the test
testVotingFix();
