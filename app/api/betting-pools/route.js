import { NextResponse } from 'next/server';

// In-memory storage for betting pools (in production, use a database)
// Start with empty pools so new matches get initialized with 50-50
let globalBettingPools = {};

// GET - Retrieve current betting pools
export async function GET() {
  try {
    console.log('📥 GET /api/betting-pools - Current pools:', globalBettingPools);
    
    return NextResponse.json({
      success: true,
      pools: globalBettingPools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting betting pools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve betting pools' },
      { status: 500 }
    );
  }
}

// POST - Update betting pools
export async function POST(request) {
  try {
    const { pools } = await request.json();
    
    if (!pools || typeof pools !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid pools data provided' },
        { status: 400 }
      );
    }
    
    // Merge new pools with existing ones
    globalBettingPools = { ...globalBettingPools, ...pools };
    
    console.log('📤 POST /api/betting-pools - Updated pools:', globalBettingPools);
    
    return NextResponse.json({
      success: true,
      message: 'Betting pools updated successfully',
      pools: globalBettingPools,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error updating betting pools:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update betting pools' },
      { status: 500 }
    );
  }
}
