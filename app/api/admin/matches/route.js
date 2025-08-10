import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Fetch all matches for admin management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';

    let query = supabase
      .from('matches')
      .select(`
        *,
        betting_analytics (
          total_volume,
          unique_bettors,
          wrestler1_pool,
          wrestler2_pool,
          wrestler1_odds,
          wrestler2_odds
        )
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: matches, error } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Get betting data for each match
    const matchesWithStats = await Promise.all(matches.map(async (match) => {
      const { data: bets } = await supabase
        .from('bets')
        .select('*')
        .eq('match_id', match.id);

      const { data: votes } = await supabase
        .from('votes')
        .select('*')
        .eq('match_id', match.id);

      return {
        ...match,
        totalBets: bets?.length || 0,
        totalVotes: votes?.length || 0,
        totalPool: bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0
      };
    }));

    return NextResponse.json({
      success: true,
      matches: matchesWithStats,
      total: matchesWithStats.length
    });

  } catch (error) {
    console.error('Admin matches fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new match
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      wrestler1, 
      wrestler2, 
      eventName, 
      weightClass, 
      matchDate, 
      description,
      isFeatured,
      adminUserId 
    } = body;

    // Validate required fields
    if (!wrestler1 || !wrestler2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wrestler names are required' 
      }, { status: 400 });
    }

    // Insert new match
    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        wrestler1,
        wrestler2,
        event_name: eventName,
        weight_class: weightClass,
        match_date: matchDate ? new Date(matchDate).toISOString() : null,
        description,
        is_featured: isFeatured || false,
        created_by_admin: adminUserId,
        status: 'upcoming'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'match_created',
          resource_type: 'match',
          resource_id: match.id,
          details: { wrestler1, wrestler2, eventName }
        });
    }

    return NextResponse.json({
      success: true,
      match,
      message: 'Match created successfully'
    });

  } catch (error) {
    console.error('Admin match creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update existing match
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      wrestler1, 
      wrestler2, 
      eventName, 
      weightClass, 
      matchDate, 
      description,
      isFeatured,
      status,
      adminUserId 
    } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 });
    }

    // Update match
    const { data: match, error } = await supabase
      .from('matches')
      .update({
        wrestler1,
        wrestler2,
        event_name: eventName,
        weight_class: weightClass,
        match_date: matchDate ? new Date(matchDate).toISOString() : null,
        description,
        is_featured: isFeatured,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating match:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'match_updated',
          resource_type: 'match',
          resource_id: id,
          details: { wrestler1, wrestler2, status }
        });
    }

    return NextResponse.json({
      success: true,
      match,
      message: 'Match updated successfully'
    });

  } catch (error) {
    console.error('Admin match update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete match
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminUserId = searchParams.get('adminUserId');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 });
    }

    // Check if match has bets (prevent deletion if bets exist)
    const { data: bets } = await supabase
      .from('bets')
      .select('id')
      .eq('match_id', id);

    if (bets && bets.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete match with existing bets' 
      }, { status: 400 });
    }

    // Delete match
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting match:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'match_deleted',
          resource_type: 'match',
          resource_id: id,
          details: { action: 'deleted' }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Match deleted successfully'
    });

  } catch (error) {
    console.error('Admin match deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
