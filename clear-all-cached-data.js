// COMPREHENSIVE CLEANUP SCRIPT
// Run this in your browser console to remove ALL hardcoded data

console.log('🧹 COMPREHENSIVE CLEANUP - Removing ALL hardcoded data...');

// Clear ALL localStorage
localStorage.clear();
console.log('✅ Cleared ALL localStorage');

// Clear ALL sessionStorage
sessionStorage.clear();
console.log('✅ Cleared ALL sessionStorage');

// Clear browser cache for this domain
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log(`🗑️ Deleted cache: ${name}`);
    }
  });
}

// Clear any IndexedDB data
if ('indexedDB' in window) {
  indexedDB.databases().then(function(databases) {
    databases.forEach(function(database) {
      indexedDB.deleteDatabase(database.name);
      console.log(`🗑️ Deleted IndexedDB: ${database.name}`);
    });
  });
}

// Clear any service worker registrations
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ Unregistered service worker');
    }
  });
}

// Force reload the page to clear any in-memory data
console.log('🔄 Reloading page to clear all cached data...');
setTimeout(() => {
  window.location.reload(true); // true = hard reload
}, 1000);

console.log('🎉 COMPREHENSIVE CLEANUP COMPLETE!');
console.log('📋 Next steps:');
console.log('1. Wait for page reload');
console.log('2. You should see "No Matches Available" message');
console.log('3. No more hardcoded wrestlers should appear');
console.log('4. Use admin panel to create real matches');
