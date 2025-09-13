/**
 * Clerk Middleware Configuration Test
 * Run this in browser console to verify middleware is working
 */

console.log('🔐 Testing Clerk Middleware Configuration...');

// Test 1: Check if auth routes are accessible without errors
const testAuthRoutes = async () => {
  console.log('🔍 Test 1: Testing auth route accessibility...');
  
  const routes = ['/sign-in', '/sign-up'];
  const results = {};
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      results[route] = {
        status: response.status,
        ok: response.ok,
        accessible: response.status === 200
      };
      console.log(`${route}: ${response.status} ${response.ok ? '✅' : '❌'}`);
    } catch (error) {
      results[route] = {
        status: 'ERROR',
        ok: false,
        accessible: false,
        error: error.message
      };
      console.log(`${route}: ERROR ❌`, error.message);
    }
  }
  
  return results;
};

// Test 2: Check if protected routes redirect to sign-in when not authenticated
const testProtectedRoutes = async () => {
  console.log('🔍 Test 2: Testing protected route behavior...');
  
  const protectedRoutes = ['/admin', '/account', '/bets'];
  const results = {};
  
  for (const route of protectedRoutes) {
    try {
      const response = await fetch(route, { redirect: 'manual' });
      results[route] = {
        status: response.status,
        redirected: response.status === 302 || response.status === 307,
        location: response.headers.get('location')
      };
      
      if (results[route].redirected) {
        console.log(`${route}: Properly protected ✅ (redirects to ${results[route].location})`);
      } else {
        console.log(`${route}: ${response.status} ${response.status === 200 ? '⚠️ Not protected' : '❌'}`);
      }
    } catch (error) {
      results[route] = {
        status: 'ERROR',
        error: error.message
      };
      console.log(`${route}: ERROR ❌`, error.message);
    }
  }
  
  return results;
};

// Test 3: Check if public routes are accessible
const testPublicRoutes = async () => {
  console.log('🔍 Test 3: Testing public route accessibility...');
  
  const publicRoutes = ['/', '/api/votes'];
  const results = {};
  
  for (const route of publicRoutes) {
    try {
      const response = await fetch(route);
      results[route] = {
        status: response.status,
        ok: response.ok,
        accessible: response.status === 200
      };
      console.log(`${route}: ${response.status} ${response.ok ? '✅' : '❌'}`);
    } catch (error) {
      results[route] = {
        status: 'ERROR',
        ok: false,
        accessible: false,
        error: error.message
      };
      console.log(`${route}: ERROR ❌`, error.message);
    }
  }
  
  return results;
};

// Test 4: Check console for middleware errors
const testConsoleErrors = () => {
  console.log('🔍 Test 4: Monitoring for middleware-related errors...');
  
  const originalError = console.error;
  const middlewareErrors = [];
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.toLowerCase().includes('middleware') || 
        message.toLowerCase().includes('clerk') ||
        message.toLowerCase().includes('routing')) {
      middlewareErrors.push(message);
    }
    originalError.apply(console, args);
  };
  
  // Restore after 5 seconds
  setTimeout(() => {
    console.error = originalError;
    
    if (middlewareErrors.length > 0) {
      console.log('❌ Found middleware errors:');
      middlewareErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No middleware errors detected');
    }
  }, 5000);
  
  return middlewareErrors;
};

// Run comprehensive middleware test
const runMiddlewareTest = async () => {
  console.log('🚀 Running comprehensive Clerk middleware test...');
  console.log('================================================');
  
  const results = {};
  
  try {
    // Test auth routes
    console.log('\n--- Auth Routes Test ---');
    results.authRoutes = await testAuthRoutes();
    
    // Test protected routes
    console.log('\n--- Protected Routes Test ---');
    results.protectedRoutes = await testProtectedRoutes();
    
    // Test public routes
    console.log('\n--- Public Routes Test ---');
    results.publicRoutes = await testPublicRoutes();
    
    // Monitor console errors
    console.log('\n--- Console Error Monitoring ---');
    results.consoleErrors = testConsoleErrors();
    
    console.log('\n🎯 MIDDLEWARE TEST RESULTS:');
    console.log('============================');
    
    // Auth routes assessment
    const authRoutesOk = Object.values(results.authRoutes).every(r => r.accessible);
    console.log(`Auth Routes: ${authRoutesOk ? '✅' : '❌'}`);
    
    // Protected routes assessment
    const protectedRoutesOk = Object.values(results.protectedRoutes).some(r => r.redirected);
    console.log(`Protected Routes: ${protectedRoutesOk ? '✅' : '❌'}`);
    
    // Public routes assessment
    const publicRoutesOk = Object.values(results.publicRoutes).every(r => r.accessible);
    console.log(`Public Routes: ${publicRoutesOk ? '✅' : '❌'}`);
    
    // Overall assessment
    const overall = authRoutesOk && publicRoutesOk;
    console.log(`\n🏆 Overall Middleware Status: ${overall ? '✅ WORKING CORRECTLY' : '❌ ISSUES DETECTED'}`);
    
    if (!overall) {
      console.log('\n🔧 Recommendations:');
      if (!authRoutesOk) console.log('  - Check auth route configuration');
      if (!publicRoutesOk) console.log('  - Check public route accessibility');
      if (!protectedRoutesOk) console.log('  - Check protected route behavior');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Middleware test failed:', error);
    return { error: error.message };
  }
};

// Export for manual testing
window.testClerkMiddleware = {
  testAuthRoutes,
  testProtectedRoutes,
  testPublicRoutes,
  testConsoleErrors,
  runMiddlewareTest
};

console.log('🎮 Test functions available: window.testClerkMiddleware');
console.log('Run: window.testClerkMiddleware.runMiddlewareTest()');

// Auto-run the test
runMiddlewareTest();
