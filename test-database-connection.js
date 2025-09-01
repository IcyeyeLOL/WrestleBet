// DATABASE CONNECTION TEST - Run in Browser Console
// This will test the Supabase connection and betting table access

console.log('🔌 DATABASE CONNECTION TEST');
console.log('============================');

async function testDatabaseConnection() {
  try {
    console.log('📊 Step 1: Testing Supabase client...');
    
    if (!window.supabase) {
      console.log('❌ Supabase client not found in window object');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Step 2: Test matches table access
    console.log('\n📋 Step 2: Testing matches table access...');
    
    const { data: matches, error: matchesError } = await window.supabase
      .from('matches')
      .select('*')
      .limit(5);
    
    if (matchesError) {
      console.error('❌ Error accessing matches table:', matchesError);
    } else {
      console.log(`✅ Matches table accessible - found ${matches?.length || 0} matches`);
      console.log('Sample matches:', matches);
    }
    
    // Step 3: Test bets table access
    console.log('\n💰 Step 3: Testing bets table access...');
    
    const { data: bets, error: betsError } = await window.supabase
      .from('bets')
      .select('*')
      .limit(10);
    
    if (betsError) {
      console.error('❌ Error accessing bets table:', betsError);
      console.log('🔍 This might be a permissions issue or the table doesn\'t exist');
    } else {
      console.log(`✅ Bets table accessible - found ${bets?.length || 0} bets`);
      console.log('All bets in database:', bets);
      
      if (bets && bets.length > 0) {
        // Group bets by match
        const betsByMatch = bets.reduce((acc, bet) => {
          if (!acc[bet.match_id]) acc[bet.match_id] = [];
          acc[bet.match_id].push(bet);
          return acc;
        }, {});
        
        console.log('📊 Bets grouped by match:', betsByMatch);
      }
    }
    
    // Step 4: Test specific match
    console.log('\n🎯 Step 4: Testing specific match bets...');
    
    const targetMatchId = '391f7afb-4d6d-4c02-82cb-10288243578b';
    
    const { data: matchBets, error: matchBetsError } = await window.supabase
      .from('bets')
      .select('*')
      .eq('match_id', targetMatchId);
    
    if (matchBetsError) {
      console.error('❌ Error fetching bets for target match:', matchBetsError);
    } else {
      console.log(`✅ Found ${matchBets?.length || 0} bets for target match ${targetMatchId}`);
      console.log('Target match bets:', matchBets);
      
      if (matchBets && matchBets.length > 0) {
        const totalAmount = matchBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
        console.log(`💰 Total bet amount for this match: ${totalAmount} WC`);
      }
    }
    
    // Step 5: Test inserting a test bet
    console.log('\n🧪 Step 5: Testing bet insertion...');
    
    const testBet = {
      user_id: 'test-console-user',
      match_id: targetMatchId,
      wrestler_choice: 'wrestler1',
      amount: 1, // Small test amount
      odds: 2.0,
      status: 'pending'
    };
    
    const { data: insertedBet, error: insertError } = await window.supabase
      .from('bets')
      .insert(testBet)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test bet:', insertError);
      console.log('🔍 This indicates a permissions or schema issue');
    } else {
      console.log('✅ Test bet inserted successfully:', insertedBet);
      
      // Clean up the test bet
      await window.supabase
        .from('bets')
        .delete()
        .eq('id', insertedBet.id);
      
      console.log('🧹 Test bet cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabaseConnection();

console.log('\n🎯 CHECK RESULTS ABOVE');
console.log('======================');
