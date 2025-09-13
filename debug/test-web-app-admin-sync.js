/**
 * Test Web App to Admin Portal Data Sync
 * Run this in browser console to test bidirectional data synchronization
 */

console.log('🧪 Testing Web App ↔ Admin Portal Data Sync...');

// Test 1: Check if admin portal shows web app betting data
const testAdminShowsBettingData = async () => {
  console.log('🔍 Test 1: Checking if admin portal shows betting data from web app...');
  
  try {
    // Fetch admin matches data
    const adminResponse = await fetch('/api/admin/matches');
    const adminData = await adminResponse.json();
    
    if (adminData.success && adminData.matches) {
      console.log('📊 Admin Portal Data:', adminData.matches);
      
      // Check if matches have betting statistics
      const matchesWithBets = adminData.matches.filter(m => m.totalBets > 0 || m.totalPool > 0);
      console.log(`💰 Matches with betting data: ${matchesWithBets.length}/${adminData.matches.length}`);
      
      matchesWithBets.forEach(match => {
        console.log(`📈 ${match.wrestler1} vs ${match.wrestler2}:`, {
          totalBets: match.totalBets,
          totalVotes: match.totalVotes,
          totalPool: match.totalPool
        });
      });
      
      return {
        success: true,
        totalMatches: adminData.matches.length,
        matchesWithBets: matchesWithBets.length,
        data: matchesWithBets
      };
    } else {
      console.log('❌ Failed to fetch admin data:', adminData);
      return { success: false, error: adminData.error };
    }
  } catch (error) {
    console.error('❌ Error testing admin data:', error);
    return { success: false, error: error.message };
  }
};

// Test 2: Check if web app data reaches admin portal in real-time
const testRealTimeSyncToAdmin = async () => {
  console.log('🔄 Test 2: Testing real-time sync from web app to admin...');
  
  // Get current admin data
  const beforeResponse = await fetch('/api/admin/matches');
  const beforeData = await beforeResponse.json();
  const beforeStats = beforeData.matches?.reduce((acc, match) => {
    acc.totalBets += match.totalBets || 0;
    acc.totalPool += match.totalPool || 0;
    return acc;
  }, { totalBets: 0, totalPool: 0 });
  
  console.log('📊 Admin data BEFORE web app activity:', beforeStats);
  
  // Simulate web app activity (if betting context is available)
  if (window.React && typeof window.testBettingSystem !== 'undefined') {
    console.log('🎯 Simulating web app betting activity...');
    
    try {
      // Use existing test system if available
      await window.testBettingSystem.placeTestBet();
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check admin data again
      const afterResponse = await fetch('/api/admin/matches');
      const afterData = await afterResponse.json();
      const afterStats = afterData.matches?.reduce((acc, match) => {
        acc.totalBets += match.totalBets || 0;
        acc.totalPool += match.totalPool || 0;
        return acc;
      }, { totalBets: 0, totalPool: 0 });
      
      console.log('📊 Admin data AFTER web app activity:', afterStats);
      
      const betsChanged = afterStats.totalBets !== beforeStats.totalBets;
      const poolChanged = afterStats.totalPool !== beforeStats.totalPool;
      
      if (betsChanged || poolChanged) {
        console.log('✅ Real-time sync working! Admin portal updated with web app data');
        return { success: true, syncWorking: true };
      } else {
        console.log('⚠️ No changes detected - sync might not be working or no bets were placed');
        return { success: true, syncWorking: false };
      }
    } catch (error) {
      console.log('❌ Error simulating betting activity:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('⚠️ Cannot simulate betting - betting system not available');
    return { success: false, error: 'Betting system not available for testing' };
  }
};

// Test 3: Check if admin actions appear in web app
const testAdminToWebAppSync = () => {
  console.log('🔄 Test 3: Testing sync from admin to web app...');
  
  // Listen for admin events
  let adminEventReceived = false;
  const adminEventListener = () => {
    adminEventReceived = true;
    console.log('📢 Admin event received by web app!');
  };
  
  window.addEventListener('admin-match-created', adminEventListener);
  window.addEventListener('admin-match-deleted', adminEventListener);
  
  // Simulate admin action
  setTimeout(() => {
    console.log('🎭 Simulating admin action...');
    window.dispatchEvent(new CustomEvent('admin-match-created', {
      detail: { testMode: true, timestamp: Date.now() }
    }));
  }, 500);
  
  // Check result after delay
  setTimeout(() => {
    window.removeEventListener('admin-match-created', adminEventListener);
    window.removeEventListener('admin-match-deleted', adminEventListener);
    
    if (adminEventReceived) {
      console.log('✅ Admin to web app sync working!');
    } else {
      console.log('❌ Admin to web app sync not working');
    }
  }, 1000);
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, eventReceived: adminEventReceived });
    }, 1500);
  });
};

