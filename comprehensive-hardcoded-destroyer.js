// COMPREHENSIVE HARDCODED MATCH DESTROYER WITH DIAGNOSIS
// Run this in your browser console to diagnose and remove ALL hardcoded matches

async function diagnoseAndDestroyHardcodedMatches() {
  console.log('🔍 COMPREHENSIVE HARDCODED MATCH DIAGNOSIS STARTING...');
  
  try {
    // Step 1: Check what's currently in the database
    console.log('📊 Step 1: Checking current database state...');
    
    const currentMatches = await fetch('/api/matches/dynamic')
      .then(res => res.json())
      .catch(err => {
        console.log('⚠️ API not available, checking Supabase directly...');
        return null;
      });
    
    if (currentMatches && currentMatches.matches) {
      console.log('📋 Current matches in database:', currentMatches.matches.length);
      currentMatches.matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id})`);
      });
    }
    
    // Step 2: Direct Supabase cleanup
    if (window.supabase) {
      console.log('🧹 Step 2: Direct Supabase cleanup...');
      
      // Get all matches first
      const { data: allMatches, error: fetchError } = await window.supabase
        .from('matches')
        .select('*');
      
      if (fetchError) {
        console.error('❌ Error fetching matches:', fetchError);
      } else {
        console.log(`📊 Found ${allMatches.length} matches in Supabase`);
        
        // List all matches
        allMatches.forEach((match, index) => {
          console.log(`${index + 1}. ${match.wrestler1} vs ${match.wrestler2} (Created: ${match.created_at})`);
        });
        
        // Delete ALL matches (start fresh)
        console.log('🚨 DELETING ALL MATCHES...');
        
        const { error: deleteError } = await window.supabase
          .from('matches')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (impossible UUID)
        
        if (deleteError) {
          console.error('❌ Error deleting matches:', deleteError);
        } else {
          console.log('✅ ALL MATCHES DELETED FROM DATABASE');
        }
        
        // Verify deletion
        const { data: remainingMatches } = await window.supabase
          .from('matches')
          .select('*');
        
        console.log(`✅ Remaining matches: ${remainingMatches ? remainingMatches.length : 0}`);
      }
    } else {
      console.log('⚠️ Supabase not available in window object');
    }
    
    // Step 3: Clear all local storage
    console.log('🧹 Step 3: Clearing all local storage...');
    Object.keys(localStorage).forEach(key => {
      if (key.includes('wrestle') || key.includes('bet') || key.includes('match')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      }
    });
    
    // Step 4: Clear session storage
    console.log('🧹 Step 4: Clearing session storage...');
    sessionStorage.clear();
    
    // Step 5: Force reload
    console.log('🔄 Step 5: Forcing complete page reload...');
    setTimeout(() => {
      window.location.href = window.location.href + '?t=' + Date.now();
    }, 2000);
    
    console.log('✅ COMPREHENSIVE CLEANUP COMPLETED!');
    console.log('🔄 Page will reload in 2 seconds...');
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE CLEANUP FAILED:', error);
  }
}

// Run the comprehensive cleanup
diagnoseAndDestroyHardcodedMatches();
