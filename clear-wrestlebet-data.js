// Clear Local Data for WrestleBet App
// ==================================

console.log('🧹 Clearing WrestleBet Local Data...');

// Clear all localStorage data related to WrestleBet
const keysToRemove = [
  'wrestlebet_betting_pools',
  'wrestlebet_polls',
  'wrestlebet_bets',
  'wrestlebet_balance',
  'wrestlebet_last_daily_bonus',
  'wrestlebet_transactions'
];

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`✅ Removed: ${key}`);
});

// Clear sessionStorage as well
keysToRemove.forEach(key => {
  sessionStorage.removeItem(key);
});

console.log('🎯 All WrestleBet data cleared!');
console.log('📄 Refresh the page to see fresh data.');

// Show what's left in localStorage
console.log('🔍 Remaining localStorage keys:', Object.keys(localStorage));
