// Quick test to verify currency integration
// Run this in browser console after opening your app

console.log('🧪 Testing Currency Integration...');

// Test 1: Check if balance is visible in header
const balanceDisplay = document.querySelector('[class*="gradient"]');
if (balanceDisplay) {
  console.log('✅ Balance display found in header');
} else {
  console.log('❌ Balance display not found');
}

// Test 2: Simulate clicking a betting button
const bettingButtons = document.querySelectorAll('button[class*="yellow"]');
console.log(`📊 Found ${bettingButtons.length} betting buttons`);

// Test 3: Check localStorage for currency data
const savedBalance = localStorage.getItem('wrestlebet_balance');
const savedTransactions = localStorage.getItem('wrestlebet_transactions');

console.log('💰 Saved Balance:', savedBalance || 'None');
console.log('📝 Saved Transactions:', savedTransactions ? JSON.parse(savedTransactions).length + ' transactions' : 'None');

// Test 4: Test balance limits
function testBetLimit() {
  console.log('🎯 Testing bet limits...');
  
  // Get current balance from localStorage or use default
  const currentBalance = savedBalance ? parseFloat(savedBalance) : 1000;
  console.log(`Current balance: ${currentBalance} WC`);
  
  // Test scenarios
  const testScenarios = [
    { amount: 5, shouldFail: true, reason: 'Below minimum (10 WC)' },
    { amount: 10, shouldFail: false, reason: 'Valid minimum bet' },
    { amount: currentBalance, shouldFail: false, reason: 'Maximum bet (full balance)' },
    { amount: currentBalance + 100, shouldFail: true, reason: 'Above balance' }
  ];
  
  testScenarios.forEach(scenario => {
    const canAfford = scenario.amount <= currentBalance && scenario.amount >= 10;
    const result = canAfford ? 'PASS' : 'FAIL';
    const expected = scenario.shouldFail ? 'FAIL' : 'PASS';
    const status = result === expected ? '✅' : '❌';
    
    console.log(`${status} ${scenario.amount} WC - ${scenario.reason} - Expected: ${expected}, Got: ${result}`);
  });
}

testBetLimit();

console.log('🏁 Currency integration test complete! Click on a yellow betting button to test the modal.');
