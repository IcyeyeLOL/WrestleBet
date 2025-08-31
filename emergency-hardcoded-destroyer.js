/**
 * EMERGENCY HARDCODED MATCH DESTROYER
 * This will immediately remove all hardcoded matches from your database
 */

console.log('🚨 EMERGENCY HARDCODED MATCH DESTROYER');
console.log('=====================================');

const destroyHardcodedMatches = async () => {
  console.log('\n🔍 STEP 1: Checking for hardcoded matches...');
  
  // List of all known hardcoded wrestler names
  const hardcodedWrestlers = [
    'Sarah Wilson', 'Emma Davis', 'Alex Thompson', 'Chris Brown',
    'David Taylor', 'Hassan Yazdani', 'Kyle Dake', 'Bajrang Punia',
    'Gable Steveson', 'Geno Petriashvili', 'Frank Chamizo', 'Yuki Takahashi',
    'John Smith', 'Mike Johnson'
  ];

  try {
    // Get all matches
    const { data: allMatches, error: matchError } = await supabase
      .from('matches')
      .select('*');

    if (matchError) {
      console.error('❌ Error loading matches:', matchError);
      return;
    }

    console.log(`📊 Found ${allMatches.length} total matches in database`);

    // Find hardcoded matches
    const hardcodedMatches = allMatches.filter(match => 
      hardcodedWrestlers.includes(match.wrestler1) || 
      hardcodedWrestlers.includes(match.wrestler2)
    );

    console.log(`🎯 Found ${hardcodedMatches.length} hardcoded matches to remove:`);
    hardcodedMatches.forEach(match => {
      console.log(`  - ${match.wrestler1} vs ${match.wrestler2} (ID: ${match.id.substring(0, 8)}...)`);
    });

    if (hardcodedMatches.length === 0) {
      console.log('✅ No hardcoded matches found in database!');
      return;
    }

    // Step 2: Remove hardcoded matches
    console.log('\n💣 STEP 2: Removing hardcoded matches...');

    for (const match of hardcodedMatches) {
      console.log(`🗑️ Deleting: ${match.wrestler1} vs ${match.wrestler2}`);

      // First delete related bets
      const { error: betsError } = await supabase
        .from('bets')
        .delete()
        .eq('match_id', match.id);

      if (betsError) {
        console.warn(`⚠️ Error deleting bets for match ${match.id}:`, betsError);
      }

      // Then delete related votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('match_id', match.id);

      if (votesError) {
        console.warn(`⚠️ Error deleting votes for match ${match.id}:`, votesError);
      }

      // Finally delete the match
      const { error: matchDeleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', match.id);

      if (matchDeleteError) {
        console.error(`❌ Error deleting match ${match.id}:`, matchDeleteError);
      } else {
        console.log(`✅ Deleted: ${match.wrestler1} vs ${match.wrestler2}`);
      }
    }

    // Step 3: Verify cleanup
    console.log('\n🔍 STEP 3: Verifying cleanup...');

    const { data: remainingMatches, error: verifyError } = await supabase
      .from('matches')
      .select('*');

    if (verifyError) {
      console.error('❌ Error verifying cleanup:', verifyError);
      return;
    }

    const stillHardcoded = remainingMatches.filter(match => 
      hardcodedWrestlers.includes(match.wrestler1) || 
      hardcodedWrestlers.includes(match.wrestler2)
    );

    if (stillHardcoded.length === 0) {
      console.log('🎉 SUCCESS: All hardcoded matches removed!');
      console.log(`📊 Remaining matches: ${remainingMatches.length} (all should be admin-created)`);
      
      if (remainingMatches.length > 0) {
        console.log('📋 Remaining matches:');
        remainingMatches.forEach(match => {
          console.log(`  ✅ ${match.wrestler1} vs ${match.wrestler2} (Admin created)`);
        });
      } else {
        console.log('📭 No matches remaining - create new ones in admin panel');
      }
    } else {
      console.log('⚠️ Some hardcoded matches still remain:', stillHardcoded);
    }

    // Step 4: Force page refresh
    console.log('\n🔄 STEP 4: Forcing page refresh...');
    setTimeout(() => {
      window.location.reload();
    }, 2000);

  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
  }
};

// Make function available globally
window.destroyHardcodedMatches = destroyHardcodedMatches;

console.log('\n💡 USAGE: Run window.destroyHardcodedMatches()');
console.log('🎯 This will remove all hardcoded matches from your database immediately');
