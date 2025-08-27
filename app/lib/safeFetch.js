// Safe Fetch Utility
// Wraps all fetch calls with comprehensive error handling and timeout protection

export async function safeFetch(url, options = {}) {
  const defaultOptions = {
    signal: AbortSignal.timeout(10000), // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    console.log(`🌐 Safe fetch: ${url}`);
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      console.warn(`⚠️ HTTP ${response.status} for ${url}`);
      return { success: false, error: `HTTP ${response.status}`, response: null };
    }

    const data = await response.json();
    console.log(`✅ Safe fetch success: ${url}`);
    return { success: true, data, response };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`⏰ Fetch timeout for ${url}`);
      return { success: false, error: 'Request timeout', response: null };
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn(`🌐 Network error for ${url}:`, error.message);
      return { success: false, error: 'Network error', response: null };
    }
    
    console.error(`❌ Fetch error for ${url}:`, error);
    return { success: false, error: error.message, response: null };
  }
}

// Helper function to check if we're in demo mode
export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  
  // Check for demo data indicators
  const hasDemoData = localStorage.getItem('admin_demo_matches') || 
                     localStorage.getItem('wrestlebet_betting_pools') ||
                     localStorage.getItem('wrestlebet_bets');
  
  return !!hasDemoData;
}

// Helper function to get demo data fallback
export function getDemoFallback(endpoint) {
  switch (endpoint) {
    case '/api/votes':
      return {
        success: true,
        matches: [
          {
            id: 'demo-1',
            wrestler1: 'David Taylor',
            wrestler2: 'Hassan Yazdani',
            voteCounts: { 'David Taylor': 45, 'Hassan Yazdani': 55 },
            totalVotes: 100
          }
        ]
      };
    case '/api/betting-pools':
      return {
        success: true,
        pools: {
          'davidtaylor-hassanyazdani': { wrestler1: 100, wrestler2: 100 }
        }
      };
    case '/api/bets':
      return {
        success: true,
        bets: []
      };
    default:
      return { success: false, error: 'No demo data available' };
  }
}
