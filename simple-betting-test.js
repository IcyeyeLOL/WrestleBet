// SIMPLE BETTING TEST - Run in Browser Console
// This will test the complete betting flow with detailed logging

console.log('🎯 SIMPLE BETTING FLOW TEST');
console.log('==========================');

// Step 1: Check current page state
console.log('📊 Step 1: Checking current page state...');

// Check if dynamic matches are loaded
if (window.dynamicMatches) {
  console.log('✅ Dynamic matches found:', window.dynamicMatches.length);
} else {
  console.log('❌ Dynamic matches not accessible from window');
}

// Step 2: Manually trigger a bet through the UI
console.log('\n💰 Step 2: Manual betting test instructions...');
console.log('1. Click on a wrestler betting button');
console.log('2. Enter 100 WC in the modal');
console.log('3. Confirm the bet');
console.log('4. Watch the console for these messages:');
console.log('   - "🔄 Loading dynamic matches from database..."');
console.log('   - "📊 Raw matches from database..."');
console.log('   - "🎯 Setting dynamicMatches state - this should trigger UI re-render"');
console.log('   - "🔍 getPercentage called for..."');

// Step 3: Set up monitoring for betting updates
console.log('\n📡 Step 3: Setting up real-time monitoring...');

let originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  
  // Look for specific betting-related messages
  const message = args.join(' ');
  if (message.includes('Real-time bet update') || 
      message.includes('Setting dynamicMatches state') ||
      message.includes('getPercentage called') ||
      message.includes('Real percentage calculation')) {
    originalConsoleLog('🎯 BETTING FLOW DETECTED:', message);
  }
};

// Step 4: Monitor for UI changes
console.log('\n👀 Step 4: UI change monitoring active...');
console.log('Place a bet now and watch for:');
console.log('- Percentage bar changes');
console.log('- Pool amount updates'); 
console.log('- Console log messages');

// Clean up function
window.stopBettingTest = () => {
  console.log = originalConsoleLog;
  console.log('🧹 Betting test monitoring stopped');
};

console.log('\n💡 To stop monitoring, run: stopBettingTest()');
console.log('==========================');
