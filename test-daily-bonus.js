// Test Daily Bonus System
// Run this in browser console to test the daily bonus functionality

console.log('🎁 Testing Daily Bonus System...');

// Test 1: Check if daily bonus button is visible
const dailyBonusButton = document.querySelector('button:has([data-lucide="gift"])') || 
                        document.querySelector('*:contains("Daily Bonus")') ||
                        document.querySelector('*:contains("Claim")');

if (dailyBonusButton) {
  console.log('✅ Daily bonus button found in header');
} else {
  console.log('❌ Daily bonus button not found');
}

// Test 2: Check localStorage for daily bonus data
const lastDailyBonus = localStorage.getItem('wrestlebet_last_daily_bonus');
console.log('📅 Last daily bonus claimed:', lastDailyBonus || 'Never');

// Test 3: Calculate time since last bonus
if (lastDailyBonus) {
  const lastBonusTime = new Date(lastDailyBonus);
  const now = new Date();
  const timeDiff = now.getTime() - lastBonusTime.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`⏰ Time since last bonus: ${hours}h ${minutes}m`);
  
  if (timeDiff >= 24 * 60 * 60 * 1000) {
    console.log('✅ Daily bonus should be available (24h+ passed)');
  } else {
    const hoursLeft = 24 - hours;
    const minutesLeft = 60 - minutes;
    console.log(`⏳ Daily bonus available in: ${hoursLeft}h ${minutesLeft}m`);
  }
} else {
  console.log('✅ Daily bonus should be available (first time)');
}

// Test 4: Simulate different time scenarios
function testDailyBonusScenarios() {
  console.log('\n🧪 Testing Daily Bonus Scenarios:');
  
  const scenarios = [
    { name: 'First time user', lastBonus: null, shouldBeAvailable: true },
    { name: '1 hour ago', lastBonus: Date.now() - (1 * 60 * 60 * 1000), shouldBeAvailable: false },
    { name: '12 hours ago', lastBonus: Date.now() - (12 * 60 * 60 * 1000), shouldBeAvailable: false },
    { name: '24 hours ago', lastBonus: Date.now() - (24 * 60 * 60 * 1000), shouldBeAvailable: true },
    { name: '48 hours ago', lastBonus: Date.now() - (48 * 60 * 60 * 1000), shouldBeAvailable: true }
  ];
  
  scenarios.forEach(scenario => {
    const now = Date.now();
    const timeDiff = scenario.lastBonus ? now - scenario.lastBonus : Infinity;
    const isAvailable = !scenario.lastBonus || timeDiff >= (24 * 60 * 60 * 1000);
    const result = isAvailable === scenario.shouldBeAvailable ? '✅' : '❌';
    
    console.log(`${result} ${scenario.name}: Expected ${scenario.shouldBeAvailable}, Got ${isAvailable}`);
  });
}

testDailyBonusScenarios();

// Test 5: Manual testing functions
window.testDailyBonus = {
  // Reset to make bonus available now
  makeAvailable: () => {
    localStorage.removeItem('wrestlebet_last_daily_bonus');
    console.log('🔄 Reset daily bonus - should be available now. Reload page to see changes.');
  },
  
  // Set last bonus to 25 hours ago (should be available)
  makeAvailable25h: () => {
    const twentyFiveHoursAgo = new Date(Date.now() - (25 * 60 * 60 * 1000));
    localStorage.setItem('wrestlebet_last_daily_bonus', twentyFiveHoursAgo.toISOString());
    console.log('🔄 Set last bonus to 25 hours ago - should be available. Reload page to see changes.');
  },
  
  // Set last bonus to 1 hour ago (should NOT be available)
  makeUnavailable: () => {
    const oneHourAgo = new Date(Date.now() - (1 * 60 * 60 * 1000));
    localStorage.setItem('wrestlebet_last_daily_bonus', oneHourAgo.toISOString());
    console.log('🔄 Set last bonus to 1 hour ago - should NOT be available. Reload page to see changes.');
  },
  
  // Check current status
  checkStatus: () => {
    const lastBonus = localStorage.getItem('wrestlebet_last_daily_bonus');
    if (!lastBonus) {
      console.log('📋 Status: First time user - bonus available');
      return;
    }
    
    const lastBonusTime = new Date(lastBonus);
    const now = new Date();
    const timeDiff = now.getTime() - lastBonusTime.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (timeDiff >= twentyFourHours) {
      console.log('📋 Status: Bonus available (24h+ passed)');
    } else {
      const hoursLeft = Math.ceil((twentyFourHours - timeDiff) / (1000 * 60 * 60));
      console.log(`📋 Status: Bonus not available (${hoursLeft} hours remaining)`);
    }
  }
};

console.log('\n🎮 Manual Testing Commands:');
console.log('testDailyBonus.makeAvailable() - Make bonus available');
console.log('testDailyBonus.makeAvailable25h() - Set to 25h ago (available)');
console.log('testDailyBonus.makeUnavailable() - Set to 1h ago (not available)');
console.log('testDailyBonus.checkStatus() - Check current status');
console.log('\n🏁 Daily bonus test complete! Try clicking the daily bonus button in the header.');
