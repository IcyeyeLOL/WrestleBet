/**
 * Test Admin Global Match Synchronization
 * Run this in browser console to test if admin matches appear globally
 */

console.log('🧪 Testing Admin Global Match Synchronization...');

// Test 1: Check if admin-match-created event listeners are active
const testEventListeners = () => {
  console.log('📡 Testing event listeners...');
  
  // Dispatch a test event
  window.dispatchEvent(new CustomEvent('admin-match-created', {
    detail: { testMode: true, timestamp: Date.now() }
  }));
  
  console.log('✅ Dispatched admin-match-created event');
};

// Test 2: Check current match data sources
const checkMatchSources = () => {
  console.log('📊 Checking match data sources...');
  
  // Check localStorage
  const localMatches = localStorage.getItem('wrestlebet_poll_data');
  console.log('🗄️ LocalStorage matches:', localMatches ? JSON.parse(localMatches) : 'None');
  
  // Check globalDataSync
  if (window.globalDataSync) {
    const globalMatches = window.globalDataSync.getData('matches');
    console.log('🌍 Global sync matches:', globalMatches);
  }
  
  // Check admin storage
  const adminMatches = localStorage.getItem('admin_demo_matches');
  console.log('👤 Admin matches:', adminMatches ? JSON.parse(adminMatches) : 'None');
};

// Test 3: Create a test match programmatically
const createTestMatch = () => {
  console.log('🆕 Creating test match...');
  
  const testMatch = {
    id: `test-match-${Date.now()}`,
    wrestler1: 'Test Wrestler A',
    wrestler2: 'Test Wrestler B',
    event_name: 'Test Event',
    weight_class: 'Test Weight',
    status: 'upcoming',
    total_bets: 0,
    total_votes: 0,
    created_at: new Date().toISOString()
  };
  
  // Add to admin storage
  const current = JSON.parse(localStorage.getItem('admin_demo_matches') || '[]');
  current.push(testMatch);
  localStorage.setItem('admin_demo_matches', JSON.stringify(current));
  
  // Trigger global sync
  window.dispatchEvent(new CustomEvent('admin-match-created', {
    detail: { match: testMatch }
  }));
  
  console.log('✅ Test match created and event dispatched:', testMatch);
  
  return testMatch;
};

// Test 4: Check front page data loading
const checkFrontPageData = () => {
  console.log('🏠 Checking front page data loading...');
  
  // Try to access React context data
  if (window.React && window.ReactDOM) {
    console.log('⚛️ React is available');
    
    // Check if betting context is accessible
    const frontPageElement = document.querySelector('[data-testid="front-page"]') || 
                             document.querySelector('.front-page') ||
                             document.querySelector('main');
    
    if (frontPageElement) {
      console.log('🎯 Front page element found:', frontPageElement);
    } else {
      console.log('❌ Front page element not found');
    }
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive admin sync test...');
  
  testEventListeners();
  
  setTimeout(() => {
    checkMatchSources();
  }, 500);
  
  setTimeout(() => {
    const testMatch = createTestMatch();
    
    // Check if match appears in global data after creation
    setTimeout(() => {
      console.log('🔍 Checking if test match appears globally...');
      checkMatchSources();
      checkFrontPageData();
      
      // Clean up test match
      const current = JSON.parse(localStorage.getItem('admin_demo_matches') || '[]');
      const filtered = current.filter(m => m.id !== testMatch.id);
      localStorage.setItem('admin_demo_matches', JSON.stringify(filtered));
      console.log('🧹 Cleaned up test match');
      
    }, 1000);
  }, 1000);
};

// Export for manual testing
window.testAdminGlobalSync = {
  testEventListeners,
  checkMatchSources,
  createTestMatch,
  checkFrontPageData,
  runAllTests
};

console.log('🎮 Test functions available: window.testAdminGlobalSync');
console.log('Run: window.testAdminGlobalSync.runAllTests()');

// Auto-run the test
runAllTests();
