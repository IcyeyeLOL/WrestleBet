// FORCE MATCHES REMOVAL - Browser Console Script
// Run this in your browser console on the admin page to remove all hardcoded matches

console.log('🚨 FORCE MATCHES REMOVAL SCRIPT STARTING...');
console.log('=====================================');

// List of all known hardcoded wrestler names
const hardcodedWrestlers = [
  'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia',
  'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi',
  'Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown',
  'John Smith', 'Mike Johnson'
];

// Function to remove all force matches
async function removeAllForceMatches() {
  try {
    console.log('🔍 Step 1: Fetching all matches from database...');
    
    // Get all matches
    const response = await fetch('/api/admin/matches');
    const data = await response.json();
    
    if (!data.success || !data.matches) {
      console.error('❌ Failed to fetch matches:', data.error);
      return;
    }
    
    console.log(`📊 Found ${data.matches.length} total matches in database`);
    
    // Find force matches (hardcoded wrestlers)
    const forceMatches = data.matches.filter(match => 
      hardcodedWrestlers.includes(match.wrestler1) || 
      hardcodedWrestlers.includes(match.wrestler2) ||
      match.wrestler1.toLowerCase().includes('test') ||
      match.wrestler2.toLowerCase().includes('test') ||
      match.wrestler1.toLowerCase().includes('demo') ||
      match.wrestler2.toLowerCase().includes('demo') ||
      (match.event_name && match.event_name.toLowerCase().includes('test')) ||
      (match.event_name && match.event_name.toLowerCase().includes('demo'))
    );
    
    console.log(`🎯 Found ${forceMatches.length} force matches to remove:`);
    forceMatches.forEach(match => {
      console.log(`  - ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id.substring(0, 8)}...)`);
    });
    
    if (forceMatches.length === 0) {
      console.log('✅ No force matches found in database!');
      return;
    }
    
    console.log('\n💣 Step 2: Removing force matches...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const match of forceMatches) {
      try {
        console.log(`🗑️ Deleting: ${match.wrestler1} vs ${match.wrestler2}...`);
        
        // Force delete the match (including all bets)
        const deleteResponse = await fetch(
          `/api/admin/matches?id=${match.id}&adminUserId=force-cleanup&force=true`,
          { method: 'DELETE' }
        );
        
        const deleteResult = await deleteResponse.json();
        
        if (deleteResult.success) {
          console.log(`✅ Deleted: ${match.wrestler1} vs ${match.wrestler2}`);
          deletedCount++;
        } else {
          console.error(`❌ Failed to delete: ${match.wrestler1} vs ${match.wrestler2}`, deleteResult.error);
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Error deleting match ${match.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 CLEANUP SUMMARY:');
    console.log(`✅ Successfully deleted: ${deletedCount} matches`);
    console.log(`❌ Failed to delete: ${errorCount} matches`);
    console.log(`📈 Total processed: ${forceMatches.length} matches`);
    
    if (deletedCount > 0) {
      console.log('\n🔄 Refreshing page to show updated matches...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error in removeAllForceMatches:', error);
  }
}

// Function to check current matches status
async function checkMatchesStatus() {
  try {
    console.log('🔍 Checking current matches status...');
    
    const response = await fetch('/api/matches');
    const data = await response.json();
    
    if (data.success && data.matches) {
      console.log(`📊 Current matches in database: ${data.matches.length}`);
      
      if (data.matches.length > 0) {
        console.log('📋 Current matches:');
        data.matches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.wrestler1} vs ${match.wrestler2} (${match.status})`);
        });
      } else {
        console.log('✅ Database is clean - no matches found');
      }
    } else {
      console.error('❌ Failed to fetch matches:', data.error);
    }
  } catch (error) {
    console.error('❌ Error checking matches status:', error);
  }
}

// Function to clear browser storage
function clearBrowserStorage() {
  console.log('🧹 Clearing browser storage...');
  
  // Clear localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('match') || key.includes('bet') || key.includes('wrestle'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed localStorage key: ${key}`);
  });
  
  // Clear sessionStorage
  const sessionKeysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('match') || key.includes('bet') || key.includes('wrestle'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`🗑️ Removed sessionStorage key: ${key}`);
  });
  
  console.log('✅ Browser storage cleared');
}

// Main execution function
async function executeForceMatchCleanup() {
  console.log('🚀 Starting comprehensive force match cleanup...');
  
  // Step 1: Check current status
  await checkMatchesStatus();
  
  // Step 2: Remove force matches
  await removeAllForceMatches();
  
  // Step 3: Clear browser storage
  clearBrowserStorage();
  
  // Step 4: Final status check
  console.log('\n🔍 Final status check...');
  await checkMatchesStatus();
  
  console.log('\n✅ FORCE MATCH CLEANUP COMPLETE!');
  console.log('=====================================');
}

// Export functions to global scope for manual use
window.removeAllForceMatches = removeAllForceMatches;
window.checkMatchesStatus = checkMatchesStatus;
window.clearBrowserStorage = clearBrowserStorage;
window.executeForceMatchCleanup = executeForceMatchCleanup;

// Usage instructions
console.log('📝 USAGE INSTRUCTIONS:');
console.log('executeForceMatchCleanup() - Run complete cleanup');
console.log('removeAllForceMatches() - Remove only force matches');
console.log('checkMatchesStatus() - Check current matches');
console.log('clearBrowserStorage() - Clear browser storage only');
console.log('');
console.log('🚀 To start cleanup, run: executeForceMatchCleanup()');
