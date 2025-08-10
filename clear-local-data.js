// Clear Local Data Utility Functions

// Clear all localStorage
function clearLocalStorage() {
  localStorage.clear();
  console.log('✅ Local Storage cleared');
}

// Clear all sessionStorage
function clearSessionStorage() {
  sessionStorage.clear();
  console.log('✅ Session Storage cleared');
}

// Clear specific localStorage keys related to your app
function clearAppSpecificData() {
  const keysToRemove = [
    'betting-votes',
    'betting-pools', 
    'user-balance',
    'selected-matches',
    'betting-history',
    'wrestle-bet-data'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ App-specific data cleared');
}

// Clear all browser data (requires user permission)
function clearAllBrowserData() {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  localStorage.clear();
  sessionStorage.clear();
  
  console.log('✅ All browser data cleared');
}

// Add a reset button to your app
function addResetButton() {
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '🔄 Reset App Data';
  resetBtn.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
  `;
  
  resetBtn.onclick = () => {
    if (confirm('Are you sure you want to clear all app data?')) {
      clearAppSpecificData();
      window.location.reload();
    }
  };
  
  document.body.appendChild(resetBtn);
}

// Run this in browser console:
// clearLocalStorage(); clearSessionStorage(); window.location.reload();

// Export for use in React components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    clearLocalStorage,
    clearSessionStorage,
    clearAppSpecificData,
    clearAllBrowserData,
    addResetButton
  };
}
