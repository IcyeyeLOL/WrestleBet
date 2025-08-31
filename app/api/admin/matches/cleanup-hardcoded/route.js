import { supabase } from '../../../../../lib/supabase';

export async function DELETE(request) {
  try {
    console.log('🚨 HARDCODED MATCH CLEANUP API CALLED');
    
    // List of known hardcoded wrestler names
    const hardcodedNames = [
      'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
      'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 
      'gable steveson', 'geno petriashvili'
    ];
    
    let totalDeleted = 0;
    const deletedMatches = [];
    
    // Get all matches first to see what we're dealing with
    const { data: allMatches, error: fetchError } = await supabase
      .from('matches')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError);
      return Response.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }
    
    console.log(`📊 Found ${allMatches.length} total matches in database`);
    
    // Filter and delete hardcoded matches
    for (const match of allMatches) {
      const wrestler1Lower = (match.wrestler1 || '').toLowerCase();
      const wrestler2Lower = (match.wrestler2 || '').toLowerCase();
      
      const isHardcoded = hardcodedNames.some(name => 
        wrestler1Lower.includes(name) || wrestler2Lower.includes(name)
      );
      
      if (isHardcoded) {
        console.log(`🎯 Deleting hardcoded match: ${match.wrestler1} vs ${match.wrestler2}`);
        
        // Delete related bets first
        const { error: betsError } = await supabase
          .from('bets')
          .delete()
          .eq('match_id', match.id);
        
        if (betsError) {
          console.error(`❌ Error deleting bets for match ${match.id}:`, betsError);
        }
        
        // Delete related votes
        const { error: votesError } = await supabase
          .from('votes')
          .delete()
          .eq('match_id', match.id);
        
        if (votesError) {
          console.error(`❌ Error deleting votes for match ${match.id}:`, votesError);
        }
        
        // Delete the match itself
        const { error: matchError } = await supabase
          .from('matches')
          .delete()
          .eq('id', match.id);
        
        if (matchError) {
          console.error(`❌ Error deleting match ${match.id}:`, matchError);
        } else {
          totalDeleted++;
          deletedMatches.push({
            id: match.id,
            wrestlers: `${match.wrestler1} vs ${match.wrestler2}`
          });
        }
      }
    }
    
    console.log(`✅ Successfully deleted ${totalDeleted} hardcoded matches`);
    
    return Response.json({
      success: true,
      message: `Successfully removed ${totalDeleted} hardcoded matches`,
      deletedMatches,
      totalDeleted
    });
    
  } catch (error) {
    console.error('❌ HARDCODED MATCH CLEANUP FAILED:', error);
    return Response.json({ 
      error: 'Cleanup failed', 
      details: error.message 
    }, { status: 500 });
  }
}
