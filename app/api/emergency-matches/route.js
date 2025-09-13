import { supabase } from '../../../lib/supabase'

export async function POST(request) {
  try {
    console.log('🚨 Emergency matches initialization called');
    
    // Use service role key for admin operations
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI4ODYzNywiZXhwIjoyMDY5ODY0NjM3fQ.gV8g5vsA6RdQATPaUWDfNS36rTC2mhWzqSBWMfqj3gw';
    const supabaseUrl = 'https://hpkxmotzidywoilooqpx.supabase.co';
    
    const { createClient } = require('@supabase/supabase-js');
    const adminSupabase = createClient(supabaseUrl, serviceKey);
    
    // Check current matches
    const { data: existingMatches, error: checkError } = await adminSupabase
      .from('matches')
      .select('*');
    
    if (checkError) {
      console.error('❌ Error checking matches:', checkError);
      return Response.json({ error: checkError.message }, { status: 500 });
    }
    
    console.log(`📊 Found ${existingMatches.length} existing matches`);
    
    // Define wrestling matches with correct IDs
    const wrestlingMatches = [
      {
        id: 'kunle-ajani',
        wrestler1: 'Kunle Adeleye',
        wrestler2: 'Ajani Thompson',
        event_name: 'Nigeria Wrestling Championship',
        event_date: new Date().toISOString(),
        odds_wrestler1: 1.8,
        odds_wrestler2: 2.1
      },
      {
        id: 'david-hassan',
        wrestler1: 'David Taylor',
        wrestler2: 'Hassan Yazdani',
        event_name: 'International Wrestling Series',
        event_date: new Date().toISOString(),
        odds_wrestler1: 1.5,
        odds_wrestler2: 2.5
      },
      {
        id: 'roman-cm',
        wrestler1: 'Roman Reigns',
        wrestler2: 'CM Punk',
        event_name: 'WWE Championship',
        event_date: new Date().toISOString(),
        odds_wrestler1: 1.6,
        odds_wrestler2: 2.3
      }
    ];
    
    // Check if matches need to be added
    const existingIds = existingMatches.map(m => m.id);
    const newMatches = wrestlingMatches.filter(m => !existingIds.includes(m.id));
    
    if (newMatches.length === 0) {
      // Check specifically for kunle-ajani
      const kunleMatch = existingMatches.find(m => m.id === 'kunle-ajani');
      if (kunleMatch) {
        return Response.json({
          success: true,
          message: 'All matches already exist',
          kunleAjaniExists: true,
          match: kunleMatch,
          totalMatches: existingMatches.length
        });
      } else {
        return Response.json({
          success: false,
          message: 'kunle-ajani match missing',
          kunleAjaniExists: false,
          totalMatches: existingMatches.length,
          existingMatches: existingMatches.map(m => ({ id: m.id, wrestlers: `${m.wrestler1} vs ${m.wrestler2}` }))
        });
      }
    }
    
    // Insert new matches
    console.log(`💾 Inserting ${newMatches.length} new matches...`);
    const { data: insertedData, error: insertError } = await adminSupabase
      .from('matches')
      .insert(newMatches)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting matches:', insertError);
      return Response.json({ error: insertError.message }, { status: 500 });
    }
    
    console.log('✅ Successfully inserted matches');
    
    // Verify kunle-ajani specifically
    const { data: kunleVerify, error: verifyError } = await adminSupabase
      .from('matches')
      .select('*')
      .eq('id', 'kunle-ajani')
      .single();
      
    if (verifyError) {
      return Response.json({
        success: false,
        error: 'kunle-ajani verification failed',
        details: verifyError
      });
    }
    
    return Response.json({
      success: true,
      message: 'Emergency initialization completed',
      insertedMatches: insertedData.length,
      kunleAjaniMatch: kunleVerify,
      totalMatches: existingMatches.length + insertedData.length
    });
    
  } catch (error) {
    console.error('❌ Emergency matches error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Check current state of matches table
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*');
    
    if (error) {
      return Response.json({
        success: false,
        error: error.message,
        matches: []
      });
    }
    
    const kunleMatch = matches.find(m => m.id === 'kunle-ajani');
    
    return Response.json({
      success: true,
      matches: matches,
      totalMatches: matches.length,
      kunleAjaniExists: !!kunleMatch,
      kunleAjaniMatch: kunleMatch || null
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      matches: []
    });
  }
}
