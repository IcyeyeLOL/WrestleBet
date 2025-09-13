// QUICK API TEST - Run in Browser Console at http://localhost:3010
// This will test if the API routes are working now

console.log('🧪 QUICK API TEST - Port 3010');
console.log('==============================');

async function quickApiTest() {
  try {
    console.log('📊 Testing /api/votes endpoint...');
    
    const votesResponse = await fetch('/api/votes');
    console.log('📡 Votes response status:', votesResponse.status);
    
    if (votesResponse.status === 404) {
      console.log('❌ Still getting 404 on /api/votes');
      console.log('🔍 This indicates the API routes are not being recognized');
      return;
    }
    
    const votesData = await votesResponse.json();
    console.log('✅ Votes API working! Response:', votesData);
    
    // Test bets API
    console.log('\n💰 Testing /api/bets endpoint...');
    
    const betsResponse = await fetch('/api/bets');
    console.log('📡 Bets response status:', betsResponse.status);
    
    if (betsResponse.status === 404) {
      console.log('❌ Still getting 404 on /api/bets');
      return;
    }
    
    const betsData = await betsResponse.json();
    console.log('✅ Bets API working! Response:', betsData);
    
    console.log('\n🎯 BOTH APIS ARE WORKING!');
    console.log('📱 You can now test the betting system in the UI');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
quickApiTest();

console.log('\n🎯 CHECK RESULTS ABOVE');
console.log('==============================');
