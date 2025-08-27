// Global Data Synchronization System
// Ensures all data is consistent across users, devices, and platforms

import { safeFetch, isDemoMode, getDemoFallback } from './safeFetch.js';

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
    
    // Check if we're in demo mode
    if (isDemoMode()) {
      console.log('📱 Demo mode detected, skipping server sync');
      return false;
    }
    
    this.syncInProgress = true;
    
    try {
      // Sync matches with safe fetch
      const matchesResult = await safeFetch('/api/votes');
      if (matchesResult.success && matchesResult.data?.matches) {
        this.updateData('matches', matchesResult.data.matches);
      } else {
        console.log('⚠️ Matches sync failed, using local data');
      }

      // Sync betting pools with safe fetch
      const poolsResult = await safeFetch('/api/betting-pools');
      if (poolsResult.success && poolsResult.data?.pools) {
        this.updateData('bettingPools', poolsResult.data.pools);
      } else {
        console.log('⚠️ Pools sync failed, using local data');
      }

      // Sync bets with safe fetch
      const betsResult = await safeFetch('/api/bets');
      if (betsResult.success && betsResult.data?.bets) {
        this.updateData('bets', betsResult.data.bets);
      } else {
        console.log('⚠️ Bets sync failed, using local data');
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
    
    // Wait a bit before starting sync to ensure the app is fully loaded
    setTimeout(() => {
      this.syncWithServer();
    }, 2000);
    
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
