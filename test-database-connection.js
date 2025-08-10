// 🧪 DATABASE CONNECTIVITY TEST
// =============================
// Run this in browser console to test your database

async function testDatabaseConnection() {
  console.log('🧪 Testing WrestleBet Database Connection...');
  
  try {
    // Test 1: Check votes API
    console.log('\n1️⃣ Testing /api/votes...');
    const votesResponse = await fetch('/api/votes');
    const votesData = await votesResponse.json();
    console.log('✅ Votes API:', votesResponse.status, votesData);
    
    // Test 2: Check if matches exist
    if (votesData.success && votesData.matches) {
      console.log(`📊 Found ${votesData.matches.length} matches in database:`);
      votesData.matches.forEach(match => {
        console.log(`   • ${match.wrestler1} vs ${match.wrestler2}`);
        console.log(`   • Vote counts:`, match.voteCounts);
      });
    }
    
    // Test 3: Try placing a test vote
    console.log('\n2️⃣ Testing vote submission...');
    const testVote = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: 1, // Assuming first match
        wrestlerChoice: 'David Taylor',
        userIp: 'test-ip'
      })
    });
    
    const voteResult = await testVote.json();
    console.log('✅ Vote submission:', testVote.status, voteResult);
    
    console.log('\n🎯 RESULT: Database is', 
      votesResponse.ok && testVote.ok ? '✅ WORKING!' : '❌ NOT WORKING');
    
    return { working: votesResponse.ok && testVote.ok, data: votesData };
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { working: false, error };
  }
}

// Run the test
testDatabaseConnection();
