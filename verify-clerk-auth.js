/**
 * Clerk Auth Route Verification Script
 * Run this in browser console to verify auth routes are working
 */

console.log('🔐 Testing Clerk Auth Route Configuration...');

// Test 1: Check if current page loads without errors
const testCurrentPage = () => {
  console.log('📍 Test 1: Current page configuration');
  
  const currentPath = window.location.pathname;
  console.log(`Current path: ${currentPath}`);
  
  // Check for Clerk components
  const clerkElements = document.querySelectorAll('[data-clerk-element]');
  console.log(`Found ${clerkElements.length} Clerk elements`);
  
  // Check for error messages
  const errorElements = document.querySelectorAll('[data-testid="error"], .clerk-error, .error');
  console.log(`Found ${errorElements.length} error elements`);
  
  if (errorElements.length > 0) {
    console.log('❌ Error elements found:', Array.from(errorElements).map(el => el.textContent));
    return false;
  } else {
    console.log('✅ No error elements found');
    return true;
  }
};

// Test 2: Check route accessibility
const testRouteAccessibility = async () => {
  console.log('🔄 Test 2: Testing route accessibility...');
  
  const testRoutes = [
    '/sign-in',
    '/sign-up', 
    '/',
    '/admin'
  ];
  
  const results = {};
  
  for (const route of testRoutes) {
    try {
      const response = await fetch(route);
      results[route] = {
        status: response.status,
        ok: response.ok,
        accessible: response.status < 400
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

// Test 3: Check Clerk provider and configuration
const testClerkConfiguration = () => {
  console.log('⚙️ Test 3: Checking Clerk configuration...');
  
  // Check if Clerk is available
  const hasClerk = typeof window.Clerk !== 'undefined';
  console.log(`Clerk instance available: ${hasClerk ? '✅' : '❌'}`);
  
  // Check if ClerkProvider is wrapping the app
  const clerkProvider = document.querySelector('[data-clerk-provider]') || 
                       document.querySelector('.clerk-provider');
  console.log(`ClerkProvider found: ${clerkProvider ? '✅' : '❌'}`);
  
  // Check current auth state
  if (hasClerk) {
    try {
      const isSignedIn = window.Clerk.user ? true : false;
      console.log(`User signed in: ${isSignedIn ? '✅' : '❌'}`);
      
      if (isSignedIn) {
        console.log(`User ID: ${window.Clerk.user.id}`);
        console.log(`User email: ${window.Clerk.user.primaryEmailAddress?.emailAddress || 'N/A'}`);
      }
    } catch (error) {
      console.log('⚠️ Error checking auth state:', error.message);
    }
  }
  
  return {
    clerkAvailable: hasClerk,
    providerFound: !!clerkProvider,
    isSignedIn: hasClerk && window.Clerk.user ? true : false
  };
};

// Test 4: Navigation test
const testNavigation = () => {
  console.log('🧭 Test 4: Testing navigation between auth routes...');
  
  const originalPath = window.location.pathname;
  console.log(`Starting from: ${originalPath}`);
  
  // Test programmatic navigation
  const testPaths = ['/sign-in', '/sign-up', '/'];
  
  testPaths.forEach((path, index) => {
    setTimeout(() => {
      console.log(`Navigating to: ${path}`);
      window.history.pushState({}, '', path);
      
      // Check if navigation was successful
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const success = currentPath === path;
        console.log(`Navigation to ${path}: ${success ? '✅' : '❌'} (actually: ${currentPath})`);
        
        // Return to original path after testing
        if (index === testPaths.length - 1) {
          setTimeout(() => {
            window.history.pushState({}, '', originalPath);
            console.log(`Returned to original path: ${originalPath}`);
          }, 500);
        }
      }, 100);
    }, index * 1000);
  });
};

// Test 5: Check console for Clerk errors
const testConsoleErrors = () => {
  console.log('🔍 Test 5: Checking for Clerk-related console errors...');
  
  // Override console.error temporarily to catch Clerk errors
  const originalError = console.error;
  const clerkErrors = [];
  
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.toLowerCase().includes('clerk')) {
      clerkErrors.push(message);
    }
    originalError.apply(console, args);
  };
  
  // Restore after 3 seconds
  setTimeout(() => {
    console.error = originalError;
    
    if (clerkErrors.length > 0) {
      console.log('❌ Found Clerk errors:');
      clerkErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No Clerk errors detected');
    }
  }, 3000);
  
  return clerkErrors;
};

// Run comprehensive test
const runAuthVerification = async () => {
  console.log('🚀 Running comprehensive Clerk auth verification...');
  console.log('================================================');
  
  const results = {};
  
  // Test 1: Current page
  results.currentPage = testCurrentPage();
  
  // Test 2: Route accessibility
  results.routeAccessibility = await testRouteAccessibility();
  
  // Test 3: Clerk configuration
  results.clerkConfig = testClerkConfiguration();
  
  // Test 4: Navigation (delayed)
  setTimeout(() => {
    testNavigation();
  }, 1000);
  
  // Test 5: Console errors (ongoing)
  results.consoleErrors = testConsoleErrors();
  
  console.log('\n🎯 AUTH VERIFICATION RESULTS:');
  console.log('==============================');
  Object.entries(results).forEach(([testName, result]) => {
    console.log(`${testName}:`, result);
  });
  
  // Overall assessment
  const currentPageOk = results.currentPage;
  const routesOk = Object.values(results.routeAccessibility).every(r => r.accessible);
  const clerkOk = results.clerkConfig.clerkAvailable;
  
  const overall = currentPageOk && routesOk && clerkOk;
  console.log(`\n🏆 Overall Status: ${overall ? '✅ AUTH SYSTEM WORKING' : '❌ ISSUES DETECTED'}`);
  
  if (!overall) {
    console.log('\n🔧 Recommendations:');
    if (!currentPageOk) console.log('  - Check for JavaScript errors on current page');
    if (!routesOk) console.log('  - Verify route configuration and middleware');
    if (!clerkOk) console.log('  - Check Clerk provider setup and environment variables');
  }
  
  return results;
};

// Export for manual testing
window.verifyClerkAuth = {
  testCurrentPage,
  testRouteAccessibility,
  testClerkConfiguration,
  testNavigation,
  testConsoleErrors,
  runAuthVerification
};

console.log('🎮 Test functions available: window.verifyClerkAuth');
console.log('Run: window.verifyClerkAuth.runAuthVerification()');

// Auto-run verification
runAuthVerification();
