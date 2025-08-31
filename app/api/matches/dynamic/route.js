import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Load dynamic matches from database
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      matches: data || []
    });
  } catch (error) {
    console.error('Error loading dynamic matches:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new dynamic match
export async function POST(request) {
  try {
    const { wrestler1, wrestler2, event_name, weight_class } = await request.json();

    if (!wrestler1 || !wrestler2) {
      return NextResponse.json({
        success: false,
        error: 'Both wrestlers are required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('matches')
      .insert([{
        wrestler1,
        wrestler2,
        event_name: event_name || 'Wrestling Match',
        weight_class: weight_class || 'Open',
        status: 'active',
        odds_wrestler1: 2.0,
        odds_wrestler2: 2.0,
        total_pool: 0.0
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      match: data
    });
  } catch (error) {
    console.error('Error creating dynamic match:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update match odds and pool
export async function PUT(request) {
  try {
    const { matchId, odds_wrestler1, odds_wrestler2, total_pool } = await request.json();

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('matches')
      .update({
        odds_wrestler1: odds_wrestler1,
        odds_wrestler2: odds_wrestler2,
        total_pool: total_pool
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      match: data
    });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// DELETE - Remove match
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
