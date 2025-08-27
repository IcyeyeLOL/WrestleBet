// Global Data Synchronization System
// Ensures all data is consistent across users, devices, and platforms

class GlobalDataSync {
  constructor() {
    this.storageKey = 'wrestlebet_global_data';
    this.syncInterval = 30000; // 30 seconds
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncAllData();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  // Get all global data
  getAllData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {
        matches: {},
        bettingPools: {},
        votes: {},
        bets: [],
        lastSync: null
      };
    } catch (error) {
      console.error('Error getting global data:', error);
      return {
        matches: {},
        bettingPools: {},
        votes: {},
        bets: [],
        lastSync: null
      };
    }
  }

  // Save all global data
  saveAllData(data) {
    try {
      const dataToSave = {
        ...data,
        lastSync: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Error saving global data:', error);
      return false;
    }
  }

  // Update specific data type
  updateData(type, data) {
    const allData = this.getAllData();
    allData[type] = data;
    return this.saveAllData(allData);
  }

  // Get specific data type
  getData(type) {
    const allData = this.getAllData();
    return allData[type] || {};
  }

  // Sync with server
  async syncWithServer() {
    if (!this.isOnline || this.syncInProgress) return false;
    
    this.syncInProgress = true;
    
    try {
      // Sync matches
      const matchesResponse = await fetch('/api/votes');
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        if (matchesData.success && matchesData.matches) {
          this.updateData('matches', matchesData.matches);
        }
      }

      // Sync betting pools
      const poolsResponse = await fetch('/api/betting-pools');
      if (poolsResponse.ok) {
        const poolsData = await poolsResponse.json();
        if (poolsData.success && poolsData.pools) {
          this.updateData('bettingPools', poolsData.pools);
        }
      }

      // Sync bets
      const betsResponse = await fetch('/api/bets');
      if (betsResponse.ok) {
        const betsData = await betsResponse.json();
        if (betsData.success && betsData.bets) {
          this.updateData('bets', betsData.bets);
        }
      }

      console.log('✅ Global data sync completed');
      return true;
    } catch (error) {
      console.error('❌ Global data sync failed:', error);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  // Start automatic sync
  startAutoSync() {
    if (typeof window === 'undefined') return;
    
    // Initial sync
    this.syncWithServer();
    
    // Set up interval
    this.syncIntervalId = setInterval(() => {
      this.syncWithServer();
    }, this.syncInterval);
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // Sync all data (public method)
  async syncAllData() {
    return await this.syncWithServer();
  }

  // Clear all data
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('wrestlebet_global_matches');
      localStorage.removeItem('wrestlebet_betting_pools');
      localStorage.removeItem('wrestlebet_bets');
      localStorage.removeItem('admin_demo_matches');
      return true;
    } catch (error) {
      console.error('Error clearing global data:', error);
      return false;
    }
  }

  // Reset betting pools to 50-50 for all matches
  resetPoolsTo5050() {
    try {
      const allData = this.getAllData();
      const matches = allData.matches || {};
      const resetPools = {};
      
      Object.keys(matches).forEach(matchKey => {
        resetPools[matchKey] = { wrestler1: 100, wrestler2: 100 };
      });
      
      allData.bettingPools = resetPools;
      this.saveAllData(allData);
      
      console.log('🔄 Reset all pools to 50-50:', resetPools);
      return true;
    } catch (error) {
      console.error('Error resetting pools to 50-50:', error);
      return false;
    }
  }

  // Get sync status
  getSyncStatus() {
    const data = this.getAllData();
    return {
      isOnline: this.isOnline,
      lastSync: data.lastSync,
      hasData: Object.keys(data.matches).length > 0,
      syncInProgress: this.syncInProgress
    };
  }
}

// Create singleton instance
const globalDataSync = new GlobalDataSync();

export default globalDataSync;
