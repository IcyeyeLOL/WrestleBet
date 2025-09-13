// REAL-TIME SUBSCRIPTION TEST - Run in Browser Console
// This will check if Supabase real-time subscriptions are working

console.log('📡 TESTING REAL-TIME SUBSCRIPTIONS...');
console.log('====================================');

// Test if we can connect to Supabase and listen for changes
console.log('🔌 Setting up subscription test...');

// Import Supabase from the window object (if available)
if (typeof window !== 'undefined' && window.supabase) {
  const supabase = window.supabase;
  
  console.log('✅ Supabase client found');
  
  // Subscribe to matches table changes
  const matchSubscription = supabase
    .channel('match_updates_test')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'matches' 
      }, 
      (payload) => {
        console.log('🔔 MATCH UPDATE RECEIVED:', payload);
        console.log('Event type:', payload.eventType);
        console.log('New data:', payload.new);
        console.log('Old data:', payload.old);
      }
    )
    .subscribe((status) => {
      console.log('📡 Match subscription status:', status);
    });
    
  // Subscribe to bets table changes  
  const betSubscription = supabase
    .channel('bet_updates_test')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public', 
        table: 'bets'
      },
      (payload) => {
        console.log('🎰 BET UPDATE RECEIVED:', payload);
        console.log('Event type:', payload.eventType);
        console.log('New data:', payload.new);
      }
    )
    .subscribe((status) => {
      console.log('📡 Bet subscription status:', status);
    });
    
  console.log('⏱️ Subscriptions set up - they will log any real-time updates');
  console.log('🧪 Now place a bet and watch for real-time messages');
  
  // Clean up function
  window.cleanupSubscriptionTest = () => {
    matchSubscription.unsubscribe();
    betSubscription.unsubscribe();
    console.log('🧹 Subscription test cleanup complete');
  };
  
  console.log('💡 To clean up later, run: cleanupSubscriptionTest()');
  
} else {
  console.log('❌ Supabase client not found in window object');
  console.log('🔍 This suggests the frontend Supabase integration may have issues');
  
  // Try to test with fetch instead
  console.log('🔄 Testing with direct fetch instead...');
  
  fetch('/api/votes')
    .then(response => response.json())
    .then(data => {
      console.log('📊 Fetch test successful:', data.success);
      console.log('📋 Available matches:', data.matches?.length || 0);
    })
    .catch(error => {
      console.error('❌ Fetch test failed:', error);
    });
}

console.log('\n📱 SUBSCRIPTION TEST COMPLETE');
console.log('====================================');
