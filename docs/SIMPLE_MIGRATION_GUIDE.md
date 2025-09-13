# 🌍 SIMPLE DATABASE MIGRATION GUIDE
=====================================

## STEP 1: TEST DATABASE (2 minutes)
1. Open http://localhost:3002 in browser
2. Open Browser Console (F12)
3. Copy and paste the code from `test-database-connection.js`
4. If you see "✅ WORKING!" - your database is ready!

## STEP 2: ENABLE GLOBAL MODE (30 seconds)
Find this line in `app/contexts/DatabaseBettingContext.jsx`:
```javascript
// Around line 170, in the loadPollData function, change:
const savedPollData = localStorage.getItem('wrestlebet_polls');

// TO:
console.log('🌍 GLOBAL DATABASE MODE ENABLED');
// Skip localStorage and force database loading
const savedPollData = null; // Force database mode
```

## STEP 3: TEST GLOBAL BEHAVIOR (1 minute)
1. Clear all localStorage: `localStorage.clear()`
2. Refresh the page
3. You should see database data instead of test data
4. Open multiple browser tabs - they should show same data!

## STEP 4: USER PROFILES (Optional - 5 minutes)
- Link votes to Clerk user IDs
- Store user balances in database
- Enable real-time updates

## EXPECTED RESULTS:
- ✅ All users see same betting pools
- ✅ Real-time vote updates across browsers  
- ✅ No more isolated localStorage data
- ✅ True global wrestling betting experience

## ROLLBACK (if needed):
Change `const savedPollData = null;` back to `const savedPollData = localStorage.getItem('wrestlebet_polls');`
