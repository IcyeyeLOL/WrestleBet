// Clear all hardcoded data from localStorage
// Run this in the browser console to remove all fake data

console.log('🧹 Clearing all hardcoded data...');

// Clear all wrestling-related localStorage items
const keysToRemove = [
  'wrestlebet_betting_pools',
  'wrestlebet_global_data',
  'wrestlebet_global_matches',
  'wrestlebet_bets',
  'admin_demo_matches',
  'wrestle_bet_global_data'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Removed: ${key}`);
  } else {
    console.log(`ℹ️ Not found: ${key}`);
  }
});

// Also clear sessionStorage
const sessionKeysToRemove = [
  'wrestlebet_betting_pools',
  'wrestlebet_global_data',
  'wrestlebet_global_matches',
  'wrestlebet_bets',
  'admin_demo_matches',
  'wrestle_bet_global_data'
];

sessionKeysToRemove.forEach(key => {
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key);
    console.log(`✅ Removed from sessionStorage: ${key}`);
  }
});

console.log('🎉 All hardcoded data cleared! Refresh the page to see the clean state.');
