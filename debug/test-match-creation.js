// Test script to create a match and verify it appears on frontend
// Using built-in fetch in Node.js 18+

async function createTestMatch() {
  try {
    console.log('🔥 Creating test match...');
    
    const matchData = {
      wrestler1: "Dynamic Test Fighter",
      wrestler2: "Frontend Test Wrestler", 
      eventName: "Frontend Debug Event",
      weightClass: "Test Class",
      description: "Testing if new matches appear on frontend"
    };

    const response = await fetch('http://localhost:3001/api/admin/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchData)
    });

    const result = await response.json();
    console.log('📊 Match creation result:', result);

    if (result.success) {
      console.log('✅ Match created successfully!');
      console.log(`🥊 Match ID: ${result.match?.id}`);
      console.log(`👤 Wrestlers: ${result.match?.wrestler1} vs ${result.match?.wrestler2}`);
      
      // Now check if it appears in the matches list
      console.log('\n🔍 Checking if match appears in API...');
      const listResponse = await fetch('http://localhost:3001/api/admin/matches');
      const listResult = await listResponse.json();
      
      console.log('📋 Current matches:', listResult);
      
      if (listResult.matches && listResult.matches.length > 0) {
        console.log(`✅ Success! ${listResult.matches.length} match(es) found in database`);
        listResult.matches.forEach(match => {
          console.log(`  - ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id})`);
        });
      } else {
        console.log('❌ No matches found in database after creation');
      }
    } else {
      console.log('❌ Match creation failed:', result.error);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

createTestMatch();
