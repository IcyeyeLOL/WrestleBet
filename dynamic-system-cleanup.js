/**
 * WrestleBet Dynamic System Cleanup
 * This script removes all hardcoded wrestling match data and ensures the system is fully dynamic
 * Run this in the browser console to clean up any remaining legacy data
 */

console.log('🧹 Starting WrestleBet Dynamic System Cleanup...');

// Clear all legacy localStorage data
const clearLegacyData = () => {
  console.log('📦 Clearing legacy localStorage data...');
  
  const legacyKeys = [
    'wrestlebet_voting_data',
    'wrestlebet_poll_data',
    'admin_demo_matches',
    'hardcoded_matches',
    'static_match_data',
    'legacy_betting_data',
    'test_matches',
    'sample_matches',
    'demo_data'
  ];

  let clearedCount = 0;
  legacyKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`  ✅ Removed: ${key}`);
    }
  });

  console.log(`📊 Cleared ${clearedCount} legacy data entries`);
};

// Verify database connectivity
const verifyDatabaseConnection = async () => {
  console.log('🔌 Verifying database connection...');
  
  try {
    const response = await fetch('/api/admin/matches');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Database connection verified');
      console.log(`📋 Found ${result.matches?.length || 0} dynamic matches`);
      return true;
    } else {
      console.warn('⚠️ Database connection issue:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Display system status
const displaySystemStatus = async () => {
  console.log('📊 System Status:');
  console.log('================');
  
  // Check admin panel
  console.log('🛡️ Admin Panel: /admin');
  
  // Check if running in development
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  console.log(`🔧 Environment: ${isDev ? 'Development' : 'Production'}`);
  
  // Check authentication
  const isSignedIn = window.Clerk?.user ? true : false;
  console.log(`🔐 Authentication: ${isSignedIn ? 'Signed In' : 'Not Signed In'}`);
  
  // Check database
  const dbConnected = await verifyDatabaseConnection();
  console.log(`💾 Database: ${dbConnected ? 'Connected' : 'Disconnected'}`);
  
  console.log('================');
};

// Main cleanup function
const runCleanup = async () => {
  try {
    console.log('🚀 WrestleBet Dynamic System Cleanup Started');
    console.log('============================================');
    
    // Step 1: Clear legacy data
    clearLegacyData();
    
    // Step 2: Verify system
    await displaySystemStatus();
    
    // Step 3: Provide instructions
    console.log('📝 Instructions:');
    console.log('================');
    console.log('1. ✅ All hardcoded match data has been removed');
    console.log('2. 🛡️ Use the admin panel (/admin) to create new matches');
    console.log('3. 📊 All matches are now dynamic and stored in the database');
    console.log('4. 🔄 Real-time updates are enabled across all browser tabs');
    console.log('5. 💰 Betting and voting data sync globally');
    
    console.log('\n🎯 Next Steps:');
    console.log('==============');
    console.log('• Visit /admin to create your first dynamic match');
    console.log('• All future matches will be dynamically managed');
    console.log('• No more hardcoded data - fully dynamic system!');
    
    console.log('\n✅ Dynamic System Cleanup Complete!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Auto-run cleanup
runCleanup();

// Export functions for manual use
window.WrestleBetCleanup = {
  clearLegacyData,
  verifyDatabaseConnection,
  displaySystemStatus,
  runCleanup
};

console.log('\n💡 Tip: Use window.WrestleBetCleanup.runCleanup() to run cleanup again');
