import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabase-admin.js';

// Dynamic export configuration for Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Environment check with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hpkxmotzidywoilooqpx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg2MzcsImV4cCI6MjA2OTg2NDYzN30.KbbrGQPzXcO3SBRvXk2ySdCzprNiUXCnQZdiQRgCuNc';
const supabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// GET - Fetch all matches for public display
export async function GET(request) {
  try {
    console.log('🔍 Matches API called');
    
    if (!supabaseConfigured) {
      console.log('⚠️ Supabase not configured, returning empty matches');
      return NextResponse.json({ 
        success: true, 
        matches: [], 
        message: 'Database not configured' 
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'upcoming';
    const limit = searchParams.get('limit') || '10';

    console.log(`📊 Fetching matches: status=${status}, limit=${limit}`);

    // Use admin client for better performance
    const dbClient = supabaseAdmin || supabase;

    if (!dbClient) {
      console.error('❌ No database client available');
      return NextResponse.json({ 
        success: false, 
        error: 'Database client not available' 
      }, { status: 500 });
    }

    let query = dbClient
      .from('matches')
      .select(`
        id,
        wrestler1,
        wrestler2,
        event_name,
        weight_class,
        match_date,
        status,
        created_at,
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

    console.log('🔄 Executing database query...');
    const { data: matches, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Return a more specific error response
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 });
    }

    console.log(`✅ Successfully fetched ${matches?.length || 0} matches`);

    // Handle case where matches is null or undefined
    if (!matches || matches.length === 0) {
      console.log('⚠️ No matches found in database');
      return NextResponse.json({
        success: true,
        matches: [],
        total: 0,
        message: 'No matches available. Create matches using the admin panel.'
      });
    }

    // Process matches with betting pool data
    const processedMatches = matches.map(match => {
      // Ensure pool data exists and has proper defaults
      const wrestler1Pool = match.wrestler1_pool || 0;
      const wrestler2Pool = match.wrestler2_pool || 0;
      const totalPool = match.total_pool || (wrestler1Pool + wrestler2Pool);
      
      // Calculate percentages for sentiment bars - ensure they add up to exactly 100%
      let wrestler1Percentage, wrestler2Percentage;
      
      if (totalPool > 0) {
        // Calculate raw percentages
        const rawWrestler1Percentage = (wrestler1Pool / totalPool) * 100;
        const rawWrestler2Percentage = (wrestler2Pool / totalPool) * 100;
        
        // Round wrestler1 percentage
        wrestler1Percentage = Math.round(rawWrestler1Percentage);
        
        // Calculate wrestler2 percentage to ensure total = 100%
        wrestler2Percentage = 100 - wrestler1Percentage;
        
        // Handle edge case where rounding causes issues
        if (wrestler1Percentage + wrestler2Percentage !== 100) {
          wrestler2Percentage = 100 - wrestler1Percentage;
        }
      } else {
        // Default to 50-50 when no betting data
        wrestler1Percentage = 50;
        wrestler2Percentage = 50;
      }

      return {
        ...match,
        wrestler1_pool: wrestler1Pool,
        wrestler2_pool: wrestler2Pool,
        total_pool: totalPool,
        wrestler1_percentage: wrestler1Percentage,
        wrestler2_percentage: wrestler2Percentage,
        odds_wrestler1: match.odds_wrestler1 || 1.5,
        odds_wrestler2: match.odds_wrestler2 || 1.5
      };
    });

    return NextResponse.json({
      success: true,
      matches: processedMatches,
      total: processedMatches.length
    });

  } catch (error) {
    console.error('Matches API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
