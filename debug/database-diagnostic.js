// 🔍 COMPREHENSIVE DATABASE DIAGNOSTIC
// Run this in browser console at localhost:3000 to check for database issues

console.log('🔍 COMPREHENSIVE DATABASE DIAGNOSTIC');
console.log('=====================================');

async function checkDatabaseHealth() {
  console.log('\n🔧 Step 1: Testing API Endpoints...');
  
  const endpoints = [
    { name: 'Admin Matches', url: '/api/admin/matches', method: 'GET' },
    { name: 'Votes API', url: '/api/votes', method: 'GET' },
    { name: 'Bets API', url: '/api/bets', method: 'GET' },
    { name: 'Vote POST', url: '/api/vote', method: 'POST' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name}: ${endpoint.method} ${endpoint.url}`);
      
      let options = { method: endpoint.method };
      if (endpoint.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ test: true });
      }
      
      const response = await fetch(endpoint.url, options);
      const data = await response.json();
      
      results[endpoint.name] = {
        status: response.status,
        success: data.success || response.ok,
        data: data,
        error: data.error || null
      };
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: Status ${response.status} - ${data.success ? 'SUCCESS' : 'OK'}`);
        if (data.matches) console.log(`   📊 Found ${data.matches.length} matches`);
        if (data.votes) console.log(`   📊 Found ${data.votes.length} votes`);
        if (data.bets) console.log(`   📊 Found ${data.bets.length} bets`);
      } else {
        console.log(`❌ ${endpoint.name}: Status ${response.status} - ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Network error - ${error.message}`);
      results[endpoint.name] = {
        status: 'ERROR',
        success: false,
        error: error.message
      };
    }
  }
  
  console.log('\n🔧 Step 2: Environment Variables Check...');
  
  // Check if we're in browser (can't access process.env directly)
  console.log('📋 Checking public environment variables:');
  
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': 'Should be your Supabase project URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Should be your Supabase anon key'
  };
  
  // Try to detect if Supabase is configured by testing the admin API
  const supabaseConfigured = results['Admin Matches']?.success;
  console.log(`🔗 Supabase Connection: ${supabaseConfigured ? '✅ Working' : '❌ Not working'}`);
  
  console.log('\n🔧 Step 3: Database Schema Check...');
  
  if (results['Admin Matches']?.success) {
    console.log('✅ Database connection successful');
    
    // Try to create a test match to verify write permissions
    try {
      console.log('\n📝 Testing database write permissions...');
      
      const testMatch = {
        wrestler1: 'Test Wrestler A',
        wrestler2: 'Test Wrestler B',
        eventName: 'Database Test Event',
        matchDate: new Date().toISOString()
      };
      
      const createResponse = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testMatch)
      });
      
      const createResult = await createResponse.json();
      
      if (createResult.success) {
        console.log('✅ Database write permissions: Working');
        console.log(`   📝 Created test match: ${createResult.match.id}`);
        
        // Clean up - delete the test match
        const deleteResponse = await fetch(`/api/admin/matches?id=${createResult.match.id}&force=true`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Cleanup: Test match deleted');
        }
        
      } else {
        console.log('❌ Database write permissions: Failed');
        console.log(`   Error: ${createResult.error}`);
      }
      
    } catch (error) {
      console.log('❌ Database write test failed:', error.message);
    }
    
  } else {
    console.log('❌ Cannot test database - admin API not working');
  }
  
  console.log('\n🔧 Step 4: Testing Specific Database Tables...');
  
  // Test each table specifically if we have database access
  if (supabaseConfigured) {
    const tables = ['matches', 'votes', 'bets', 'users'];
    
    for (const table of tables) {
      try {
        let testUrl;
        switch (table) {
          case 'matches':
            testUrl = '/api/admin/matches';
            break;
          case 'votes':
            testUrl = '/api/votes';
            break;
          case 'bets':
            testUrl = '/api/bets';
            break;
          default:
            continue;
        }
        
        const response = await fetch(testUrl);
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`✅ Table '${table}': Accessible`);
          const count = data[table]?.length || data.matches?.length || 0;
          console.log(`   📊 Records: ${count}`);
        } else {
          console.log(`❌ Table '${table}': ${data.error || 'Not accessible'}`);
        }
        
      } catch (error) {
        console.log(`❌ Table '${table}': Error - ${error.message}`);
      }
    }
  }
  
  console.log('\n🔧 Step 5: Diagnostic Summary...');
  console.log('=====================================');
  
  const issues = [];
  const working = [];
  
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      working.push(name);
    } else {
      issues.push(`${name}: ${result.error || 'Failed'}`);
    }
  });
  
  console.log(`✅ Working APIs: ${working.length > 0 ? working.join(', ') : 'None'}`);
  console.log(`❌ Failed APIs: ${issues.length > 0 ? issues.join(', ') : 'None'}`);
  
  if (issues.length === 0) {
    console.log('\n🎉 DATABASE STATUS: HEALTHY');
    console.log('💡 All APIs are working correctly');
  } else {
    console.log('\n⚠️  DATABASE STATUS: ISSUES FOUND');
    console.log('🔧 Recommended fixes:');
    
    if (issues.some(i => i.includes('404'))) {
      console.log('   1. API routes missing - check /api folder structure');
    }
    if (issues.some(i => i.includes('500') || i.includes('error'))) {
      console.log('   2. Database connection issues - check Supabase env vars');
    }
    if (issues.some(i => i.includes('Network error'))) {
      console.log('   3. Server issues - restart development server');
    }
  }
  
  return { working, issues, results };
}

// Auto-run diagnostic
console.log('🚀 Running database diagnostic...');
checkDatabaseHealth().then(result => {
  console.log('\n✅ Diagnostic complete!');
  window.dbDiagnostic = result;
  console.log('💾 Results saved to window.dbDiagnostic');
});

// Make function available globally
window.checkDatabaseHealth = checkDatabaseHealth;
