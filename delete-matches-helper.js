// Simple script to delete matches via API
// Run this in your browser console on the admin page

async function deleteMatch(matchId, force = false) {
  try {
    const url = `/api/admin/matches?id=${matchId}&adminUserId=admin-user-id${force ? '&force=true' : ''}`;
    console.log(`🗑️ Deleting match ${matchId}${force ? ' (FORCE)' : ''}...`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Match deleted successfully:', result.message);
      return true;
    } else {
      console.log('❌ Delete failed:', result.error);
      if (result.requiresForce) {
        console.log('💡 Try with force=true to delete matches with bets');
        console.log('Example: deleteMatch("' + matchId + '", true)');
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting match:', error);
    return false;
  }
}

// Helper function to delete all matches (use with caution!)
async function deleteAllMatches(force = false) {
  try {
    console.log('🚨 WARNING: This will delete ALL matches!');
    console.log('Getting list of matches...');
    
    const response = await fetch('/api/admin/matches');
    const data = await response.json();
    
    if (!data.success || !data.matches) {
      console.log('❌ Failed to get matches list');
      return;
    }
    
    console.log(`Found ${data.matches.length} matches`);
    
    for (const match of data.matches) {
      console.log(`Deleting match: ${match.wrestler1} vs ${match.wrestler2} (${match.id})`);
      await deleteMatch(match.id, force);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Finished deleting all matches');
  } catch (error) {
    console.error('❌ Error in deleteAllMatches:', error);
  }
}

// Usage examples:
console.log('📝 Usage examples:');
console.log('deleteMatch("match-id-here") - Delete a specific match');
console.log('deleteMatch("match-id-here", true) - Force delete a match with bets');
console.log('deleteAllMatches() - Delete all matches (will fail if matches have bets)');
console.log('deleteAllMatches(true) - Force delete all matches (including those with bets)');

// Export functions to global scope
window.deleteMatch = deleteMatch;
window.deleteAllMatches = deleteAllMatches;





