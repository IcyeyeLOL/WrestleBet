// Test to verify that voting actually works and updates percentages
// Paste this into browser console to test the complete voting flow

function testVotingFlow() {
  console.log('🧪 Testing complete voting flow...');
  
  // Step 1: Clear any existing data
  localStorage.removeItem('wrestlebet_polls');
  console.log('✅ Cleared localStorage');
  
  // Step 2: Reload to get fresh test data
  console.log('🔄 PLEASE RELOAD THE PAGE NOW to get fresh test data');
  console.log('📋 After reload, run testVoteAndCheck() in console');
}

function testVoteAndCheck() {
  console.log('🎯 Testing vote and percentage update...');
  
  // Check current state
  const currentData = localStorage.getItem('wrestlebet_polls');
  if (currentData) {
    const parsed = JSON.parse(currentData);
    console.log('📊 Current poll data:', parsed);
    
    // Check taylor-yazdani match
    const taylorMatch = parsed['taylor-yazdani'];
    if (taylorMatch) {
      console.log('\n🥊 Taylor-Yazdani Match:');
      console.log(`   Taylor votes: ${taylorMatch.taylor}`);
      console.log(`   Yazdani votes: ${taylorMatch.yazdani}`);
      console.log(`   Total votes: ${taylorMatch.totalVotes}`);
      
      if (taylorMatch.totalVotes > 0) {
        const taylorPercentage = Math.round((taylorMatch.taylor / taylorMatch.totalVotes) * 100);
        const yazdaniPercentage = Math.round((taylorMatch.yazdani / taylorMatch.totalVotes) * 100);
        console.log(`   Taylor should show: ${taylorPercentage}%`);
        console.log(`   Yazdani should show: ${yazdaniPercentage}%`);
      }
    }
  } else {
    console.log('❌ No poll data found. Please reload the page first.');
  }
  
  console.log('\n🎮 Now click on a voting button and watch console for updates!');
  console.log('📈 Check if percentages change on the UI');
}

// Run initial test
testVotingFlow();