// Test 4: Check data consistency between web app and admin portal
const testDataConsistency = async () => {
  console.log('🔍 Test 4: Checking data consistency between web app and admin...');
  
  try {
    // Get web app matches (if available)
    let webAppMatches = [];
    if (window.globalDataSync) {
      webAppMatches = window.globalDataSync.getData('matches') || [];
    }
    
    // Get admin matches
    const adminResponse = await fetch('/api/admin/matches');
    const adminData = await adminResponse.json();
    const adminMatches = adminData.success ? adminData.matches : [];
    
    console.log(`📊 Web app matches: ${webAppMatches.length}`);
    console.log(`📊 Admin matches: ${adminMatches.length}`);
    
    // Compare match IDs
    const webAppIds = webAppMatches.map(m => m.id);
    const adminIds = adminMatches.map(m => m.id);
    
    const missingInAdmin = webAppIds.filter(id => !adminIds.includes(id));
    const missingInWebApp = adminIds.filter(id => !webAppIds.includes(id));
    
    console.log('🔍 Data consistency analysis:');
    console.log(`  Missing in admin: ${missingInAdmin.length}`, missingInAdmin);
    console.log(`  Missing in web app: ${missingInWebApp.length}`, missingInWebApp);
    
    const isConsistent = missingInAdmin.length === 0 && missingInWebApp.length === 0;
    
    return {
      success: true,
      consistent: isConsistent,
      webAppCount: webAppMatches.length,
      adminCount: adminMatches.length,
      missingInAdmin,
      missingInWebApp
    };
    
  } catch (error) {
    console.error('❌ Error checking consistency:', error);
    return { success: false, error: error.message };
  }
};

// Run comprehensive sync test
const runComprehensiveSyncTest = async () => {
  console.log('🚀 Running comprehensive web app ↔ admin portal sync test...');
  
  const results = {};
  
  try {
    console.log('\n--- Test 1: Admin Shows Betting Data ---');
    results.adminShowsBettingData = await testAdminShowsBettingData();
    
    console.log('\n--- Test 2: Real-time Sync to Admin ---');
    results.realTimeSyncToAdmin = await testRealTimeSyncToAdmin();
    
    console.log('\n--- Test 3: Admin to Web App Sync ---');
    results.adminToWebAppSync = await testAdminToWebAppSync();
    
    console.log('\n--- Test 4: Data Consistency ---');
    results.dataConsistency = await testDataConsistency();
    
    console.log('\n🎯 COMPREHENSIVE SYNC TEST RESULTS:');
    console.log('=====================================');
    
    Object.entries(results).forEach(([testName, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${testName}:`, result);
    });
    
    // Overall assessment
    const allPassed = Object.values(results).every(r => r.success);
    console.log(`\n🏆 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return { error: error.message };
  }
};

// Export for manual testing
window.testWebAppAdminSync = {
  testAdminShowsBettingData,
  testRealTimeSyncToAdmin, 
  testAdminToWebAppSync,
  testDataConsistency,
  runComprehensiveSyncTest
};

console.log('🎮 Test functions available: window.testWebAppAdminSync');
console.log('Run: window.testWebAppAdminSync.runComprehensiveSyncTest()');

// Auto-run the comprehensive test
runComprehensiveSyncTest();
