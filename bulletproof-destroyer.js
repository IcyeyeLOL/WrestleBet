// BULLETPROOF HARDCODED MATCH DESTROYER
// This will trace exactly where the matches are coming from and destroy them

(async function bulletproofDestroy() {
  console.log('🔫 BULLETPROOF HARDCODED MATCH DESTROYER ACTIVATED');
  
  try {
    // Step 1: Check what the API is returning
    console.log('🔍 Step 1: Checking what /api/votes is returning...');
    
    const votesResponse = await fetch('/api/votes');
    const votesData = await votesResponse.json();
    console.log('📊 /api/votes response:', votesData);
    
    if (votesData.matches) {
      console.log('📋 Found these matches in votes API:');
      votesData.matches.forEach((match, i) => {
        console.log(`${i+1}. ID: ${match.id}, ${match.wrestler1} vs ${match.wrestler2}`);
      });
    }
    
    // Step 2: Check /api/bets
    console.log('🔍 Step 2: Checking what /api/bets is returning...');
    
    const betsResponse = await fetch('/api/bets');
    const betsData = await betsResponse.json();
    console.log('📊 /api/bets response:', betsData);
    
    // Step 3: Direct Supabase inspection
    if (window.supabase) {
      console.log('🔍 Step 3: Direct Supabase database inspection...');
      
      const { data: allMatches, error } = await window.supabase
        .from('matches')
        .select('*');
      
      if (error) {
        console.error('❌ Supabase error:', error);
      } else {
        console.log(`📊 Direct Supabase query found ${allMatches.length} matches:`);
        allMatches.forEach((match, i) => {
          console.log(`${i+1}. ID: ${match.id}`);
          console.log(`   Wrestlers: ${match.wrestler1} vs ${match.wrestler2}`);
          console.log(`   Created: ${match.created_at}`);
          console.log(`   Status: ${match.status}`);
        });
        
        // NUCLEAR DELETION - DELETE EVERY SINGLE MATCH
        console.log('💥 EXECUTING NUCLEAR DELETION...');
        
        for (const match of allMatches) {
          console.log(`🎯 Deleting match: ${match.wrestler1} vs ${match.wrestler2}`);
          
          // Delete bets first
          const { error: betsError } = await window.supabase
            .from('bets')
            .delete()
            .eq('match_id', match.id);
          
          if (betsError) {
            console.error(`❌ Error deleting bets for ${match.id}:`, betsError);
          } else {
            console.log(`✅ Deleted bets for ${match.id}`);
          }
          
          // Delete votes
          const { error: votesError } = await window.supabase
            .from('votes')
            .delete()
            .eq('match_id', match.id);
          
          if (votesError) {
            console.error(`❌ Error deleting votes for ${match.id}:`, votesError);
          } else {
            console.log(`✅ Deleted votes for ${match.id}`);
          }
          
          // Delete the match
          const { error: matchError } = await window.supabase
            .from('matches')
            .delete()
            .eq('id', match.id);
          
          if (matchError) {
            console.error(`❌ Error deleting match ${match.id}:`, matchError);
          } else {
            console.log(`✅ Deleted match ${match.id}`);
          }
        }
        
        // Verify complete deletion
        const { data: remainingMatches } = await window.supabase
          .from('matches')
          .select('*');
        
        console.log(`✅ Verification: ${remainingMatches ? remainingMatches.length : 0} matches remaining`);
        
        if (remainingMatches && remainingMatches.length === 0) {
          console.log('🎉 SUCCESS: ALL MATCHES COMPLETELY DELETED!');
        } else {
          console.log('⚠️ WARNING: Some matches may still remain');
        }
      }
    }
    
    // Step 4: Complete local cleanup
    console.log('🧹 Step 4: Complete local storage cleanup...');
    
    // Clear ALL localStorage
    localStorage.clear();
    
    // Clear ALL sessionStorage  
    sessionStorage.clear();
    
    // Clear any cached data
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
    }
    
    // Step 5: Force complete reload
    console.log('🔄 Step 5: Forcing complete page reload...');
    console.log('🎯 If matches still appear after reload, there is a schema file being auto-executed');
    
    setTimeout(() => {
      window.location.href = window.location.origin + '/?_bust=' + Date.now() + '&_clean=true';
    }, 3000);
    
    console.log('✅ BULLETPROOF DESTRUCTION COMPLETED!');
    console.log('⏳ Page will reload in 3 seconds...');
    
  } catch (error) {
    console.error('❌ BULLETPROOF DESTRUCTION FAILED:', error);
  }
})();
