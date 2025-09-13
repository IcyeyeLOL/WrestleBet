// Performance monitoring utilities for WrestleBet
// This module provides performance tracking and optimization tools

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a performance metric
  startTiming(label) {
    if (!this.isEnabled) return;
    this.metrics.set(label, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  // End timing and log the result
  endTiming(label) {
    if (!this.isEnabled) return;
    
    const metric = this.metrics.get(label);
    if (!metric) {
      console.warn(`Performance metric "${label}" was not started`);
      return;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    
    console.log(`⏱️ ${label}: ${metric.duration.toFixed(2)}ms`);
    
    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`🐌 Slow operation detected: ${label} took ${metric.duration.toFixed(2)}ms`);
    }
    
    return metric.duration;
  }

  // Measure function execution time
  measureFunction(fn, label) {
    return async (...args) => {
      this.startTiming(label);
      try {
        const result = await fn(...args);
        this.endTiming(label);
        return result;
      } catch (error) {
        this.endTiming(label);
        throw error;
      }
    };
  }

  // Get all metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
  }
}

// Database query performance tracker
class DatabasePerformanceTracker {
  constructor() {
    this.queries = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Track a database query
  trackQuery(queryName, queryFn) {
    return async (...args) => {
      if (!this.isEnabled) return queryFn(...args);

      const startTime = performance.now();
      try {
        const result = await queryFn(...args);
        const duration = performance.now() - startTime;
        
        this.queries.set(queryName, {
          count: (this.queries.get(queryName)?.count || 0) + 1,
          totalTime: (this.queries.get(queryName)?.totalTime || 0) + duration,
          averageTime: 0,
          lastExecuted: new Date()
        });

        const query = this.queries.get(queryName);
        query.averageTime = query.totalTime / query.count;

        // Log slow queries
        if (duration > 500) {
          console.warn(`🐌 Slow database query: ${queryName} took ${duration.toFixed(2)}ms`);
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ Database query failed: ${queryName} (${duration.toFixed(2)}ms)`, error);
        throw error;
      }
    };
  }

  // Get query statistics
  getQueryStats() {
    return Object.fromEntries(this.queries);
  }

  // Get slowest queries
  getSlowestQueries(limit = 5) {
    return Array.from(this.queries.entries())
      .sort((a, b) => b[1].averageTime - a[1].averageTime)
      .slice(0, limit);
  }
}

// Memory usage tracker
class MemoryTracker {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.interval = null;
  }

  // Start monitoring memory usage
  startMonitoring(intervalMs = 30000) {
    if (!this.isEnabled || typeof window === 'undefined') return;

    this.interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = performance.memory;
        console.log('🧠 Memory Usage:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        });

        // Warn about high memory usage
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(2)}%`);
        }
      }
    }, intervalMs);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Bundle size analyzer
class BundleAnalyzer {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  // Analyze component bundle size
  analyzeComponent(componentName, component) {
    if (!this.isEnabled) return;

    try {
      const componentString = component.toString();
      const size = new Blob([componentString]).size;
      
      console.log(`📦 Component "${componentName}" size: ${(size / 1024).toFixed(2)} KB`);
      
      if (size > 50000) { // 50KB
        console.warn(`⚠️ Large component detected: ${componentName} (${(size / 1024).toFixed(2)} KB)`);
      }
    } catch (error) {
      console.warn(`Could not analyze component "${componentName}":`, error);
    }
  }
}

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const dbTracker = new DatabasePerformanceTracker();
export const memoryTracker = new MemoryTracker();
export const bundleAnalyzer = new BundleAnalyzer();

// React hook for performance monitoring
export const usePerformanceMonitor = (label) => {
  const startTiming = () => performanceMonitor.startTiming(label);
  const endTiming = () => performanceMonitor.endTiming(label);
  
  return { startTiming, endTiming };
};

// Higher-order component for performance monitoring
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    const { startTiming, endTiming } = usePerformanceMonitor(componentName);
    
    React.useEffect(() => {
      startTiming();
      return () => endTiming();
    });

    return <WrappedComponent {...props} />;
  });
};

// Utility functions for common performance optimizations
export const performanceUtils = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  },

  // Batch DOM updates
  batchUpdates: (updates) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }
};

export default {
  performanceMonitor,
  dbTracker,
  memoryTracker,
  bundleAnalyzer,
  usePerformanceMonitor,
  withPerformanceMonitoring,
  performanceUtils
};

