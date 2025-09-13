// QUICK PERCENTAGE DEBUG - Run in Browser Console
// This will show exactly what's happening in the percentage calculation

console.log('🔍 PERCENTAGE CALCULATION DEBUG');
console.log('===============================');

async function debugPercentageCalculation() {
  try {
    const response = await fetch('/api/votes');
    const data = await response.json();
    
    if (!data.success || !data.matches) {
      console.log('❌ Failed to get match data');
      return;
    }
    
    data.matches.forEach((match, index) => {
      console.log(`\n📊 MATCH ${index + 1}: ${match.wrestler1} vs ${match.wrestler2}`);
      
      const wrestler1Pool = parseFloat(match.wrestler1_pool) || 0;
      const wrestler2Pool = parseFloat(match.wrestler2_pool) || 0;
      const totalPool = wrestler1Pool + wrestler2Pool;
      
      console.log('Raw data:', {
        wrestler1_pool: match.wrestler1_pool,
        wrestler2_pool: match.wrestler2_pool,
        total_pool: match.total_pool
      });
      
      console.log('Parsed data:', {
        wrestler1Pool,
        wrestler2Pool,
        totalPool
      });
      
      if (totalPool === 0) {
        console.log('⚠️ No bets - should show 50/50');
      } else {
        // Manual calculation
        const w1Percent = (wrestler1Pool / totalPool) * 100;
        const w2Percent = (wrestler2Pool / totalPool) * 100;
        
        console.log('Raw percentages:', {
          wrestler1: w1Percent.toFixed(2) + '%',
          wrestler2: w2Percent.toFixed(2) + '%',
          total: (w1Percent + w2Percent).toFixed(2) + '%'
        });
        
        const w1Rounded = Math.round(w1Percent);
        const w2Rounded = Math.round(w2Percent);
        
        console.log('Rounded percentages:', {
          wrestler1: w1Rounded + '%',
          wrestler2: w2Rounded + '%',
          total: (w1Rounded + w2Rounded) + '%'
        });
        
        console.log('Expected vs Current UI:');
        console.log(`Expected: ${match.wrestler1} ${w1Rounded}%, ${match.wrestler2} ${w2Rounded}%`);
        console.log('Current UI: Check what the bars actually show');
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugPercentageCalculation();
