import { NextResponse } from 'next/server';

// In-memory storage for betting pools (in production, use a database)
let globalBettingPools = {
  'taylor-yazdani': { wrestler1: 100, wrestler2: 50 },    // Taylor: 100 WC, Yazdani: 50 WC
  'dake-punia': { wrestler1: 75, wrestler2: 125 },       // Dake: 75 WC, Punia: 125 WC
  'steveson-petriashvili': { wrestler1: 30, wrestler2: 80 } // Steveson: 30 WC, Petriashvili: 80 WC
};

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
