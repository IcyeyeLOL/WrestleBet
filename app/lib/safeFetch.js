// Safe Fetch Utility
// Wraps all fetch calls with comprehensive error handling and timeout protection

export function safeFetch(url, options = {}) {
  // Create a more compatible timeout implementation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const defaultOptions = {
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Promise((resolve) => {
    try {
      console.log(`🌐 Safe fetch: ${url}`);
      fetch(url, mergedOptions)
        .then(response => {
          clearTimeout(timeoutId); // Clear timeout on successful response
          if (!response.ok) {
            console.warn(`⚠️ HTTP ${response.status} for ${url}`);
            resolve({ success: false, error: `HTTP ${response.status}`, response: null });
            return;
          }

          return response.json();
        })
        .then(data => {
          console.log(`✅ Safe fetch success: ${url}`);
          resolve({ success: true, data, response: null });
        })
        .catch(error => {
          clearTimeout(timeoutId); // Clear timeout on error
          if (error.name === 'AbortError') {
            console.warn(`⏰ Fetch timeout for ${url}`);
            resolve({ success: false, error: 'Request timeout', response: null });
          } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.warn(`🌐 Network error for ${url}:`, error.message);
            resolve({ success: false, error: 'Network error', response: null });
          } else {
            console.error(`❌ Fetch error for ${url}:`, error);
            resolve({ success: false, error: error.message, response: null });
          }
        });
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout on catch
      console.error(`❌ Fetch error for ${url}:`, error);
      resolve({ success: false, error: error.message, response: null });
    }
  });
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

