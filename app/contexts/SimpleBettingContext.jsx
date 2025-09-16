"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import globalDataSync from '../lib/globalDataSync';
import globalStorage from '../lib/globalStorage';
import { safeFetch } from '../lib/safeFetch';
import { useCurrency } from './CurrencyContext';
import { useGlobalState } from './GlobalStateContext';

const BettingContext = createContext();

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

export const BettingProvider = ({ children }) => {
  // Handle Clerk availability gracefully
  let user = null;
  
  try {
    const clerkData = useUser();
    user = clerkData.user || null;
  } catch (error) {
    console.warn('Clerk not available in BettingProvider, using fallback:', error.message);
    user = null;
  }
  const { subtractFromBalance, canAffordBet, balance } = useCurrency();
  const { refreshMatchesAfterBet, updateMatchPools } = useGlobalState();
  const [pollData, setPollData] = useState({});
  const [selectedVotes, setSelectedVotes] = useState({});
  const [bettingPools, setBettingPools] = useState({});
  const [odds, setOdds] = useState({});
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bettingStats, setBettingStats] = useState({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    pendingBets: 0,
    totalWinnings: 0,
    totalSpent: 0,
    netProfit: 0,
    winRate: 0
  });

  const getFallbackData = () => {
    // Use global data sync system
    const globalData = globalDataSync.getData('matches');
    return globalData || {};
  };

  // ADD THIS FUNCTION HERE (after getFallbackData)
  const getBalanceStatus = (userId = 'default') => {
    const balanceData = globalStorage.get('user_balance');
    if (balanceData && balanceData[userId]) {
      return balanceData[userId];
    }
    return {
      balance: 1000,
      lastUpdated: Date.now()
    };
  };

  // Enhanced function to sync balance across tabs
  const updateBalance = (userId, newBalance, description = '') => {
    const balanceData = globalStorage.get('user_balance') || {};
    balanceData[userId] = {
      balance: newBalance,
      lastUpdated: Date.now(),
      lastTransaction: description
    };
    globalStorage.set('user_balance', balanceData);
    
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event('balance-updated'));
  };

  // Function to get user IP for anonymous betting
  const getUserIP = () => {
    return fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => data.ip)
      .catch(() => 'unknown');
  };

  const calculatePercentages = (wrestler1Votes, wrestler2Votes) => {
    const total = wrestler1Votes + wrestler2Votes;
    if (total === 0) return { wrestler1: 50, wrestler2: 50 };
    
    const wrestler1Percent = Math.round((wrestler1Votes / total) * 100);
    const wrestler2Percent = 100 - wrestler1Percent;
    
    return {
      wrestler1: wrestler1Percent,
      wrestler2: wrestler2Percent
    };
  };

  const loadPollData = () => {
    setLoading(true);
    setError(null);
    console.log('🌍 Loading global poll data from database...');
    
    return safeFetch('/api/matches?status=all&limit=20')
      .then(result => {
        if (result.success) {
          const data = result.data;
          console.log('📥 Global database response:', data);
          
          if (data.success && data.matches && Array.isArray(data.matches)) {
            let newPollData = {};
            
            data.matches.forEach(match => {
              // Generate dynamic match key from wrestler names
              const wrestler1 = match.wrestler1?.toLowerCase().replace(/\s+/g, '') || 'wrestler1';
              const wrestler2 = match.wrestler2?.toLowerCase().replace(/\s+/g, '') || 'wrestler2';
              const matchKey = `${wrestler1}-${wrestler2}`;
              
              const voteCounts = match.voteCounts || {};
              const wrestler1Key = wrestler1.split(' ')[0];
              const wrestler2Key = wrestler2.split(' ')[0];
              
              newPollData[matchKey] = {
                ...voteCounts,
                [wrestler1Key]: voteCounts[match.wrestler1] || 0,
                [wrestler2Key]: voteCounts[match.wrestler2] || 0,
                totalVotes: match.totalVotes || 0,
                matchId: match.id,
                wrestler1: match.wrestler1,
                wrestler2: match.wrestler2
              };
            });

            // Only use real database matches - no demo data
            
            console.log('✅ Loaded global poll data:', newPollData);
            setPollData(newPollData);
            
            // Store in global sync system for consistency
            globalDataSync.updateData('matches', newPollData);
            
            // Load actual betting pools from database instead of initializing with zeros
            setBettingPools(prev => {
              const updated = { ...prev };
              data.matches.forEach(match => {
                const wrestler1 = match.wrestler1?.toLowerCase().replace(/\s+/g, '') || 'wrestler1';
                const wrestler2 = match.wrestler2?.toLowerCase().replace(/\s+/g, '') || 'wrestler2';
                const matchKey = `${wrestler1}-${wrestler2}`;
                
                if (match.id && newPollData[matchKey]) {
                  // Use database pool values directly
                  updated[matchKey] = { 
                    wrestler1: parseFloat(match.wrestler1_pool || 0), 
                    wrestler2: parseFloat(match.wrestler2_pool || 0) 
                  };
                  console.log(`💰 Loaded REAL betting pools for ${matchKey}:`, updated[matchKey]);
                  console.log(`📊 Match ${matchKey} has total pool: ${match.total_pool || 0} WC`);
                }
              });
              return updated;
            });
            
            calculateOdds(newPollData, {
              ...bettingPools,
            });
          } else {
            // No fallback data - only use real database
            console.log('⚠️ Database unavailable, no matches to display');
            setPollData({});
            setError('Unable to load matches from database');
          }
        } else {
          // No fallback data - only use real database
          console.log('⚠️ Database unavailable, no matches to display');
          setPollData({});
          setError('Unable to load matches from database');
        }
      })
      .catch(error => {
        console.error('🚨 Error loading poll data:', error);
        setError(error.message);
        // No fallback data - only real database
        setPollData({});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Enhanced refresh function for after betting
  const refreshBettingData = () => {
    console.log('🔄 Refreshing betting data after bet placement...');
    
    return safeFetch('/api/matches?status=all&limit=20')
      .then(result => {
        if (result.success && result.data.success && result.data.matches) {
          const matches = result.data.matches;
          console.log('📥 Fresh match data loaded:', matches);
          
          // Update betting pools with fresh database values
          setBettingPools(prev => {
            const updated = { ...prev };
            matches.forEach(match => {
              const wrestler1 = match.wrestler1?.toLowerCase().replace(/\s+/g, '') || 'wrestler1';
              const wrestler2 = match.wrestler2?.toLowerCase().replace(/\s+/g, '') || 'wrestler2';
              const matchKey = `${wrestler1}-${wrestler2}`;
              
              if (match.id) {
                const newPools = { 
                  wrestler1: parseFloat(match.wrestler1_pool || 0), 
                  wrestler2: parseFloat(match.wrestler2_pool || 0) 
                };
                updated[matchKey] = newPools;
                console.log(`💰 Updated betting pools for ${matchKey}:`, newPools);
                console.log(`📊 Total pool: ${match.total_pool || 0} WC`);
              }
            });
            return updated;
          });
          
          // Update odds with fresh data
          setOdds(prev => {
            const updated = { ...prev };
            matches.forEach(match => {
              const wrestler1 = match.wrestler1?.toLowerCase().replace(/\s+/g, '') || 'wrestler1';
              const wrestler2 = match.wrestler2?.toLowerCase().replace(/\s+/g, '') || 'wrestler2';
              const matchKey = `${wrestler1}-${wrestler2}`;
              
              if (match.id) {
                const newOdds = {
                  wrestler1: parseFloat(match.odds_wrestler1 || 1.0),
                  wrestler2: parseFloat(match.odds_wrestler2 || 1.0)
                };
                updated[matchKey] = newOdds;
                console.log(`🎲 Updated odds for ${matchKey}:`, newOdds);
              }
            });
            return updated;
          });
          
          console.log('✅ Betting data refreshed successfully');
        }
      })
      .catch(error => {
        console.error('❌ Error refreshing betting data:', error);
      });
  };

  const calculateOdds = (data, currentBettingPools = null) => {
    const newOdds = {};
    const pools = currentBettingPools || bettingPools;
    
    console.log('🔢 Calculating odds with betting pools:', pools);
    
    Object.keys(data).forEach(matchKey => {
      const matchData = data[matchKey];
      const pool = pools[matchKey];
      
      if (pool && (pool.wrestler1 > 0 || pool.wrestler2 > 0)) {
        const totalPool = pool.wrestler1 + pool.wrestler2;
        const wrestler1Odds = totalPool > 0 ? Math.max(1.1, (totalPool / pool.wrestler1)) : 2.0;
        const wrestler2Odds = totalPool > 0 ? Math.max(1.1, (totalPool / pool.wrestler2)) : 2.0;
        
        newOdds[matchKey] = {
          wrestler1: parseFloat(wrestler1Odds.toFixed(2)),
          wrestler2: parseFloat(wrestler2Odds.toFixed(2))
        };
        
        console.log(`🎲 Calculated odds for ${matchKey}:`, newOdds[matchKey]);
      } else {
        // Default odds when no betting pool exists
        newOdds[matchKey] = {
          wrestler1: 2.0,
          wrestler2: 2.0
        };
      }
    });
    
    console.log('🎯 Final calculated odds:', newOdds);
    setOdds(newOdds);
  };

  const updateBettingStats = (currentBets) => {
    const totalBets = currentBets.length;
    const wonBets = currentBets.filter(bet => bet.status === 'won').length;
    const lostBets = currentBets.filter(bet => bet.status === 'lost').length;
    const pendingBets = currentBets.filter(bet => bet.status === 'pending').length;
    
    const totalWinnings = currentBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + (bet.payout || 0), 0);
    
    const totalSpent = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    const netProfit = totalWinnings - totalSpent;
    const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

    setBettingStats({
      totalBets,
      wonBets,
      lostBets,
      pendingBets,
      totalWinnings,
      totalSpent,
      netProfit,
      winRate
    });
  };

  const handleVote = (matchId, wrestler) => {
    return new Promise((resolve, reject) => {
      try {
        setLoading(true);
        
        // Get match data from pollData using matchId
        let matchData = null;
        for (const key in pollData) {
          if (pollData[key].matchId === matchId) {
            matchData = pollData[key];
            break;
          }
        }
        
        if (!matchData) {
          reject(new Error('Match data not found'));
          return;
        }
        
        // Find the actual wrestler name for database submission
        let actualWrestlerName = wrestler;
        if (wrestler === 'wrestler1') {
          actualWrestlerName = matchData.wrestler1;
        } else if (wrestler === 'wrestler2') {
          actualWrestlerName = matchData.wrestler2;
        }
        
        console.log(`🗳️ Voting for ${actualWrestlerName} in match ${matchId}`);
        
        // Update local state immediately for instant feedback
        setPollData(prev => {
          const updated = { ...prev };
          const key = Object.keys(updated).find(k => updated[k].matchId === matchId);
          
          if (key && updated[key]) {
            const currentData = updated[key];
            const wrestlerKey = actualWrestlerName.toLowerCase().split(' ')[0];
            
            updated[key] = {
              ...currentData,
              [wrestlerKey]: (currentData[wrestlerKey] || 0) + 1,
              totalVotes: (currentData.totalVotes || 0) + 1
            };
          }
          
          return updated;
        });
        
        // For betting system integration
        if (user?.id) {
          getUserIP()
            .then(userIp => {
              return safeFetch('/api/bets', {
                method: 'POST',
                body: JSON.stringify({ 
                  userId: user.id,
                  matchId: matchData?.matchId,
                  wrestlerChoice: actualWrestlerName,
                  betAmount: 10,
                  odds: 1.5,
                  userIp 
                }),
              });
            })
            .then(sentimentBetResult => {
              if (sentimentBetResult.success) {
                console.log('✅ Sentiment bet placed:', sentimentBetResult.data);
              }
              resolve();
            })
            .catch(error => {
              console.log('⚠️ Sentiment bet failed, continuing with vote:', error);
              resolve();
            });
        }
        
        // Sync with global database
        getUserIP()
          .then(userIp => {
            return safeFetch('/api/votes', {
              method: 'POST',
              body: JSON.stringify({ 
                matchId: matchData?.matchId,
                wrestlerChoice: actualWrestlerName,
                userIp 
              }),
            });
          })
          .then(result => {
            if (result.success) {
              const data = result.data;
              console.log('✅ Global database sync successful:', data);
              
              // Update with actual database counts
              if (data.success && data.votes) {
                setPollData(prev => ({
                  ...prev,
                  [matchId]: {
                    ...prev[matchId],
                    taylor: data.votes['David Taylor'] || 0,
                    yazdani: data.votes['Hassan Yazdani'] || 0,
                    dake: data.votes['Kyle Dake'] || 0,
                    punia: data.votes['Bajrang Punia'] || 0,
                    steveson: data.votes['Gable Steveson'] || 0,
                    petriashvili: data.votes['Geno Petriashvili'] || 0,
                    totalVotes: data.totalVotes
                  }
                }));
              }
            }
            resolve();
          })
          .catch(error => {
            console.error('⚠️ Database sync failed, using local state:', error);
            resolve();
          });
      } catch (error) {
        console.error('Error handling vote:', error);
        setError(error.message);
        reject(error);
      } finally {
        setLoading(false);
      }
    });
  };

  const placeBetFromVote = (matchId, wrestler, betAmount, odds) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(`💰 Placing global bet: ${betAmount} WC on ${wrestler} in ${matchId}`);
        console.log(`🔍 Function parameters:`, { matchId, wrestler, betAmount, odds });
        console.log(`🔍 Current bets:`, bets);
        console.log(`🔍 Current balance:`, balance);
        console.log(`🔍 Can afford bet:`, canAffordBet(betAmount));
        
        // Check for existing bet on this match before proceeding
        const existingBet = bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
        if (existingBet) {
          console.log('❌ Existing bet found:', existingBet);
          reject(new Error('You have already placed a bet on this match. Each user can only bet once per match.'));
          return;
        }

        // 💰 CHECK WRESTLECOIN BALANCE BEFORE PLACING BET
        if (!canAffordBet(betAmount)) {
          console.log('❌ Cannot afford bet:', { betAmount, balance, canAfford: canAffordBet(betAmount) });
          reject(new Error(`Insufficient WrestleCoin balance. You need ${betAmount} WC to place this bet.`));
          return;
        }
        
        // Get match data for better bet display
        // Find match data by matchId since pollData uses different keys
        let matchData = null;
        for (const key in pollData) {
          if (pollData[key].matchId === matchId) {
            matchData = pollData[key];
            break;
          }
        }
        
        const displayWrestler = wrestler === 'wrestler1' ? matchData?.wrestler1 || 'Wrestler 1' : 
                               wrestler === 'wrestler2' ? matchData?.wrestler2 || 'Wrestler 2' : 
                               wrestler;
        const matchDisplay = matchData ? `${matchData.wrestler1} vs ${matchData.wrestler2}` : 'Unknown Match';
        
        const newBet = {
          id: Date.now().toString(),
          matchId,
          wrestler, // Keep backend format for API calls
          displayWrestler, // User-friendly name for display
          match: matchDisplay, // User-friendly match name
          event: 'Wrestling Championship', // Event name
          amount: betAmount,
          odds,
          status: 'pending',
          timestamp: new Date().toISOString()
        };
        
        // Update local bets immediately for instant feedback
        setBets(prevBets => {
          const updatedBets = [...prevBets, newBet];
          updateBettingStats(updatedBets);
          
          // Sync to localStorage for cross-tab sync
          try {
            localStorage.setItem('wrestlebet_bets', JSON.stringify(updatedBets));
          } catch (error) {
            console.error('Failed to sync bets to localStorage:', error);
          }
          
          return updatedBets;
        });

        // 💰 DEDUCT WRESTLECOINS FROM USER BALANCE
        console.log(`💰 Deducting ${betAmount} WC from user balance for bet`);
        try {
          subtractFromBalance(betAmount, `Bet on ${displayWrestler} in ${matchDisplay}`);
          console.log('✅ WrestleCoins deducted successfully');
        } catch (currencyError) {
          console.error('❌ Failed to deduct WrestleCoins:', currencyError);
          // Remove the bet if currency deduction failed
          setBets(prevBets => prevBets.filter(bet => bet.id !== newBet.id));
          reject(new Error(`Insufficient WrestleCoin balance. You need ${betAmount} WC to place this bet.`));
          return;
        }
        
        // Sync bet with global database
        // For dynamic matches, matchId is already the database match ID
        const actualMatchId = matchId;
        
        // Determine wrestler position for API (wrestler1 or wrestler2)
        let wrestlerPosition = null; // No default - must be explicitly determined
        
        console.log(`🔍 WRESTLER POSITION DEBUG:`, {
          wrestler: wrestler,
          isDirectPosition: wrestler === 'wrestler1' || wrestler === 'wrestler2'
        });
        
        // If wrestler is already 'wrestler1' or 'wrestler2', use it directly
        if (wrestler === 'wrestler1' || wrestler === 'wrestler2') {
          wrestlerPosition = wrestler;
          console.log(`✅ Direct position match: ${wrestler}`);
        } else {
          // Fallback to name matching for backwards compatibility
          const matchData = pollData[matchId];
          
          if (matchData) {
            const wrestler1Name = matchData.wrestler1?.toLowerCase().trim();
            const wrestler2Name = matchData.wrestler2?.toLowerCase().trim();
            const betWrestler = wrestler.toLowerCase().trim();
            
            console.log(`🔍 NAME MATCHING:`, {
              wrestler1Name,
              wrestler2Name,
              betWrestler,
              match1: betWrestler === wrestler1Name,
              match2: betWrestler === wrestler2Name
            });
            
            if (betWrestler === wrestler1Name) {
              wrestlerPosition = 'wrestler1';
              console.log(`✅ Matched wrestler1: ${betWrestler} = ${wrestler1Name}`);
            } else if (betWrestler === wrestler2Name) {
              wrestlerPosition = 'wrestler2';
              console.log(`✅ Matched wrestler2: ${betWrestler} = ${wrestler2Name}`);
            } else {
              // Try partial matching for common cases
              if (wrestler1Name && wrestler1Name.includes(betWrestler)) {
                wrestlerPosition = 'wrestler1';
                console.log(`✅ Partial match wrestler1: ${betWrestler} in ${wrestler1Name}`);
              } else if (wrestler2Name && wrestler2Name.includes(betWrestler)) {
                wrestlerPosition = 'wrestler2';
                console.log(`✅ Partial match wrestler2: ${betWrestler} in ${wrestler2Name}`);
              } else {
                console.error(`❌ WRESTLER IDENTIFICATION FAILED: Cannot determine position for "${wrestler}"`);
                console.error(`❌ Available wrestlers: "${wrestler1Name}" vs "${wrestler2Name}"`);
                reject(new Error(`Cannot identify wrestler "${wrestler}". Please use exact wrestler names or wrestler1/wrestler2.`));
                return;
              }
            }
          } else {
            console.error(`❌ MATCH DATA MISSING: Cannot place bet without match data for matchId: ${matchId}`);
            reject(new Error(`Match data not available. Please refresh the page and try again.`));
            return;
          }
        }
        
        // Final validation - ensure wrestler position was properly determined
        if (!wrestlerPosition || !['wrestler1', 'wrestler2'].includes(wrestlerPosition)) {
          console.error(`❌ FINAL VALIDATION FAILED: Invalid wrestlerPosition "${wrestlerPosition}"`);
          reject(new Error(`Cannot place bet: wrestler position not properly determined. Got: ${wrestlerPosition}`));
          return;
        }
        
        console.log(`🔄 Syncing bet to database: ${actualMatchId}, ${wrestlerPosition}, ${betAmount} WC`);
        
        safeFetch('/api/bets', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id || 'anonymous-user', // Use actual Clerk user ID
            matchId: actualMatchId, // Use the actual database match ID
            wrestlerChoice: wrestlerPosition, // Use wrestler1/wrestler2 position
            betAmount: betAmount,
            odds: odds
          }),
        })
        .then(result => {
          if (result.success) {
            const data = result.data;
            console.log('✅ Bet synced to global database:', data);
            console.log('📊 New odds from database:', data.newOdds);
            console.log('💰 New totals from database:', data.wrestlerTotals);
            
            // Update GlobalStateContext directly with new pool data
            if (data.wrestlerTotals && data.newOdds) {
              console.log('🔄 Updating GlobalStateContext with new pool data');
              console.log('📊 Data received:', { wrestlerTotals: data.wrestlerTotals, newOdds: data.newOdds });
              console.log('🎯 Match ID:', matchId);
              
              updateMatchPools(matchId, {
                wrestler1: data.wrestlerTotals.wrestler1 || 0,
                wrestler2: data.wrestlerTotals.wrestler2 || 0,
                odds1: data.newOdds.wrestler1 || 1.5,
                odds2: data.newOdds.wrestler2 || 1.5
              });
              
              console.log('✅ updateMatchPools called successfully');
            } else {
              console.log('⚠️ Missing pool data in API response:', { wrestlerTotals: data.wrestlerTotals, newOdds: data.newOdds });
            }
            
            // Also refresh betting pools for consistency (don't await to avoid blocking)
            refreshBettingData().catch(error => {
              console.error('❌ Error refreshing betting data:', error);
            });
            
            console.log('✅ Bet placement completed successfully, returning:', newBet);
            resolve(newBet);
          } else {
            // Handle specific error cases
            if (result.status === 409) {
              // Duplicate bet error - remove the locally added bet and show error
              console.log('⚠️ Duplicate bet detected, removing local bet');
              setBets(prevBets => prevBets.filter(bet => bet.id !== newBet.id));
              reject(new Error('You have already placed a bet on this match. Each user can only bet once per match.'));
            } else {
              console.log('⚠️ Database bet sync failed, maintaining local state');
              // Keep local changes but also backup to localStorage
              localStorage.setItem('wrestlebet_bets', JSON.stringify([...bets, newBet]));
              console.log('✅ Bet placement completed successfully, returning:', newBet);
              resolve(newBet);
            }
          }
        })
        .catch(error => {
          console.error('Database bet sync error:', error);
          // Fallback to localStorage
          localStorage.setItem('wrestlebet_bets', JSON.stringify([...bets, newBet]));
          console.log('✅ Bet placement completed successfully, returning:', newBet);
          resolve(newBet);
        });
      } catch (error) {
        console.error('❌ Error placing bet from vote:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          matchId,
          wrestler,
          betAmount,
          odds
        });
        setError(error.message);
        reject(error);
      }
    });
  };

  // Helper function to sync betting pools to Supabase database
  const syncBettingPoolsToSupabase = (pools) => {
    return new Promise((resolve, reject) => {
      try {
        // This will be implemented when we have a proper betting pools table
        // For now, we'll store in localStorage as backup
        localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(pools));
        console.log('✅ Betting pools stored locally (Supabase integration pending)');
        resolve();
      } catch (error) {
        console.error('Betting pools sync error:', error);
        localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(pools));
        reject(error);
      }
    });
  };

  // Auto-load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = () => {
      console.log('🚀 Loading initial betting data...');
      
      // Load poll data first
      loadPollData()
        .then(() => {
          if (!isMounted) return;
          console.log('✅ Poll data loaded');
          
          // Load user's bets
          const userId = user?.id;
          const betsUrl = userId ? `/api/bets?userId=${encodeURIComponent(userId)}` : '/api/bets';
          
          return safeFetch(betsUrl);
        })
        .then(betsResult => {
          if (betsResult && betsResult.success && isMounted) {
            const betsData = betsResult.data;
            if (betsData.success && betsData.bets) {
              setBets(betsData.bets);
              updateBettingStats(betsData.bets);
              console.log('📥 Loaded bets from global database:', betsData.bets.length);
              return; // Success, no need for localStorage fallback
            }
          }
          
          // Fallback to localStorage for bets
          if (isMounted) {
            const storedBets = localStorage.getItem('wrestlebet_bets');
            if (storedBets) {
              const parsedBets = JSON.parse(storedBets);
              setBets(parsedBets);
              updateBettingStats(parsedBets);
              console.log('📦 Loaded bets from localStorage:', parsedBets.length);
            }
          }
        })
        .catch(error => {
          console.log('⚠️ Global bets not available:', error);
          
          // Fallback to localStorage for bets
          if (isMounted) {
            const storedBets = localStorage.getItem('wrestlebet_bets');
            if (storedBets) {
              const parsedBets = JSON.parse(storedBets);
              setBets(parsedBets);
              updateBettingStats(parsedBets);
              console.log('📦 Loaded bets from localStorage:', parsedBets.length);
            }
          }
        });
    };
    
    loadInitialData();

    // Start global data sync - DISABLED to prevent constant API calls
    // globalDataSync.startAutoSync();

    // Periodically refresh poll data to sync with admin updates
    const intervalId = setInterval(() => {
      if (isMounted) {
        loadPollData();
      }
    }, 300000); // every 5 minutes - further reduced to prevent constant API calls

    // Listen for admin-created matches to refresh immediately
    const onAdminCreated = () => {
      if (isMounted) {
        console.log('🔄 Admin created new match, refreshing...');
        loadPollData();
      }
    };

    window.addEventListener('admin-match-created', onAdminCreated);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('admin-match-created', onAdminCreated);
    };
  }, [user?.id]);

  const contextValue = {
    // State
    pollData,
    selectedVotes,
    bettingPools,
    odds,
    bets,
    loading,
    error,
    bettingStats,
    
    // Actions
    setSelectedVotes,
    handleVote,
    placeBetFromVote,
    loadPollData,
    refreshBettingData,
    
    // Utilities
    calculatePercentages,
    getBalanceStatus,
    updateBalance
  };

  return (
    <BettingContext.Provider value={contextValue}>
      {children}
    </BettingContext.Provider>
  );
};