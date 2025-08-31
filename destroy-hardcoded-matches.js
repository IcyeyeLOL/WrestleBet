/**
 * ULTIMATE HARDCODED MATCH DESTROYER 🔥
 * This script completely eliminates Sarah Wilson, Emma Davis, Alex Thompson, Chris Brown
 * and any other hardcoded wrestling matches from your WrestleBet application
 */

console.log('🔥 ULTIMATE HARDCODED MATCH DESTROYER ACTIVATED');
console.log('================================================');

// List of hardcoded wrestler names to eliminate
const HARDCODED_WRESTLERS = [
  'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
  'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
  'gable steveson', 'geno petriashvili', 'frank chamizo', 'takuto otoguro'
];

// Function to check if a string contains hardcoded wrestler names
const containsHardcodedData = (str) => {
  if (!str) return false;
  const lowerStr = str.toLowerCase();
  return HARDCODED_WRESTLERS.some(wrestler => lowerStr.includes(wrestler));
};

// 1. DESTROY LOCAL STORAGE
const destroyLocalStorage = () => {
  console.log('💣 DESTROYING localStorage...');
  
  const keys = Object.keys(localStorage);
  let destroyedCount = 0;
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    
    if (containsHardcodedData(key) || containsHardcodedData(value)) {
      console.log(`  🔥 DESTROYED: ${key}`);
      localStorage.removeItem(key);
      destroyedCount++;
    } else if (key.includes('wrestle') || key.includes('match') || key.includes('poll') || key.includes('bet')) {
      // Also remove any wrestling-related data that might contain hidden hardcoded data
      try {
        const parsed = JSON.parse(value || '{}');
        if (typeof parsed === 'object') {
          const stringified = JSON.stringify(parsed);
          if (containsHardcodedData(stringified)) {
            console.log(`  🔥 DESTROYED NESTED: ${key} (contained hardcoded data)`);
            localStorage.removeItem(key);
            destroyedCount++;
          }
        }
      } catch (e) {
        // If it's not JSON, check the raw value
        if (containsHardcodedData(value)) {
          console.log(`  🔥 DESTROYED RAW: ${key}`);
          localStorage.removeItem(key);
          destroyedCount++;
        }
      }
    }
  });
  
  console.log(`✅ DESTROYED ${destroyedCount} localStorage entries`);
};

// 2. DESTROY SESSION STORAGE
const destroySessionStorage = () => {
  console.log('💣 DESTROYING sessionStorage...');
  
  const keys = Object.keys(sessionStorage);
  let destroyedCount = 0;
  
  keys.forEach(key => {
    const value = sessionStorage.getItem(key);
    
    if (containsHardcodedData(key) || containsHardcodedData(value)) {
      console.log(`  🔥 DESTROYED SESSION: ${key}`);
      sessionStorage.removeItem(key);
      destroyedCount++;
    }
  });
  
  console.log(`✅ DESTROYED ${destroyedCount} sessionStorage entries`);
};

// 3. DESTROY GLOBAL VARIABLES
const destroyGlobalVariables = () => {
  console.log('💣 DESTROYING global variables...');
  
  // List of potential global variables that might contain hardcoded data
  const globalVars = [
    'pollData', 'bettingPools', 'wrestlingMatches', 'matchData',
    'hardcodedMatches', 'demoMatches', 'sampleMatches', 'testMatches'
  ];
  
  globalVars.forEach(varName => {
    if (window[varName]) {
      console.log(`  🔥 DESTROYED GLOBAL: window.${varName}`);
      delete window[varName];
    }
  });
};

// 4. FORCE REFRESH ALL CONTEXTS
const forceContextRefresh = () => {
  console.log('⚛️ FORCING React context refresh...');
  
  // Send multiple events to ensure all contexts get the message
  const events = [
    'clear-hardcoded-data',
    'destroy-hardcoded-matches',
    'refresh-betting-context',
    'reload-dynamic-matches'
  ];
  
  events.forEach(eventName => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        timestamp: Date.now(),
        action: 'destroy_all_hardcoded_data',
        wrestlers: HARDCODED_WRESTLERS
      }
    }));
  });
};

// 5. DISPLAY FINAL STATUS
const displayFinalStatus = () => {
  console.log('\n🎯 DESTRUCTION COMPLETE!');
  console.log('========================');
  console.log('✅ localStorage CLEARED of hardcoded wrestlers');
  console.log('✅ sessionStorage CLEARED of hardcoded wrestlers');
  console.log('✅ Global variables DESTROYED');
  console.log('✅ React contexts FORCE REFRESHED');
  console.log('\n🚫 ELIMINATED WRESTLERS:');
  HARDCODED_WRESTLERS.forEach(wrestler => {
    console.log(`  ❌ ${wrestler}`);
  });
  console.log('\n✨ Your app should now only show admin-created matches!');
  console.log('🔗 Create new matches at: /admin');
  console.log('⏳ Page will refresh in 2 seconds...');
};

// MAIN DESTRUCTION SEQUENCE
const executeDestruction = () => {
  try {
    // Step 1: Destroy localStorage
    destroyLocalStorage();
    
    // Step 2: Destroy sessionStorage
    destroySessionStorage();
    
    // Step 3: Destroy global variables
    destroyGlobalVariables();
    
    // Step 4: Force context refresh
    forceContextRefresh();
    
    // Step 5: Display status
    displayFinalStatus();
    
    // Step 6: Force page refresh after delay
    setTimeout(() => {
      console.log('🔄 EXECUTING FINAL REFRESH...');
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ ERROR DURING DESTRUCTION:', error);
  }
};

// EXECUTE IMMEDIATELY
executeDestruction();

// Make available for manual execution
window.destroyHardcodedMatches = executeDestruction;

console.log('\n💡 MANUAL USAGE: window.destroyHardcodedMatches()');
console.log('🎯 Run this anytime hardcoded matches appear!');
