// CHECK WHAT'S IN THE BETS TABLE - Run in Browser Console
// This will show exactly what wrestler_choice values are being saved

console.log('🔍 BETS TABLE DIAGNOSTIC');
console.log('========================');

async function checkBetsTable() {
  try {
    console.log('📡 Checking what bets are actually stored...');
    
    // Get all bets to see what's saved
    const response = await fetch('/api/bets');
    const data = await response.json();
    
    if (!data.success) {
      console.log('❌ Failed to get bets data:', data);
      return;
    }
    
    console.log(`📊 Found ${data.bets?.length || 0} total bets:`);
    
    if (data.bets && data.bets.length > 0) {
      // Group bets by match
      const betsByMatch = {};
      
      data.bets.forEach(bet => {
        if (!betsByMatch[bet.match_id]) {
          betsByMatch[bet.match_id] = [];
        }
        betsByMatch[bet.match_id].push(bet);
      });
      
      Object.keys(betsByMatch).forEach(matchId => {
        const matchBets = betsByMatch[matchId];
        console.log(`\n📊 MATCH ${matchId}:`);
        
        let wrestler1Total = 0;
        let wrestler2Total = 0;
        
        matchBets.forEach((bet, index) => {
          console.log(`  Bet ${index + 1}:`, {
            wrestler_choice: bet.wrestler_choice,
            amount: bet.amount,
            user_id: bet.user_id,
            created_at: bet.created_at
          });
          
          if (bet.wrestler_choice === 'wrestler1') {
            wrestler1Total += parseFloat(bet.amount);
          } else if (bet.wrestler_choice === 'wrestler2') {
            wrestler2Total += parseFloat(bet.amount);
          } else {
            console.log(`⚠️ INVALID wrestler_choice: ${bet.wrestler_choice}`);
          }
        });
        
        console.log(`💰 Calculated totals:`, {
          wrestler1_total: wrestler1Total,
          wrestler2_total: wrestler2Total,
          total: wrestler1Total + wrestler2Total
        });
        
        // Check if this matches what's in the matches table
        console.log('🔍 Compare with database matches table data from earlier diagnostic');
      });
    } else {
      console.log('⚠️ No bets found in database');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the check
checkBetsTable();

console.log('\n🎯 WHAT TO LOOK FOR:');
console.log('1. Check wrestler_choice values - should be "wrestler1" or "wrestler2"');
console.log('2. Check if amounts are going to the right wrestlers');
console.log('3. Compare calculated totals with matches table data');
console.log('4. If wrestler_choice is wrong, the issue is in the frontend');
console.log('5. If wrestler_choice is right but pools are wrong, the issue is in database triggers');
