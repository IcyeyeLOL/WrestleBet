// Test frontend Supabase connection - run this in browser console
(async function testFrontendSupabase() {
  console.log('🔍 Testing frontend Supabase connection...');
  
  try {
    // Import the supabase client the same way the frontend does
    const { createClient } = window.supabase;
    
    const supabaseUrl = 'https://hpkxmotzidywoilooqpx.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg2MzcsImV4cCI6MjA2OTg2NDYzN30.KbbrGQPzXcO3SBRvXk2ySdCzprNiUXCnQZdiQRgCuNc';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('📡 Testing raw match query...');
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .in('status', ['active', 'upcoming'])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Frontend Supabase error:', error);
    } else {
      console.log(`✅ Frontend can see ${data.length} matches:`, data);
      
      data.forEach((match, idx) => {
        console.log(`  ${idx + 1}. ${match.wrestler1} vs ${match.wrestler2} (${match.status}) - ID: ${match.id}`);
      });
    }
    
  } catch (err) {
    console.error('💥 Test error:', err);
  }
})();
