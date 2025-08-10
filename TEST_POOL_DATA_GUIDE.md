# 🧪 TEST POOL DATA COMMANDS

## Option 1: Use the Browser Console Script
1. Start your app: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open browser console (F12)
4. Copy and paste the content from `add-test-pool-data.js`
5. Reload the page to see the odds!

## Option 2: Code-Based Test Data (Already Applied!)
I've updated your `DatabaseBettingContext.jsx` with test data:

**Taylor vs Yazdani:** 7 votes vs 3 votes
- Expected odds: Taylor `1.43`, Yazdani `3.33`

**Dake vs Punia:** 0 votes vs 0 votes  
- Expected odds: Both `0.00`

**Steveson vs Petriashvili:** 2 votes vs 8 votes
- Expected odds: Steveson `5.00`, Petriashvili `1.25`

## Option 3: Manual Testing via UI
1. Clear data: `localStorage.removeItem('wrestlebet_polls')`
2. Reload page (should show test data above)
3. Vote on matches to see odds update in real-time!

## Expected Results:
✅ **Taylor-Yazdani**: Taylor favored (1.43 odds), Yazdani underdog (3.33 odds)
✅ **Dake-Punia**: Both show 0.00 (no votes)
✅ **Steveson-Petriashvili**: Petriashvili favored (1.25), Steveson underdog (5.00)

## To Reset to Clean State:
Change the vote counts back to 0 in `DatabaseBettingContext.jsx` lines 157-175
