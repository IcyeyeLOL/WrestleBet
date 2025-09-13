// Admin Portal Access Helper
// Run this in your browser console to bypass admin authentication

console.log('🔑 Admin Portal Access Helper');
console.log('Setting admin access...');

// Set admin access in localStorage
localStorage.setItem('wrestlebet_admin_access', 'true');

console.log('✅ Admin access granted!');
console.log('You can now navigate to /admin');

// Optional: Navigate to admin page
if (confirm('Navigate to admin page now?')) {
  window.location.href = '/admin';
}
