// Global Storage Utility for cross-tab and cross-session data persistence

class GlobalStorage {
  constructor() {
    this.storageKey = 'wrestle_bet_global_data';
    this.listeners = new Map();
  }

  // Get data from global storage
  get(key) {
    try {
      if (typeof window === 'undefined') return null;
      
      // Try sessionStorage first (cross-tab)
      const sessionData = sessionStorage.getItem(`${this.storageKey}_${key}`);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      
      // Fallback to localStorage (persistent)
      const localData = localStorage.getItem(`${this.storageKey}_${key}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        // Sync to sessionStorage for cross-tab access
        sessionStorage.setItem(`${this.storageKey}_${key}`, localData);
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Error reading from global storage:', error);
      return null;
    }
  }

  // Set data to global storage
  set(key, value) {
    try {
      if (typeof window === 'undefined') return false;
      
      const serialized = JSON.stringify(value);
      
      // Store in both sessionStorage and localStorage
      sessionStorage.setItem(`${this.storageKey}_${key}`, serialized);
      localStorage.setItem(`${this.storageKey}_${key}`, serialized);
      
      // Notify other tabs
      this.notifyListeners(key, value);
      
      return true;
    } catch (error) {
      console.error('Error writing to global storage:', error);
      return false;
    }
  }

  // Remove data from global storage
  remove(key) {
    try {
      if (typeof window === 'undefined') return false;
      
      sessionStorage.removeItem(`${this.storageKey}_${key}`);
      localStorage.removeItem(`${this.storageKey}_${key}`);
      
      // Notify other tabs
      this.notifyListeners(key, null);
      
      return true;
    } catch (error) {
      console.error('Error removing from global storage:', error);
      return false;
    }
  }

  // Listen for storage changes across tabs
  listen(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Set up storage event listener for cross-tab communication
    if (typeof window !== 'undefined') {
      const handleStorageChange = (event) => {
        if (event.key === `${this.storageKey}_${key}`) {
          try {
            const newValue = event.newValue ? JSON.parse(event.newValue) : null;
            this.notifyListeners(key, newValue);
          } catch (error) {
            console.error('Error parsing storage change:', error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Return cleanup function
      return () => {
        this.listeners.get(key)?.delete(callback);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }

  // Notify all listeners for a key
  notifyListeners(key, value) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('Error in storage listener callback:', error);
        }
      });
    }
  }

  // Clear all data
  clear() {
    try {
      if (typeof window === 'undefined') return false;
      
      // Clear all keys that start with our prefix
      const keysToRemove = [];
      
      // Get keys from sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }
      
      // Get keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all keys
      keysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing global storage:', error);
      return false;
    }
  }
}

// Create singleton instance
const globalStorage = new GlobalStorage();

export default globalStorage;
