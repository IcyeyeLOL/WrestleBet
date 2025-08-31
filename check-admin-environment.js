// Environment Check - Run in Browser Console
// This checks if the admin service role is properly configured

console.log('🔍 Checking environment configuration...');

// Test if we can access environment info through a simple API call
fetch('/api/admin/matches?limit=1')
  .then(response => {
    console.log('Admin API Response Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Admin API Response:', data);
    
    if (data.success) {
      console.log('✅ Admin API is working');
      console.log(`Found ${data.matches?.length || 0} matches`);
    } else {
      console.log('❌ Admin API issue:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Admin API call failed:', error);
  });

// Check if we have any matches to delete
fetch('/api/votes')
  .then(response => response.json())
  .then(data => {
    console.log('\n📊 Current matches in database:');
    
    if (data.success && data.matches) {
      data.matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id})`);
      });
      
      if (data.matches.length === 0) {
        console.log('No matches found - nothing to delete');
      }
    } else {
      console.log('❌ Could not fetch matches:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Error fetching matches:', error);
  });

console.log('\n🎯 Environment check complete');
