import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;



// If Supabase is not configured, return demo data so the admin panel works locally
const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const demoMatches = [];

// GET - Fetch all matches for admin management
export async function GET(request) {
  try {
    // Use the same logic as the regular matches API for consistency
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = searchParams.get('limit') || '50';

    // Use admin client if available, otherwise fall back to regular client
    const dbClient = supabaseAdmin || supabase;

    let query = dbClient
      .from('matches')
      .select(`
        *,
        wrestler1_pool,
        wrestler2_pool,
        total_pool,
        odds_wrestler1,
        odds_wrestler2
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: matches, error } = await query;

    if (error) {
      console.error('Error fetching matches:', error);
      // If database error, return empty matches array instead of failing
      console.log('⚠️ Database not accessible, returning empty matches array');
      return NextResponse.json({ 
        success: true, 
        matches: [], 
        total: 0,
        warning: 'Database not accessible - using demo mode'
      });
    }

    // Process matches with aggregated data
    const matchesWithStats = matches.map(match => ({
      ...match,
      totalBets: 0, // Will be calculated separately if needed
      totalVotes: 0, // Will be calculated separately if needed
      totalPool: match.total_pool || match.total_bet_pool || 0,
      wrestler1_pool: match.wrestler1_pool || 0,
      wrestler2_pool: match.wrestler2_pool || 0,
      odds_wrestler1: match.odds_wrestler1 || 2.0,
      odds_wrestler2: match.odds_wrestler2 || 2.0
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
    if (!supabaseConfigured || !adminConfigured) {
      return NextResponse.json({ success: false, error: 'Demo mode: Backend not configured. Creating match locally.' }, { status: 503 });
    }
    const body = await request.json();
    const { 
      wrestler1, 
      wrestler2, 
      eventName, 
      weightClass, 
      matchDate, 
      description,
      adminUserId 
    } = body;

    // Validate required fields
    if (!wrestler1 || !wrestler2) {
      return NextResponse.json({ 
        success: false, 
        error: 'Wrestler names are required' 
      }, { status: 400 });
    }

    // Use admin client to bypass RLS for match creation
    const dbClient = supabaseAdmin || supabase;

    // Insert new match
    const { data: match, error } = await dbClient
      .from('matches')
      .insert({
        wrestler1,
        wrestler2,
        event_name: eventName,
        weight_class: weightClass,
        match_date: matchDate ? new Date(matchDate).toISOString() : null,
        description,
        status: 'upcoming',
        wrestler1_pool: 0,
        wrestler2_pool: 0,
        total_pool: 0,
        wrestler1_percentage: 50,
        wrestler2_percentage: 50,
        odds_wrestler1: 2.0,
        odds_wrestler2: 2.0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('✅ Match created successfully:', match);

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
    if (!supabaseConfigured || !adminConfigured) {
      return NextResponse.json({ success: false, error: 'Backend not configured (Supabase). Configure env to update matches.' }, { status: 503 });
    }
    const body = await request.json();
    const { 
      id,
      wrestler1, 
      wrestler2, 
      eventName, 
      weightClass, 
      matchDate, 
      description,
      status,
      adminUserId 
    } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 });
    }

    // Use regular supabase client (admin functionality through database policies)
    const dbClient = supabase;

    // Update match
    const { data: match, error } = await dbClient
      .from('matches')
      .update({
        wrestler1,
        wrestler2,
        event_name: eventName,
        weight_class: weightClass,
        match_date: matchDate ? new Date(matchDate).toISOString() : null,
        description,
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
    const force = searchParams.get('force') === 'true';

    if (!supabaseConfigured || !adminConfigured) {
      return NextResponse.json({ success: false, error: 'Backend not configured (Supabase). Configure env to delete matches.' }, { status: 503 });
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Match ID is required' 
      }, { status: 400 });
    }

    console.log(`🗑️ Admin attempting to delete match ${id}${force ? ' (FORCE DELETE)' : ''}`);

    // Use admin client to bypass RLS
    const dbClient = supabaseAdmin || supabase;

    // First, check if match exists (use .maybeSingle() to avoid error if not found)
    const { data: matchToDelete, error: fetchError } = await dbClient
      .from('matches')
      .select('id, wrestler1, wrestler2, status')
      .eq('id', id.toString())
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching match to delete:', fetchError);
      return NextResponse.json({ success: false, error: `Database error: ${fetchError.message}` }, { status: 500 });
    }

    if (!matchToDelete) {
      console.log(`❌ Match ${id} not found`);
      return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
    }

    console.log(`📊 Match details: ${matchToDelete.wrestler1} vs ${matchToDelete.wrestler2}`);

    // Check if match has bets (prevent deletion if bets exist, unless force = true)
    const { data: bets, error: betsError } = await dbClient
      .from('bets')
      .select('id, amount, wrestler_choice')
      .eq('match_id', id);

    if (betsError) {
      console.error('Error checking bets:', betsError);
      // Continue with deletion even if we can't check bets
    } else if (bets && bets.length > 0 && !force) {
      console.log(`⚠️ Match has ${bets.length} bets, preventing deletion (use force=true to override)`);
      const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete match with existing bets (${bets.length} bets found, ${totalBetAmount} WC total). Use force delete to override.`,
        requiresForce: true,
        betDetails: {
          count: bets.length,
          totalAmount: totalBetAmount
        }
      }, { status: 400 });
    }

    // If force delete is enabled, delete all related data first
    if (force && bets && bets.length > 0) {
      console.log(`💥 Force deleting ${bets.length} bets for match ${id}`);
      
      // Delete all bets for this match
      const { error: betsDeleteError } = await dbClient
        .from('bets')
        .delete()
        .eq('match_id', id.toString());

      if (betsDeleteError) {
        console.error('Error force deleting bets:', betsDeleteError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to delete related bets: ${betsDeleteError.message}` 
        }, { status: 500 });
      } else {
        console.log('✅ Force deleted all related bets');
      }
    }

    // Delete related votes first to avoid foreign key constraints
    const { error: votesDeleteError } = await dbClient
      .from('votes')
      .delete()
      .eq('match_id', id.toString());

    if (votesDeleteError) {
      console.error('Error deleting related votes:', votesDeleteError);
      // Continue anyway - votes deletion is not critical
    } else {
      console.log('✅ Deleted related votes');
    }

    // Delete the match
    const { error: deleteError } = await dbClient
      .from('matches')
      .delete()
      .eq('id', id.toString());

    if (deleteError) {
      console.error('Error deleting match:', deleteError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to delete match: ${deleteError.message}` 
      }, { status: 500 });
    }

    console.log('✅ Match deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Match deleted successfully'
    });

  } catch (error) {
    console.error('Admin match deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }, { status: 500 });
  }
}
