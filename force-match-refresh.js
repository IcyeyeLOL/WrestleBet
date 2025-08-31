// Force Match Refresh - Run in Browser Console
// This will force refresh the matches to show the new David vs Kunle match

console.log('🔄 Forcing match refresh...');

// Force reload the page to trigger fresh data load
window.location.reload();

// Alternative: Trigger custom event to reload matches without full page reload
// (Uncomment if you prefer this approach)
/*
window.dispatchEvent(new CustomEvent('admin-match-created', {
  detail: {
    matchId: '423f65d9-1011-4156-9a8a-59bb956be59a',
    wrestler1: 'David',
    wrestler2: 'Kunle'
  }
}));
*/
