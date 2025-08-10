// Quick test to add pool data and verify dynamic odds
// Paste this into browser console after opening your app

function addTestPoolData() {
  console.log('🧪 Adding test pool data...');
  
  // Create test data with various vote distributions
  const testPoolData = {
    'taylor-yazdani': {
      taylor: 7,          // Taylor has 7 votes
      yazdani: 3,         // Yazdani has 3 votes  
      'David Taylor': 7,
      'Hassan Yazdani': 3,
      totalVotes: 10,
      wrestler1: 'David Taylor',
      wrestler2: 'Hassan Yazdani',
      matchId: 'test-1'
    },
    'dake-punia': {
      dake: 2,            // Dake has 2 votes
      punia: 8,           // Punia has 8 votes (upset!)
      'Kyle Dake': 2,
      'Bajrang Punia': 8,
      totalVotes: 10,
      wrestler1: 'Kyle Dake',
      wrestler2: 'Bajrang Punia',
      matchId: 'test-2'
    },
    'steveson-petriashvili': {
      steveson: 5,        // Equal votes
      petriashvili: 5,    // Equal votes
      'Gable Steveson': 5,
      'Geno Petriashvili': 5,
      totalVotes: 10,
      wrestler1: 'Gable Steveson',
      wrestler2: 'Geno Petriashvili',
      matchId: 'test-3'
    }
  };
  
  // Save to localStorage
  localStorage.setItem('wrestlebet_polls', JSON.stringify(testPoolData));
  
  console.log('✅ Test pool data added:', testPoolData);
  console.log('🔄 Reload the page to see the odds!');
  
  // Calculate and show expected odds
  console.log('\n📊 Expected Odds:');
  console.log('Taylor-Yazdani: Taylor 1.43 (7/10), Yazdani 3.33 (3/10)');
  console.log('Dake-Punia: Dake 5.00 (2/10), Punia 1.25 (8/10)');
  console.log('Steveson-Petriashvili: Both 2.00 (5/10 each)');
}

// Run the function
addTestPoolData();
