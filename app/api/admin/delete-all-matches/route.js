import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// DELETE - Delete all matches (admin only)
export async function DELETE(request) {
  try {
    console.log('🗑️ Delete all matches API called');
    
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');
    
    // Simple admin key validation
    if (adminKey !== 'admin-delete-all-2024') {
      return NextResponse.json({
        success: false,
        error: 'Invalid admin key'
      }, { status: 401 });
    }
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 });
    }
    
    // First, get all matches to show what we're deleting
    const { data: matches, error: fetchError } = await supabaseAdmin
      .from('matches')
      .select('id, wrestler1, wrestler2, status');
    
    if (fetchError) {
      console.error('❌ Error fetching matches:', fetchError);
      return NextResponse.json({
        success: false,
        error: `Database error: ${fetchError.message}`
      }, { status: 500 });
    }
    
    if (!matches || matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches found to delete',
        deletedCount: 0
      });
    }
    
    console.log(`📊 Found ${matches.length} matches to delete:`, matches.map(m => `${m.wrestler1} vs ${m.wrestler2}`));
    
    // Delete all matches
    const { error: deleteError } = await supabaseAdmin
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all matches
    
    if (deleteError) {
      console.error('❌ Error deleting matches:', deleteError);
      return NextResponse.json({
        success: false,
        error: `Delete error: ${deleteError.message}`
      }, { status: 500 });
    }
    
    console.log(`✅ Successfully deleted ${matches.length} matches`);
    
    // Verify deletion
    const { data: remainingMatches, error: verifyError } = await supabaseAdmin
      .from('matches')
      .select('id');
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
    }
    
    const remainingCount = remainingMatches?.length || 0;
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${matches.length} matches`,
      deletedCount: matches.length,
      remainingCount: remainingCount,
      deletedMatches: matches.map(m => ({
        id: m.id,
        match: `${m.wrestler1} vs ${m.wrestler2}`,
        status: m.status
      }))
    });
    
  } catch (error) {
    console.error('❌ Delete all matches error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}



