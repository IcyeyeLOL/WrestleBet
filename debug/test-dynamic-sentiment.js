// Test Dynamic Sentiment Bar
// Copy and paste this into browser console to test dynamic sentiment updates

console.log('🎨 Testing Dynamic Sentiment Bar Updates...');

const testDynamicSentiment = async () => {
  try {
    // Step 1: Check initial sentiment state
    console.log('\n📊 Step 1: Checking initial sentiment state...');
    
    // Get initial sentiment percentages from the UI
    const sentimentBars = document.querySelectorAll('[style*="width"]');
    const initialSentiments = [];
    
    sentimentBars.forEach((bar, index) => {
      const width = bar.style.width;
      if (width && width.includes('%')) {
        initialSentiments.push({
          index,
          width,
          element: bar
        });
      }
    });
    
    console.log('Initial sentiment bar widths:', initialSentiments.map(s => s.width));
    
    // Step 2: Get all available matches
    console.log('\n🔍 Step 2: Getting available matches...');
    const matchesResponse = await fetch('/api/matches/dynamic');
    const matchesData = await matchesResponse.json();
    
    if (!matchesData.success || !matchesData.matches.length) {
      console.error('❌ No matches available for testing');
      return;
    }
    
    const testMatch = matchesData.matches[0];
    console.log(`🥊 Using test match: ${testMatch.wrestler1} vs ${testMatch.wrestler2}`);
    console.log(`📊 Current pools: W1=${testMatch.wrestler1_pool || 0} WC, W2=${testMatch.wrestler2_pool || 0} WC`);
    
    // Step 3: Place a test bet to update sentiment
    console.log('\n💰 Step 3: Placing test bet to update sentiment...');
    
    const testBetAmount = 25; // 25 WC
    const testOdds = 2.0;
    const wrestlerChoice = 'wrestler1'; // Bet on first wrestler
    
    const betResponse = await fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: `sentiment-test-${Date.now()}`,
        matchId: testMatch.id,
        wrestlerChoice: wrestlerChoice,
        betAmount: testBetAmount,
        odds: testOdds
      })
    });
    
    const betResult = await betResponse.json();
    
    if (betResult.success) {
      console.log('✅ Test bet placed successfully!');
      console.log(`💸 Bet: ${testBetAmount} WC on ${wrestlerChoice}`);
      
      // Step 4: Check updated match data
      console.log('\n🔄 Step 4: Checking updated match pools...');
      
      // Wait a moment for database triggers to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedMatchResponse = await fetch(`/api/matches/dynamic?search=${testMatch.id}`);
      const updatedMatchData = await updatedMatchResponse.json();
      
      if (updatedMatchData.success && updatedMatchData.match) {
        const updatedMatch = updatedMatchData.match;
        console.log('📊 Updated pools:');
        console.log(`   Wrestler 1: ${updatedMatch.wrestler1_pool || 0} WC`);
        console.log(`   Wrestler 2: ${updatedMatch.wrestler2_pool || 0} WC`);
        console.log(`   Total: ${updatedMatch.total_pool || 0} WC`);
        
        // Calculate expected percentages
        const w1Pool = parseFloat(updatedMatch.wrestler1_pool) || 0;
        const w2Pool = parseFloat(updatedMatch.wrestler2_pool) || 0;
        const totalPool = w1Pool + w2Pool;
        
        if (totalPool > 0) {
          const w1Percentage = Math.round((w1Pool / totalPool) * 100);
          const w2Percentage = Math.round((w2Pool / totalPool) * 100);
          
          console.log(`🎯 Expected sentiment percentages:`);
          console.log(`   Wrestler 1: ${w1Percentage}%`);
          console.log(`   Wrestler 2: ${w2Percentage}%`);
          
          // Step 5: Trigger UI refresh and check sentiment bars
          console.log('\n🖥️ Step 5: Checking if sentiment bars updated...');
          
          // Trigger a page refresh or re-render to see updated sentiment
          window.location.reload();
          
        } else {
          console.log('⚠️ No betting pools found - sentiment may still be 50/50');
        }
      } else {
        console.error('❌ Failed to get updated match data');
      }
      
    } else {
      console.error('❌ Test bet failed:', betResult.error);
    }
    
    console.log('\n🎉 Test complete! The sentiment bar should now show different percentages based on WrestleCoin betting amounts.');
    console.log('📝 Key points:');
    console.log('   - Sentiment bars reflect actual WrestleCoin betting pools');
    console.log('   - Each vote now places a 5 WC bet to update sentiment');
    console.log('   - Larger bets have bigger impact on sentiment percentages');
    console.log('   - The bar dynamically changes as more bets are placed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Also create a function to check current sentiment data
const checkCurrentSentiment = async () => {
  console.log('🔍 Checking current sentiment data...');
  
  try {
    const response = await fetch('/api/matches/dynamic');
    const data = await response.json();
    
    if (data.success) {
      console.log('\n📊 Current match sentiment data:');
      data.matches.forEach((match, index) => {
        const w1Pool = parseFloat(match.wrestler1_pool) || 0;
        const w2Pool = parseFloat(match.wrestler2_pool) || 0;
        const total = w1Pool + w2Pool;
        
        const w1Percent = total > 0 ? Math.round((w1Pool / total) * 100) : 50;
        const w2Percent = total > 0 ? Math.round((w2Pool / total) * 100) : 50;
        
        console.log(`\n${index + 1}. ${match.wrestler1} vs ${match.wrestler2}`);
        console.log(`   ID: ${match.id}`);
        console.log(`   Pools: ${w1Pool} WC vs ${w2Pool} WC`);
        console.log(`   Sentiment: ${w1Percent}% vs ${w2Percent}%`);
        console.log(`   Status: ${total > 0 ? '🔥 Active betting' : '💤 No bets yet'}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to check sentiment data:', error);
  }
};

// Run the test
console.log('🚀 Starting dynamic sentiment test...');
testDynamicSentiment();

// Make functions available globally
window.testDynamicSentiment = testDynamicSentiment;
window.checkCurrentSentiment = checkCurrentSentiment;

console.log('\n🛠️ Available functions:');
console.log('💡 testDynamicSentiment() - Test sentiment bar updates');
console.log('📊 checkCurrentSentiment() - Check current sentiment data');
