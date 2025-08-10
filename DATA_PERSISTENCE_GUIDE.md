# 📊 WrestleBet Data Persistence Guide

## **Current Status: HYBRID SYSTEM**

Your WrestleBet app currently uses **both local browser storage AND database**, with localStorage as the primary method and database as a fallback.

## 🏠 **Local Storage (Current Primary Method)**

### **What's Stored Locally:**
- `wrestlebet_polls` - Vote counts for each match
- `wrestlebet_betting_pools` - WrestleCoin amounts bet on each wrestler
- `wrestlebet_bets` - User's individual betting history
- `wrestlebet_balance` - User's WrestleCoin balance
- `wrestlebet_last_daily_bonus` - Daily bonus claim timestamp

### **Scope:**
✅ **Per-User/Per-Browser**: Each person using your app gets their own data  
✅ **Persistent**: Data survives browser restarts  
❌ **Not Shared**: Users can't see each other's betting activity  
❌ **Cleared**: Lost when user clears browser data  

## 🗄️ **Database (Supabase - Secondary Method)**

### **Database Tables Ready:**
- `users` - User profiles and balances
- `matches` - Wrestling match information  
- `bets` - All user bets (shared across users)
- `votes` - Public voting data (shared across users)
- `wrestlecoin_transactions` - Transaction history

### **Scope:**
✅ **Shared**: All users see the same betting pools and odds  
✅ **Permanent**: Data persists even if users clear browsers  
✅ **Real-time**: Updates immediately for all users  
⚠️ **Currently Fallback**: Only used if localStorage fails  

## 🔧 **How It Currently Works:**

### **When Someone Uses Your App:**

1. **First Time Visit:**
   - Gets initial test data (Taylor: 350 WC, Yazdani: 150 WC, etc.)
   - Data stored in their browser's localStorage
   - Database connection attempted but not required

2. **Placing Bets:**
   - Updates localStorage immediately (fast UI response)
   - Tries to sync with database in background
   - If database fails, continues with localStorage only

3. **Viewing Odds:**
   - Calculated from localStorage betting pools
   - Updates in real-time based on local data
   - Each user sees their own version

## 🚀 **For Production Deployment:**

### **Option A: Keep Current Hybrid System**
```javascript
// Users get isolated experiences
// Good for: Testing, demos, offline functionality
// Bad for: True shared betting pools
```

### **Option B: Switch to Database-First**
```javascript
// All users share same betting pools
// Good for: Real betting platform experience
// Requires: Active Supabase connection
```

## 📱 **What New Users Will See:**

### **Current Setup (localStorage-first):**
- **New User Experience**: Gets fresh test data with sample bets
- **Betting Pools**: Start with predefined amounts (Taylor: 350 WC, etc.)
- **Odds**: Based on test betting distribution
- **Isolation**: Can't see other users' bets

### **Database-First Setup:**
- **New User Experience**: Sees real betting pools from all users
- **Betting Pools**: Reflects actual community betting
- **Odds**: Based on real user activity
- **Shared**: All users contribute to same pools

## 🔄 **Switching Between Systems:**

### **To Force Database-Only Mode:**
1. Comment out localStorage fallbacks in `DatabaseBettingContext.jsx`
2. Remove `localStorage.getItem` calls
3. Ensure Supabase connection is active

### **To Force localStorage-Only Mode:**
1. Comment out all `fetch('/api/...')` calls
2. Remove database sync attempts
3. Keep only localStorage operations

## 🧪 **Current Test Data:**

When someone first uses your app, they get:

```javascript
// Initial betting pools (in WrestleCoins)
'taylor-yazdani': { taylor: 350 WC, yazdani: 150 WC }
'dake-punia': { dake: 200 WC, punia: 800 WC }  
'steveson-petriashvili': { steveson: 100 WC, petriashvili: 250 WC }
```

This creates realistic odds and percentages for testing!

## ⚡ **Quick Actions:**

### **Clear All Local Data:**
```javascript
// Run in browser console
localStorage.removeItem('wrestlebet_polls');
localStorage.removeItem('wrestlebet_betting_pools');
localStorage.removeItem('wrestlebet_bets');
localStorage.removeItem('wrestlebet_balance');
localStorage.removeItem('wrestlebet_last_daily_bonus');
location.reload();
```

### **Check Current Data:**
```javascript
// See what's stored locally
console.log('Betting Pools:', JSON.parse(localStorage.getItem('wrestlebet_betting_pools')));
console.log('User Balance:', localStorage.getItem('wrestlebet_balance'));
```
