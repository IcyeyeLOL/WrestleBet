// Test script to verify dynamic odds based on public sentiment
// Paste this into browser console to test the odds system

function testDynamicOdds() {
  console.log('🎯 Testing dynamic odds system...');
  
  // Clear any existing data to start fresh
  localStorage.removeItem('wrestlebet_polls');
  
  console.log('✅ Cleared localStorage - odds should now show 0.00');
  console.log('🔄 Reload the page to see all odds start at 0.00');
  
  // Create test scenario: simulate voting pattern
  const testScenarios = [
    { name: 'Equal votes', taylor: 2, yazdani: 2 },
    { name: 'Taylor favored', taylor: 7, yazdani: 3 },
    { name: 'Yazdani favored', taylor: 2, yazdani: 8 },
    { name: 'Heavy Taylor favorite', taylor: 9, yazdani: 1 },
  ];
  
  console.log('\n📊 Expected odds calculations:');
  testScenarios.forEach(scenario => {
    const totalVotes = scenario.taylor + scenario.yazdani;
    const taylorOdds = Math.max(1.10, (totalVotes / scenario.taylor)).toFixed(2);
    const yazdaniOdds = Math.max(1.10, (totalVotes / scenario.yazdani)).toFixed(2);
    
    console.log(`📈 ${scenario.name}:`);
    console.log(`   Taylor: ${scenario.taylor} votes → ${taylorOdds} odds`);
    console.log(`   Yazdani: ${scenario.yazdani} votes → ${yazdaniOdds} odds`);
    console.log(`   (Lower odds = higher probability)`);
  });
  
  console.log('\n🎮 Test Instructions:');
  console.log('1. Reload the page - all odds should show 0.00');
  console.log('2. Vote for Taylor - Taylor odds should appear, Yazdani should stay 0.00 or show very high odds');
  console.log('3. Vote for Yazdani - both should have reasonable odds based on vote distribution');
  console.log('4. Continue voting - odds should adjust based on public sentiment!');
}

// Run the test
testDynamicOdds();
