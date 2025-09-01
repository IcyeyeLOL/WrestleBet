// DATABASE SETUP AND TEST - Run in Browser Console
// This will test and fix database permissions issues

console.log('🔧 DATABASE SETUP AND TEST');
console.log('===========================');

async function setupAndTestDatabase() {
  try {
    console.log('📊 Step 1: Testing basic Supabase connection...');
    
    if (!window.supabase) {
      console.error('❌ Supabase client not found in window object');
      console.log('🔍 Check if Supabase is properly initialized in your app');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test basic connection
    console.log('\n🔌 Step 2: Testing basic database connection...');
    
    const { data: testData, error: testError } = await window.supabase
      .from('matches')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic database connection failed:', testError);
      return;
    }
    
    console.log('✅ Basic database connection successful');
    
    // Test bets table access
    console.log('\n💰 Step 3: Testing bets table access...');
    
    const { data: betsData, error: betsError } = await window.supabase
      .from('bets')
      .select('*')
      .limit(1);
    
    if (betsError) {
      console.error('❌ Bets table access failed:', betsError);
      console.log('🔧 This suggests the bets table needs to be created or permissions are missing');
      console.log('📝 Run the SQL script from create-bets-table.sql in your Supabase dashboard');
      
      // Try to get more info about the error
      if (betsError.code === '42P01') {
        console.log('🔍 Error code 42P01 = Table does not exist');
        console.log('✅ SOLUTION: Create the bets table using the SQL script');
      } else if (betsError.code === '42501') {
        console.log('🔍 Error code 42501 = Permission denied');
        console.log('✅ SOLUTION: Update RLS policies for the bets table');
      }
      
      return;
    }
    
    console.log('✅ Bets table accessible');
    console.log(`📊 Current bets in database: ${betsData?.length || 0}`);
    
    // Test bet insertion
    console.log('\n🧪 Step 4: Testing bet insertion...');
    
    // Get a valid match ID
    const { data: matches, error: matchError } = await window.supabase
      .from('matches')
      .select('id')
      .limit(1);
    
    if (matchError || !matches || matches.length === 0) {
      console.error('❌ No matches found for testing');
      console.log('🔍 Create a match first using the admin panel');
      return;
    }
    
    const testMatchId = matches[0].id;
    console.log('🎯 Using match ID for test:', testMatchId);
    
    const testBet = {
      user_id: 'test-setup-user',
      match_id: testMatchId,
      wrestler_choice: 'wrestler1',
      amount: 1,
      odds: 2.0,
      status: 'pending'
    };
    
    const { data: insertedBet, error: insertError } = await window.supabase
      .from('bets')
      .insert(testBet)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Bet insertion failed:', insertError);
      console.log('🔧 This indicates a permissions or schema issue');
      
      if (insertError.code === '23503') {
        console.log('🔍 Foreign key constraint error - match_id reference issue');
      } else if (insertError.code === '42501') {
        console.log('🔍 Permission denied on insert');
      }
      
      return;
    }
    
    console.log('✅ Test bet inserted successfully:', insertedBet);
    
    // Test bet retrieval
    console.log('\n📊 Step 5: Testing bet retrieval...');
    
    const { data: retrievedBets, error: retrieveError } = await window.supabase
      .from('bets')
      .select('*')
      .eq('match_id', testMatchId);
    
    if (retrieveError) {
      console.error('❌ Bet retrieval failed:', retrieveError);
    } else {
      console.log(`✅ Successfully retrieved ${retrievedBets?.length || 0} bets for test match`);
      console.log('Retrieved bets:', retrievedBets);
    }
    
    // Clean up test bet
    console.log('\n🧹 Step 6: Cleaning up test bet...');
    
    const { error: deleteError } = await window.supabase
      .from('bets')
      .delete()
      .eq('id', insertedBet.id);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test bet:', deleteError);
    } else {
      console.log('✅ Test bet cleaned up successfully');
    }
    
    // Test API endpoint
    console.log('\n🚀 Step 7: Testing betting API endpoint...');
    
    const apiTestBet = {
      userId: 'test-api-user',
      matchId: testMatchId,
      wrestlerChoice: 'wrestler2',
      betAmount: 50,
      odds: 1.8
    };
    
    const apiResponse = await fetch('/api/bets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiTestBet)
    });
    
    const apiResult = await apiResponse.json();
    
    if (apiResult.success) {
      console.log('✅ Betting API working correctly:', apiResult);
      console.log('🎯 ALL SYSTEMS ARE FUNCTIONAL!');
      console.log('🔧 If betting still doesn\'t work in the UI, it\'s a frontend issue');
    } else {
      console.error('❌ Betting API failed:', apiResult);
      console.log('🔍 Check API logs for detailed error information');
    }
    
  } catch (error) {
    console.error('❌ Database setup test failed:', error);
  }
}

// Run the setup test
setupAndTestDatabase();

console.log('\n🎯 CHECK RESULTS ABOVE');
console.log('=======================');
