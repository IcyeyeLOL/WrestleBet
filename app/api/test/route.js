// Simple test API route
export async function GET() {
  return Response.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return Response.json({ 
    success: true, 
    message: 'POST API is working!',
    timestamp: new Date().toISOString()
  });
}
