import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase.js';
import { supabaseAdmin } from '../../../../../lib/supabase-admin.js';

// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get a specific match by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Getting match with ID: ${id}`);

    // Get the match from database
    const { data: match, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching match:', error);
      return NextResponse.json(
        { error: 'Failed to fetch match' },
        { status: 500 }
      );
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error in GET /api/admin/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific match by ID
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    console.log(`✏️ Updating match with ID: ${id}`, body);

    // Update the match in database
    const { data: match, error } = await supabase
      .from('matches')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating match:', error);
      return NextResponse.json(
        { error: 'Failed to update match' },
        { status: 500 }
      );
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error in PUT /api/admin/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific match by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting match with ID: ${id}`);

    // Delete the match from database
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting match:', error);
      return NextResponse.json(
        { error: 'Failed to delete match' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Match deleted successfully',
      id: id 
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}