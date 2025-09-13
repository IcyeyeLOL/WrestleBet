import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabase-admin';

export async function GET() {
  try {
    console.log('🏥 Health check endpoint called');
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    
    console.log('🔧 Environment check:', envCheck);
    
    if (!envCheck.supabaseUrl || !envCheck.supabaseAnonKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase environment variables not configured',
        details: envCheck
      }, { status: 500 });
    }
    
    // Test database connection
    const dbClient = supabaseAdmin || supabase;
    
    if (!dbClient) {
      return NextResponse.json({
        status: 'error',
        message: 'Database client not available',
        details: { adminClient: !!supabaseAdmin, regularClient: !!supabase }
      }, { status: 500 });
    }
    
    // Test basic query
    const { data, error } = await dbClient
      .from('matches')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database health check failed:', error);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    console.log('✅ Database health check passed');
    
    return NextResponse.json({
      status: 'healthy',
      message: 'All systems operational',
      database: {
        connected: true,
        matchesCount: data?.length || 0
      },
      environment: envCheck
    });
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    }, { status: 500 });
  }
}

