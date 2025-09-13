// Script to delete all matches from the database
// Run this with: node delete-all-matches.js

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllMatches() {
  try {
    console.log('🔍 Fetching all matches...');
    
    // First, get all matches to see what we're deleting
    const { data: matches, error: fetchError } = await supabase
      .from('matches')
      .select('id, wrestler1, wrestler2, event_name, created_at');
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError);
      return;
    }
    
    console.log(`📊 Found ${matches.length} matches:`);
    matches.forEach((match, index) => {
      console.log(`${index + 1}. ${match.wrestler1} vs ${match.wrestler2} (${match.event_name}) - Created: ${match.created_at}`);
    });
    
    if (matches.length === 0) {
      console.log('✅ No matches found to delete.');
      return;
    }
    
    console.log('\n🗑️  Deleting all matches...');
    
    // Delete all matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matches
    
    if (deleteError) {
      console.error('❌ Error deleting matches:', deleteError);
      return;
    }
    
    console.log('✅ Successfully deleted all matches!');
    console.log('🎯 You can now create new matches through the admin panel.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
deleteAllMatches();

