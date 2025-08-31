// EMERGENCY HARDCODED MATCH REMOVER
// Run this in your browser console to permanently remove all hardcoded matches

async function removeAllHardcodedMatches() {
  console.log('🚨 STARTING EMERGENCY HARDCODED MATCH REMOVAL...');
  
  try {
    // Step 1: Delete hardcoded matches via API
    console.log('🎯 Step 1: Removing hardcoded matches from database...');
    
    const deleteResponse = await fetch('/api/admin/matches/cleanup-hardcoded', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ Hardcoded matches removed:', result);
    } else {
      console.error('❌ Failed to remove hardcoded matches via API');
    }
    
    // Step 2: Direct Supabase cleanup (if available)
    if (window.supabase) {
      console.log('🎯 Step 2: Direct Supabase cleanup...');
      
      const hardcodedNames = [
        'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
        'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
        'gable steveson', 'geno petriashvili'
      ];
      
      for (const name of hardcodedNames) {
        // Delete matches where wrestler1 or wrestler2 contains hardcoded names
        const { data, error } = await window.supabase
          .from('matches')
          .delete()
          .or(`wrestler1.ilike.%${name}%,wrestler2.ilike.%${name}%`);
        
        if (error) {
          console.error(`❌ Error removing matches for ${name}:`, error);
        } else {
          console.log(`✅ Removed matches for ${name}`);
        }
      }
    }
    
    // Step 3: Clear local storage
    console.log('🎯 Step 3: Clearing local storage...');
    localStorage.removeItem('wrestleBetMatches');
    localStorage.removeItem('pollData');
    localStorage.removeItem('bettingPools');
    localStorage.removeItem('selectedVotes');
    
    // Step 4: Force page reload
    console.log('🎯 Step 4: Forcing page reload to update UI...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    console.log('✅ EMERGENCY CLEANUP COMPLETED!');
    console.log('🔄 Page will reload in 2 seconds to show clean state...');
    
  } catch (error) {
    console.error('❌ EMERGENCY CLEANUP FAILED:', error);
  }
}

// Run the cleanup
removeAllHardcodedMatches();
