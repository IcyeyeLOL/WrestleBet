// Test Dual-Color Sentiment Bars
// Copy and paste this into browser console to test

console.log('🎨 Testing Dual-Color Sentiment Bars...');

// Mock data based on current betting pools
const testData = {
  'taylor-yazdani': {
    taylor: 70,    // 350 WC out of 500 total
    yazdani: 30    // 150 WC out of 500 total
  },
  'dake-punia': {
    dake: 20,      // 200 WC out of 1000 total  
    punia: 80      // 800 WC out of 1000 total
  },
  'steveson-petriashvili': {
    steveson: 29,  // 100 WC out of 350 total
    petriashvili: 71 // 250 WC out of 350 total
  }
};

console.log('\n📊 Expected Visual Bar Results:');
console.log('================================');

Object.entries(testData).forEach(([match, wrestlers]) => {
  const wrestler1 = Object.keys(wrestlers)[0];
  const wrestler2 = Object.keys(wrestlers)[1];
  const percentage1 = wrestlers[wrestler1];
  const percentage2 = wrestlers[wrestler2];
  
  console.log(`\n${match.toUpperCase()}:`);
  console.log(`🟢 ${wrestler1}: ${percentage1}% (Green bar from left)`);
  console.log(`🔴 ${wrestler2}: ${percentage2}% (Red bar from right)`);
  
  // Visual representation
  const bar = '█'.repeat(Math.round(percentage1/5)) + '░'.repeat(20 - Math.round(percentage1/5));
  console.log(`Visual: 🟢${bar.substring(0, Math.round(percentage1/5))}🔴${bar.substring(Math.round(percentage1/5))}`);
});

console.log('\n✅ What You Should See:');
console.log('- Green bars filling from LEFT (wrestler 1 percentage)');
console.log('- Red bars filling from RIGHT (wrestler 2 percentage)');
console.log('- Colored dots next to wrestler names (🟢 green, 🔴 red)');
console.log('- Bars should add up to 100% total width');
console.log('- Smooth animations when percentages change');

console.log('\n🎯 Color Meanings:');
console.log('🟢 GREEN = Leading in WC betting (higher sentiment)');
console.log('🔴 RED = Trailing in WC betting (lower sentiment)');

console.log('\n🔄 Test Instructions:');
console.log('1. Look at the sentiment bars under each match');
console.log('2. Green should fill from left, red from right');
console.log('3. Place a bet to see the bars update dynamically');
console.log('4. Check that colored dots match the bar colors');
