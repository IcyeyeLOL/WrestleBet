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
