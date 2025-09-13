// Simple test version of bets API to diagnose issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  try {
    console.log('🔍 Simple bets API test called')
    
    return Response.json({
      success: true,
      message: 'Bets API is working - this is a test response',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Simple bets API error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    console.log('🔍 Simple bets POST test called')
    
    const body = await request.json()
    
    return Response.json({
      success: true,
      message: 'Bets POST API is working - this is a test response',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Simple bets POST API error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
