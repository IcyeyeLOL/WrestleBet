/**
 * Complete Hardcoded Data Removal Script
 * Run this in browser console to remove ALL hardcoded wrestling matches
 */

console.log('🔥 REMOVING ALL HARDCODED WRESTLING MATCHES...');

// Function to clear all localStorage data related to wrestling matches
const clearAllWrestlingData = () => {
  console.log('📦 Clearing localStorage...');
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  let clearedCount = 0;
  
  keys.forEach(key => {
    // Remove any key that might contain match data
    if (key.includes('wrestle') || 
        key.includes('match') || 
        key.includes('betting') || 
        key.includes('poll') || 
        key.includes('vote') ||
        key.includes('sarah') ||
        key.includes('emma') ||
        key.includes('alex') ||
        key.includes('chris') ||
        key.includes('wilson') ||
        key.includes('davis') ||
        key.includes('thompson') ||
        key.includes('brown')) {
      
      console.log(`  ❌ Removing: ${key} = ${localStorage.getItem(key)?.substring(0, 100)}...`);
      localStorage.removeItem(key);
      clearedCount++;
    }
  });
  
  console.log(`✅ Cleared ${clearedCount} localStorage entries`);
};

// Function to clear sessionStorage as well
const clearSessionStorage = () => {
  console.log('📦 Clearing sessionStorage...');
  
  const keys = Object.keys(sessionStorage);
  let clearedCount = 0;
  
  keys.forEach(key => {
    if (key.includes('wrestle') || 
        key.includes('match') || 
        key.includes('betting') || 
        key.includes('poll') ||
        key.includes('sarah') ||
        key.includes('emma') ||
        key.includes('alex') ||
        key.includes('chris')) {
      
      console.log(`  ❌ Removing session: ${key}`);
      sessionStorage.removeItem(key);
      clearedCount++;
    }
  });
  
  console.log(`✅ Cleared ${clearedCount} sessionStorage entries`);
};

// Function to clear any global variables that might contain hardcoded data
const clearGlobalVariables = () => {
  console.log('🌍 Clearing global variables...');
  
  // Clear any window variables that might contain match data
  if (window.pollData) {
    window.pollData = {};
    console.log('  ❌ Cleared window.pollData');
  }
  
  if (window.bettingPools) {
    window.bettingPools = {};
    console.log('  ❌ Cleared window.bettingPools');
  }
  
  if (window.wrestlingMatches) {
    window.wrestlingMatches = {};
    console.log('  ❌ Cleared window.wrestlingMatches');
  }
  
  // Clear any React context data if accessible
  if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('  🔄 Attempting to clear React context data...');
  }
};

// Function to force reload all React contexts
const forceReactRefresh = () => {
  console.log('⚛️ Forcing React refresh...');
  
  // Dispatch a custom event to trigger context refresh
  window.dispatchEvent(new CustomEvent('clear-hardcoded-data', {
    detail: { 
      timestamp: Date.now(),
      action: 'remove_all_hardcoded_matches'
    }
  }));
  
  // Force a page refresh after a short delay
  setTimeout(() => {
    console.log('🔄 Refreshing page to clear all cached data...');
    window.location.reload();
  }, 1000);
};

// Main execution function
const removeAllHardcodedMatches = () => {
  try {
    console.log('🚀 STARTING COMPLETE HARDCODED DATA REMOVAL');
    console.log('===============================================');
    
    // Step 1: Clear localStorage
    clearAllWrestlingData();
    
    // Step 2: Clear sessionStorage
    clearSessionStorage();
    
    // Step 3: Clear global variables
    clearGlobalVariables();
    
    // Step 4: Log current status
    console.log('\n📊 Current Status:');
    console.log('==================');
    console.log('✅ localStorage cleared of wrestling data');
    console.log('✅ sessionStorage cleared of wrestling data');
    console.log('✅ Global variables cleared');
    console.log('⏳ Page will refresh in 1 second...');
    
    // Step 5: Force React refresh
    forceReactRefresh();
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

// Execute immediately
removeAllHardcodedMatches();

// Make function available globally for manual use
window.removeAllHardcodedMatches = removeAllHardcodedMatches;

console.log('\n💡 Manual Usage: Run window.removeAllHardcodedMatches() anytime');
console.log('🎯 After this script runs, only admin-created matches should appear!');
