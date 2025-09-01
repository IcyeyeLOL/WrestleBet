// Debug script for admin delete functionality
// Run this in browser console to test the delete API

console.log('🔍 Testing Admin Delete Functionality');

// Test function to manually call the delete API
async function testDeleteAPI(matchId, force = false) {
  console.log(`🗑️ Testing delete for match: ${matchId}${force ? ' (FORCE)' : ''}`);
  
  try {
    const params = new URLSearchParams({ 
      id: matchId, 
      adminUserId: 'admin-user-id',
      ...(force && { force: 'true' })
    });
    
    const response = await fetch(`/api/admin/matches?${params.toString()}`, {
      method: 'DELETE'
    });

    const result = await response.json();
    
    console.log('📊 API Response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    if (result.requiresForce) {
      console.log('⚠️ Match has bets and requires force delete:');
      console.log(`   - Bets: ${result.betDetails.count}`);
      console.log(`   - Total WC: ${result.betDetails.totalAmount}`);
      console.log('🔧 To force delete, run: testDeleteAPI("' + matchId + '", true)');
    }

    return result;
  } catch (error) {
    console.error('❌ Error testing delete API:', error);
    return { error: error.message };
  }
}

// Get all matches to find match IDs
async function getMatches() {
  try {
    const response = await fetch('/api/admin/matches');
    const result = await response.json();
    
    if (result.success && result.matches) {
      console.log('📋 Available matches for deletion:');
      result.matches.forEach(match => {
        console.log(`   - ${match.id.slice(0, 8)}... | ${match.wrestler1} vs ${match.wrestler2} | Bets: ${match.totalBets || 0}`);
      });
      return result.matches;
    }
    
    console.log('📋 API Response:', result);
    return [];
  } catch (error) {
    console.error('❌ Error getting matches:', error);
    return [];
  }
}

// Auto-run diagnostics
(async () => {
  console.log('🚀 Starting admin delete diagnostics...');
  
  // Get current matches
  const matches = await getMatches();
  
  if (matches.length > 0) {
    console.log('\n🎯 To test deletion, run one of these commands:');
    matches.forEach(match => {
      const hashedId = match.id.slice(0, 8);
      console.log(`   testDeleteAPI("${match.id}") // ${match.wrestler1} vs ${match.wrestler2}`);
    });
  }
  
  console.log('\n📖 Available functions:');
  console.log('   - getMatches() - List all matches');
  console.log('   - testDeleteAPI(matchId) - Test normal delete');
  console.log('   - testDeleteAPI(matchId, true) - Test force delete');
})();
