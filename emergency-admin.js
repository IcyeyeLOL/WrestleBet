// EMERGENCY ADMIN ACCESS - Run this in browser console
console.log('🚨 EMERGENCY ADMIN ACCESS ACTIVATED');

// Step 1: Force admin access
localStorage.setItem('wrestlebet_admin_access', 'true');
console.log('✅ Admin access set');

// Step 2: Clear any cached data that might be causing issues
localStorage.removeItem('wrestlebet_admin_blocked');
localStorage.removeItem('wrestlebet_admin_denied');
localStorage.removeItem('wrestlebet_admin_error');
console.log('✅ Cleared admin cache');

// Step 3: Force a hard refresh to clear any component state
console.log('🔄 Forcing hard refresh...');
window.location.href = '/admin';

// Step 4: If that doesn't work, try direct component bypass
setTimeout(() => {
  console.log('🔄 Fallback: Direct admin component load...');
  
  // Try to force render the admin content
  const adminContent = document.querySelector('[data-admin-content]');
  if (adminContent) {
    adminContent.style.display = 'block';
    console.log('✅ Admin content found and shown');
  } else {
    console.log('⚠️ Admin content not found, trying alternative...');
    
    // Create a simple admin interface
    const body = document.body;
    body.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e293b, #1e40af, #1e293b); min-height: 100vh; padding: 20px;">
        <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 30px; max-width: 1200px; margin: 0 auto;">
          <h1 style="color: white; font-size: 2.5rem; margin-bottom: 20px;">🛡️ Emergency Admin Panel</h1>
          <p style="color: #cbd5e1; margin-bottom: 30px;">You're in emergency admin mode. Use the buttons below to manage matches.</p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <button onclick="createTestMatch()" style="background: #059669; color: white; padding: 15px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px;">
              🥊 Create Test Match
            </button>
            <button onclick="viewMatches()" style="background: #2563eb; color: white; padding: 15px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px;">
              📋 View Matches
            </button>
            <button onclick="goHome()" style="background: #dc2626; color: white; padding: 15px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px;">
              🏠 Go Home
            </button>
          </div>
          
          <div id="admin-output" style="margin-top: 30px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 10px; color: white; min-height: 200px;">
            <h3>Admin Output:</h3>
            <div id="output-content">Ready for commands...</div>
          </div>
        </div>
      </div>
    `;
    
    // Add the functions
    window.createTestMatch = async () => {
      const output = document.getElementById('output-content');
      output.innerHTML = 'Creating test match...';
      
      try {
        const response = await fetch('/api/admin/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wrestler1: 'Test Wrestler 1',
            wrestler2: 'Test Wrestler 2',
            event_name: 'Emergency Test Event',
            weight_class: '74KG',
            match_date: new Date().toISOString()
          })
        });
        
        const result = await response.json();
        output.innerHTML = `✅ Test match created: ${JSON.stringify(result, null, 2)}`;
      } catch (error) {
        output.innerHTML = `❌ Error: ${error.message}`;
      }
    };
    
    window.viewMatches = async () => {
      const output = document.getElementById('output-content');
      output.innerHTML = 'Loading matches...';
      
      try {
        const response = await fetch('/api/matches');
        const result = await response.json();
        output.innerHTML = `📋 Matches: ${JSON.stringify(result, null, 2)}`;
      } catch (error) {
        output.innerHTML = `❌ Error: ${error.message}`;
      }
    };
    
    window.goHome = () => {
      window.location.href = '/';
    };
    
    console.log('✅ Emergency admin interface created');
  }
}, 3000);



