// Test Delete Match - Run in Browser Console
// This will help debug the 500 error when deleting matches

console.log('🧪 Testing match deletion...');

const matchId = '423f65d9-1011-4156-9a8a-59bb956be59a'; // David vs Kunle match
const adminUserId = 'admin-user-id';

console.log(`Attempting to delete match: ${matchId}`);

fetch(`/api/admin/matches?id=${matchId}&adminUserId=${adminUserId}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  return response.json();
})
.then(data => {
  console.log('✅ Delete response:', data);
  
  if (data.success) {
    console.log('🎉 Match deleted successfully!');
  } else {
    console.log('❌ Delete failed:', data.error);
  }
})
.catch(error => {
  console.error('🚨 Delete request failed:', error);
});

// Also test if we can fetch the match first
console.log('\n🔍 First, let\'s check if the match exists...');

fetch('/api/votes')
  .then(res => res.json())
  .then(data => {
    if (data.success && data.matches) {
      const targetMatch = data.matches.find(m => m.id === matchId);
      
      if (targetMatch) {
        console.log('📊 Match found in database:', {
          id: targetMatch.id,
          wrestlers: `${targetMatch.wrestler1} vs ${targetMatch.wrestler2}`,
          status: targetMatch.status,
          event: targetMatch.event_name
        });
      } else {
        console.log('❌ Match not found in API response');
      }
    }
  })
  .catch(error => {
    console.error('Error fetching matches:', error);
  });

console.log('🔄 Test initiated - check console output above');
