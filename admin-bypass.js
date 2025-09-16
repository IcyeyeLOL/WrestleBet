// ADMIN PORTAL BYPASS - Run this in browser console
// This will force admin access and redirect you to the admin panel

console.log('🔧 ADMIN PORTAL BYPASS ACTIVATED');

// Method 1: Force admin access
localStorage.setItem('wrestlebet_admin_access', 'true');
console.log('✅ Admin access granted');

// Method 2: Clear any blocking states
localStorage.removeItem('wrestlebet_admin_blocked');
localStorage.removeItem('wrestlebet_admin_denied');
console.log('✅ Cleared blocking states');

// Method 3: Set admin user metadata
if (window.Clerk && window.Clerk.user) {
  console.log('👤 User found:', window.Clerk.user.username);
} else {
  console.log('⚠️ No Clerk user found - you may need to sign in first');
}

// Method 4: Force redirect to admin
console.log('🚀 Redirecting to admin panel...');
window.location.href = '/admin';

// Alternative: If redirect doesn't work, try this:
setTimeout(() => {
  console.log('🔄 Fallback redirect...');
  window.location.reload();
}, 2000);



