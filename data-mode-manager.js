// Data Mode Manager for WrestleBet
// This utility helps you control whether the app uses localStorage or database

console.log('🔧 WrestleBet Data Mode Manager');
console.log('=====================================');

// Check current data persistence mode
function checkCurrentMode() {
  const hasLocalData = localStorage.getItem('wrestlebet_betting_pools') !== null;
  const hasLocalBets = localStorage.getItem('wrestlebet_bets') !== null;
  
  console.log('📊 Current Data Status:');
  console.log(`   Local Betting Pools: ${hasLocalData ? '✅ EXISTS' : '❌ NONE'}`);
  console.log(`   Local Bets: ${hasLocalBets ? '✅ EXISTS' : '❌ NONE'}`);
  
  if (hasLocalData) {
    const pools = JSON.parse(localStorage.getItem('wrestlebet_betting_pools'));
    console.log('💰 Current Betting Pools:', pools);
  }
  
  return { hasLocalData, hasLocalBets };
}

// Force Database-Only Mode
function enableDatabaseMode() {
  console.log('🗄️ Switching to Database-Only Mode...');
  
  // Clear all localStorage data
  localStorage.removeItem('wrestlebet_polls');
  localStorage.removeItem('wrestlebet_betting_pools');
  localStorage.removeItem('wrestlebet_bets');
  localStorage.removeItem('wrestlebet_balance');
  localStorage.removeItem('wrestlebet_last_daily_bonus');
  
  // Set a flag to indicate database mode
  localStorage.setItem('wrestlebet_data_mode', 'database');
  
  console.log('✅ Database mode enabled. Page will reload...');
  setTimeout(() => location.reload(), 1000);
}

// Force LocalStorage-Only Mode
function enableLocalStorageMode() {
  console.log('🏠 Switching to LocalStorage-Only Mode...');
  
  // Set flag for localStorage mode
  localStorage.setItem('wrestlebet_data_mode', 'localStorage');
  
  // Initialize with test data
  const testBettingPools = {
    'taylor-yazdani': { wrestler1: 350, wrestler2: 150 },
    'dake-punia': { wrestler1: 200, wrestler2: 800 },
    'steveson-petriashvili': { wrestler1: 100, wrestler2: 250 }
  };
  
  localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(testBettingPools));
  localStorage.setItem('wrestlebet_balance', '1000');
  
  console.log('✅ LocalStorage mode enabled with test data. Page will reload...');
  setTimeout(() => location.reload(), 1000);
}

// Get data mode
function getDataMode() {
  return localStorage.getItem('wrestlebet_data_mode') || 'hybrid';
}

// Reset to fresh state (new user simulation)
function simulateNewUser() {
  console.log('👤 Simulating New User Experience...');
  
  // Clear all existing data
  localStorage.clear();
  
  // The app will initialize with default test data on page reload
  console.log('✅ All data cleared. Reloading page to simulate new user...');
  setTimeout(() => location.reload(), 1000);
}

// Export functions for manual use
window.WrestleBetDataManager = {
  checkCurrentMode,
  enableDatabaseMode,
  enableLocalStorageMode,
  getDataMode,
  simulateNewUser
};

// Auto-check on load
console.log('\n🎯 Quick Commands:');
console.log('   WrestleBetDataManager.checkCurrentMode() - Check current status');
console.log('   WrestleBetDataManager.enableDatabaseMode() - Switch to database');
console.log('   WrestleBetDataManager.enableLocalStorageMode() - Switch to local');
console.log('   WrestleBetDataManager.simulateNewUser() - Clear all data');

// Show current status
checkCurrentMode();
console.log(`\n🔧 Current Mode: ${getDataMode().toUpperCase()}`);
