"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';
import globalStorage from '../lib/globalStorage';

// Global State Context
const GlobalStateContext = createContext();

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

// Global State Provider
export const GlobalStateProvider = ({ children }) => {
  // Handle Clerk availability gracefully
  let user = null;
  let isLoaded = true;
  
  try {
    const clerkData = useUser();
    user = clerkData.user || null;
    isLoaded = clerkData.isLoaded !== false;
  } catch (error) {
    console.warn('Clerk not available in GlobalStateProvider, using fallback:', error.message);
    user = null;
    isLoaded = true;
  }
  
  // Global state for all data
  const [globalState, setGlobalState] = useState({
    matches: [],
    bets: [],
    bettingPools: {},
    userBalance: 100,
    notifications: [],
    loading: {
      matches: false,
      bets: false,
      balance: false
    },
    lastSync: null,
    syncStatus: 'disconnected'
  });

  // Update specific part of global state
  const updateGlobalState = useCallback((updates) => {
    setGlobalState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save to global storage for cross-tab sync
      if (typeof window !== 'undefined') {
        globalStorage.set('global_state', newState);
      }
      
      return newState;
    });
  }, []);

  // Load matches from database and localStorage
  const loadMatches = useCallback(() => {
    updateGlobalState({ loading: { ...globalState.loading, matches: true } });
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🌍 Loading matches from global database and localStorage...');
        
        // Load from database with betting pool data
        let dbMatches = [];
        supabase
          .from('matches')
          .select(`
            id,
            wrestler1,
            wrestler2,
            event_name,
            weight_class,
            match_date,
            status,
            created_at,
            wrestler1_pool,
            wrestler2_pool,
            total_pool,
            odds_wrestler1,
            odds_wrestler2
          `)
          .order('created_at', { ascending: false })
          .then(({ data: matches, error }) => {
            if (error) throw error;
        
            // Process matches with betting pool data (same as API)
            dbMatches = (matches || []).map(match => {
              const wrestler1Pool = match.wrestler1_pool || 0;
              const wrestler2Pool = match.wrestler2_pool || 0;
              const totalPool = match.total_pool || (wrestler1Pool + wrestler2Pool);
              
              // Calculate percentages for sentiment bars
              let wrestler1Percentage, wrestler2Percentage;
              
              if (totalPool > 0) {
                const rawWrestler1Percentage = (wrestler1Pool / totalPool) * 100;
                wrestler1Percentage = Math.round(rawWrestler1Percentage);
                wrestler2Percentage = 100 - wrestler1Percentage;
              } else {
                wrestler1Percentage = 50;
                wrestler2Percentage = 50;
              }

              return {
                ...match,
                wrestler1_pool: wrestler1Pool,
                wrestler2_pool: wrestler2Pool,
                total_pool: totalPool,
                wrestler1_percentage: wrestler1Percentage,
                wrestler2_percentage: wrestler2Percentage,
                odds_wrestler1: match.odds_wrestler1 || 1.5,
                odds_wrestler2: match.odds_wrestler2 || 1.5
              };
            });
            
            console.log(`📊 Loaded ${dbMatches.length} matches from database with betting pools`);
            
            // Load from localStorage (admin demo matches)
            let localMatches = [];
            try {
              const stored = globalStorage.get('admin_demo_matches');
              localMatches = Array.isArray(stored) ? stored : [];
              console.log(`📱 Loaded ${localMatches.length} matches from localStorage`);
            } catch (localError) {
              console.log('⚠️ localStorage not available:', localError.message);
            }
            
            // Merge matches (localStorage takes precedence for duplicates)
            const matchMap = new Map();
            
            // Add database matches first
            dbMatches.forEach(match => {
              if (match && match.id) {
                matchMap.set(match.id, match);
              }
            });
            
            // Add/override with localStorage matches
            localMatches.forEach(match => {
              if (match && match.id) {
                matchMap.set(match.id, match);
              }
            });
            
            const allMatches = Array.from(matchMap.values());
            
            // If no matches exist, create a test match for debugging
            if (allMatches.length === 0) {
              console.log('🔧 No matches found, creating test match for debugging');
              const testMatch = {
                id: 'johnsmith-mikejohnson-test-456',
                wrestler1: 'John Smith',
                wrestler2: 'Mike Johnson',
                event_name: 'Test Tournament',
                weight_class: '74KG',
                match_date: '2025-01-15T20:00:00Z',
                status: 'upcoming',
                wrestler1_pool: 0,
                wrestler2_pool: 0,
                total_pool: 0,
                wrestler1_percentage: 50,
                wrestler2_percentage: 50,
                odds_wrestler1: 2.0,
                odds_wrestler2: 2.0,
                created_at: new Date().toISOString()
              };
              allMatches.push(testMatch);
              console.log('✅ Test match created:', testMatch);
            }
            
            updateGlobalState({ 
              matches: allMatches,
              loading: { ...globalState.loading, matches: false },
              lastSync: new Date().toISOString()
            });
            
            console.log(`✅ Loaded ${allMatches.length} total matches globally (${dbMatches.length} from DB, ${localMatches.length} from localStorage)`);
            resolve(allMatches);
          })
          .catch(error => {
            console.error('❌ Error loading matches:', error);
            updateGlobalState({ 
              loading: { ...globalState.loading, matches: false }
            });
            reject(error);
          });
      } catch (error) {
        console.error('❌ Error in loadMatches:', error);
        updateGlobalState({ 
          loading: { ...globalState.loading, matches: false }
        });
        reject(error);
      }
    });
  }, [globalState.loading, updateGlobalState]);

  // Load user bets
  const loadBets = useCallback(() => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping bets load');
      updateGlobalState({ 
        bets: [],
        loading: { ...globalState.loading, bets: false }
      });
      return Promise.resolve([]);
    }
    
    updateGlobalState({ loading: { ...globalState.loading, bets: true } });
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🌍 Loading user bets from global database...');
        
        supabase
          .from('bets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data: bets, error }) => {
            if (error) {
              console.warn('⚠️ Database error loading bets (user may not exist yet):', error.message);
              // Don't reject, just return empty array
              updateGlobalState({ 
                bets: [],
                loading: { ...globalState.loading, bets: false }
              });
              resolve([]);
              return;
            }
            
            updateGlobalState({ 
              bets: bets || [],
              loading: { ...globalState.loading, bets: false }
            });
            
            console.log(`✅ Loaded ${bets?.length || 0} user bets globally`);
            resolve(bets || []);
          })
          .catch(error => {
            console.warn('⚠️ Database connection error loading bets:', error.message);
            updateGlobalState({ 
              bets: [],
              loading: { ...globalState.loading, bets: false }
            });
            resolve([]); // Don't reject, just return empty array
          });
      } catch (error) {
        console.warn('⚠️ Error in loadBets:', error.message);
        updateGlobalState({ 
          bets: [],
          loading: { ...globalState.loading, bets: false }
        });
        resolve([]); // Don't reject, just return empty array
      }
    });
  }, [user?.id, globalState.loading, updateGlobalState]);

  // Load user balance
  const loadBalance = useCallback(() => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping balance load');
      updateGlobalState({ 
        userBalance: 1000, // Default balance
        loading: { ...globalState.loading, balance: false }
      });
      return Promise.resolve(1000);
    }
    
    updateGlobalState({ loading: { ...globalState.loading, balance: true } });
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🌍 Loading user balance from global database...');
        
        supabase
          .from('users')
          .select('wrestlecoin_balance')
          .eq('id', user.id)
          .single()
          .then(({ data: userData, error }) => {
            if (error) {
              console.warn('⚠️ Database error loading balance (user may not exist yet):', error.message);
              // Don't reject, just return default balance
              updateGlobalState({ 
                userBalance: 1000,
                loading: { ...globalState.loading, balance: false }
              });
              resolve(1000);
              return;
            }
            
            updateGlobalState({ 
              userBalance: userData?.wrestlecoin_balance || 1000,
              loading: { ...globalState.loading, balance: false }
            });
            
            console.log(`✅ Loaded user balance: ${userData?.wrestlecoin_balance || 1000} WC`);
            resolve(userData?.wrestlecoin_balance || 1000);
          })
          .catch(error => {
            console.warn('⚠️ Database connection error loading balance:', error.message);
            updateGlobalState({ 
              userBalance: 1000,
              loading: { ...globalState.loading, balance: false }
            });
            resolve(1000); // Don't reject, just return default balance
          });
      } catch (error) {
        console.warn('⚠️ Error in loadBalance:', error.message);
        updateGlobalState({ 
          userBalance: 1000,
          loading: { ...globalState.loading, balance: false }
        });
        resolve(1000); // Don't reject, just return default balance
      }
    });
  }, [user?.id, globalState.loading, updateGlobalState]);

  // Add notification
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      duration,
      timestamp: new Date().toISOString()
    };
    
    updateGlobalState({
      notifications: [...globalState.notifications, notification]
    });
    
    // Auto-remove notification after duration
    setTimeout(() => {
      updateGlobalState({
        notifications: globalState.notifications.filter(n => n.id !== notification.id)
      });
    }, duration);
  }, [globalState.notifications, updateGlobalState]);

  // Remove notification
  const removeNotification = useCallback((id) => {
    updateGlobalState({
      notifications: globalState.notifications.filter(n => n.id !== id)
    });
  }, [globalState.notifications, updateGlobalState]);

  // Update betting pools
  const updateBettingPools = useCallback((matchId, pools) => {
    updateGlobalState({
      bettingPools: {
        ...globalState.bettingPools,
        [matchId]: pools
      }
    });
  }, [globalState.bettingPools, updateGlobalState]);

  // Place bet globally
  const placeBet = useCallback((matchId, wrestlerChoice, amount) => {
    if (!user?.id) {
      addNotification('Please sign in to place bets', 'warning');
      return false;
    }
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🌍 Placing bet globally...');
        
        supabase
          .from('bets')
          .insert([{
            user_id: user.id,
            match_id: matchId,
            wrestler_choice: wrestlerChoice,
            bet_amount: amount,
            status: 'pending'
          }])
          .select()
          .single()
          .then(({ data: bet, error }) => {
            if (error) throw error;
            
            // Update global state
            updateGlobalState({
              bets: [bet, ...globalState.bets]
            });
            
            addNotification(`Bet placed successfully! ${amount} WC on ${wrestlerChoice}`, 'success');
            
            // Reload matches to update pools
            loadMatches()
              .then(() => {
                resolve(true);
              })
              .catch(error => {
                console.error('❌ Error reloading matches:', error);
                resolve(true); // Still resolve as bet was placed successfully
              });
          })
          .catch(error => {
            console.error('❌ Error placing bet:', error);
            addNotification('Failed to place bet', 'error');
            reject(error);
          });
      } catch (error) {
        console.error('❌ Error in placeBet:', error);
        addNotification('Failed to place bet', 'error');
        reject(error);
      }
    });
  }, [user?.id, globalState.bets, addNotification, loadMatches, updateGlobalState]);

  // Update match pools directly (for betting synchronization)
  const updateMatchPools = useCallback((matchId, pools) => {
    console.log('🔄 GlobalStateContext: updateMatchPools called');
    console.log('📊 Parameters:', { matchId, pools });
    console.log('🔍 Current matches count:', globalState.matches.length);
    
    updateGlobalState(prevState => {
      console.log('🔄 Updating global state with new pool data');
      const updatedMatches = prevState.matches.map(match => {
        if (match.id === matchId) {
          console.log('🎯 Found matching match:', match.id);
          const updatedMatch = {
            ...match,
            wrestler1_pool: pools.wrestler1 || match.wrestler1_pool || 0,
            wrestler2_pool: pools.wrestler2 || match.wrestler2_pool || 0,
            total_pool: (pools.wrestler1 || 0) + (pools.wrestler2 || 0) || match.total_pool || 0,
            odds_wrestler1: pools.odds1 || match.odds_wrestler1 || 1.5,
            odds_wrestler2: pools.odds2 || match.odds_wrestler2 || 1.5
          };
          
          // Recalculate percentages
          const totalPool = updatedMatch.total_pool;
          if (totalPool > 0) {
            const wrestler1Percentage = Math.round((updatedMatch.wrestler1_pool / totalPool) * 100);
            updatedMatch.wrestler1_percentage = wrestler1Percentage;
            updatedMatch.wrestler2_percentage = 100 - wrestler1Percentage;
          } else {
            updatedMatch.wrestler1_percentage = 50;
            updatedMatch.wrestler2_percentage = 50;
          }
          
          console.log('✅ Updated match pools:', updatedMatch);
          return updatedMatch;
        }
        return match;
      });
      
      // If no match was found, log all available match IDs for debugging
      const foundMatch = updatedMatches.find(match => match.id === matchId);
      if (!foundMatch) {
        console.log('⚠️ No match found with ID:', matchId);
        console.log('📋 Available match IDs:', prevState.matches.map(m => m.id));
        console.log('📋 Available match names:', prevState.matches.map(m => `${m.wrestler1} vs ${m.wrestler2}`));
      }
      
      console.log('🔄 Global state updated, new matches:', updatedMatches);
      return {
        ...prevState,
        matches: updatedMatches
      };
    });
  }, [updateGlobalState, globalState.matches.length]);

  // Enhanced refresh function for after betting
  const refreshMatchesAfterBet = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Refreshing matches after bet placement...');
        loadMatches()
          .then(() => {
            console.log('✅ Matches refreshed successfully');
            resolve();
          })
          .catch(error => {
            console.error('❌ Error refreshing matches:', error);
            reject(error);
          });
      } catch (error) {
        console.error('❌ Error in refreshMatchesAfterBet:', error);
        reject(error);
      }
    });
  }, [loadMatches]);

  // Initialize global state
  useEffect(() => {
    if (!isLoaded) return;
    
    // Load initial data from global storage
    const savedState = globalStorage.get('global_state');
    if (savedState) {
      console.log('🌍 Loading saved global state...');
      setGlobalState(savedState);
    }
    
    // Load fresh data from database
    loadMatches();
    if (user?.id) {
      loadBets();
      loadBalance();
    }
    
  }, [isLoaded, user?.id]); // Removed function dependencies to prevent constant re-runs

  // Set up real-time subscriptions
  useEffect(() => {
    if (!isLoaded) return;
    
    console.log('🌍 Setting up global real-time subscriptions...');
    
    // Matches subscription
    const matchesSubscription = supabase
      .channel('global-matches')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches'
      }, (payload) => {
        console.log('🌍 Global match update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          updateGlobalState({
            matches: [payload.new, ...globalState.matches]
          });
        } else if (payload.eventType === 'UPDATE') {
          updateGlobalState({
            matches: globalState.matches.map(match => 
              match.id === payload.new.id ? payload.new : match
            )
          });
        } else if (payload.eventType === 'DELETE') {
          updateGlobalState({
            matches: globalState.matches.filter(match => match.id !== payload.old.id)
          });
        }
      })
      .subscribe();

    // Bets subscription (for current user)
    let betsSubscription = null;
    if (user?.id) {
      betsSubscription = supabase
        .channel('global-bets')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bets',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('🌍 Global bet update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            updateGlobalState({
              bets: [payload.new, ...globalState.bets]
            });
          } else if (payload.eventType === 'UPDATE') {
            updateGlobalState({
              bets: globalState.bets.map(bet => 
                bet.id === payload.new.id ? payload.new : bet
              )
            });
          } else if (payload.eventType === 'DELETE') {
            updateGlobalState({
              bets: globalState.bets.filter(bet => bet.id !== payload.old.id)
            });
          }
        })
        .subscribe();
    }

    // Cross-tab synchronization and admin demo matches
    const handleStorageChange = (event) => {
      if (event.key === 'wrestle_bet_global_data_global_state') {
        try {
          const newState = event.newValue ? JSON.parse(event.newValue) : null;
          if (newState) {
            console.log('🌍 Cross-tab sync received:', newState);
            setGlobalState(newState);
          }
        } catch (error) {
          console.error('❌ Error parsing cross-tab sync:', error);
        }
      } else if (event.key === 'wrestle_bet_global_data_admin_demo_matches') {
        console.log('🌍 Admin demo matches changed in localStorage, reloading...');
        loadMatches();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    // Listen for admin events
    const handleAdminMatchDeleted = (event) => {
      console.log('🌍 Admin match deleted event received globally');
      const { matchId } = event.detail;
      updateGlobalState({
        matches: globalState.matches.filter(match => match.id !== matchId)
      });
    };

    const handleAdminMatchCreated = () => {
      console.log('🌍 Admin match created event received globally');
      loadMatches();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('admin-match-deleted', handleAdminMatchDeleted);
      window.addEventListener('admin-match-created', handleAdminMatchCreated);
    }

    return () => {
      matchesSubscription.unsubscribe();
      if (betsSubscription) betsSubscription.unsubscribe();
      
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('admin-match-deleted', handleAdminMatchDeleted);
        window.removeEventListener('admin-match-created', handleAdminMatchCreated);
      }
    };
  }, [isLoaded, user?.id, globalState.matches, globalState.bets, loadMatches, updateGlobalState]);

  // Global state context value
  const contextValue = {
    // State
    ...globalState,
    
    // Actions
    updateGlobalState,
    loadMatches,
    loadBets,
    loadBalance,
    addNotification,
    removeNotification,
    updateBettingPools,
    placeBet,
    refreshMatchesAfterBet,
    updateMatchPools,
    
    // Utilities
    isLoaded,
    user
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;

