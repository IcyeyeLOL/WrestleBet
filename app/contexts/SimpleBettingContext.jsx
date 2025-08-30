"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import globalDataSync from '../lib/globalDataSync';
import globalStorage from '../lib/globalStorage';
import { safeFetch, isDemoMode, getDemoFallback } from '../lib/safeFetch';

const BettingContext = createContext();

export const useBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

export const BettingProvider = ({ children }) => {
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
    // Calculate balance dynamically based on current bets
    const userBets = bets.filter(bet => bet.userId === userId || !bet.userId);
    const totalSpent = userBets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    const totalWinnings = userBets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + ((bet.amount || 0) * (bet.odds || 1)), 0);
    
    // Starting balance calculation (you can modify this logic)
    const startingBalance = 1000; // Default starting balance
    const currentBalance = startingBalance - totalSpent + totalWinnings;
    
    return {
      balance: Math.max(0, currentBalance),
      totalSpent,
      totalWinnings,
      netProfit: totalWinnings - totalSpent,
      status: currentBalance > 0 ? 'positive' : 'negative'
    };
  };

  // Real-time dynamic odds calculation system
  const calculateDynamicOdds = (matchId, pools, matchDataOverride = null) => {
    if (!pools || !pools[matchId]) return {};
    
    const matchPools = pools[matchId];
    const totalPoolWC = matchPools.wrestler1 + matchPools.wrestler2;
    
    if (totalPoolWC === 0) return {};
    
    // Calculate dynamic odds based on pool distribution
    const wrestler1Odds = matchPools.wrestler1 > 0 
      ? Math.max(1.10, (totalPoolWC / matchPools.wrestler1)).toFixed(2) 
      : '10.00';
    const wrestler2Odds = matchPools.wrestler2 > 0 
      ? Math.max(1.10, (totalPoolWC / matchPools.wrestler2)).toFixed(2) 
      : '10.00';
    
    // Get match data for wrestler names - use override if provided, otherwise use pollData
    const matchData = matchDataOverride || pollData[matchId];
    if (!matchData) {
      console.log(`⚠️ No match data for ${matchId}, using generic keys`);
      return {
        'wrestler1': wrestler1Odds,
        'wrestler2': wrestler2Odds
      };
    }
    
    // Use position-based keys to avoid conflicts when wrestlers have same name
    const wrestler1Key = 'wrestler1';
    const wrestler2Key = 'wrestler2';
    
    console.log(`📊 Calculated odds for ${matchId}:`, {
      wrestler1: wrestler1Key,
      wrestler2: wrestler2Key,
      odds1: wrestler1Odds,
      odds2: wrestler2Odds,
      pools: matchPools
    });
    
    return {
      [wrestler1Key]: wrestler1Odds,
      [wrestler2Key]: wrestler2Odds
    };
  };

  // Real-time percentage calculation
  const calculateDynamicPercentages = (matchId, pools) => {
    if (!pools || !pools[matchId]) return { wrestler1: 50, wrestler2: 50 };
    
    const matchPools = pools[matchId];
    const totalWC = matchPools.wrestler1 + matchPools.wrestler2;
    
    if (totalWC === 0) return { wrestler1: 50, wrestler2: 50 };
    
    const wrestler1Percent = Math.round((matchPools.wrestler1 / totalWC) * 100);
    const wrestler2Percent = Math.round((matchPools.wrestler2 / totalWC) * 100);
    
    return {
      wrestler1: wrestler1Percent,
      wrestler2: wrestler2Percent
    };
  };

  const loadPollData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🌍 Loading global poll data from database...');
      
      // Try to load from global database first with safe fetch
      const result = await safeFetch('/api/votes');
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

          // Merge locally created admin demo matches so front page reflects admin control in demo/offline mode
          try {
            const storedAdmin = localStorage.getItem('admin_demo_matches');
            if (storedAdmin) {
              const adminMatches = JSON.parse(storedAdmin);
              if (Array.isArray(adminMatches)) {
                adminMatches.forEach(m => {
                  const wrestler1 = m.wrestler1?.toLowerCase().replace(/\s+/g, '') || 'wrestler1';
                  const wrestler2 = m.wrestler2?.toLowerCase().replace(/\s+/g, '') || 'wrestler2';
                  const key = m.id || `${wrestler1}-${wrestler2}`;
                  
                  if (!newPollData[key]) {
                    const wrestler1Key = wrestler1.split(' ')[0];
                    const wrestler2Key = wrestler2.split(' ')[0];
                    
                    newPollData[key] = {
                      [wrestler1Key]: 0,
                      [wrestler2Key]: 0,
                      totalVotes: 0,
                      wrestler1: m.wrestler1,
                      wrestler2: m.wrestler2,
                      matchId: m.id
                    };
                  }
                });
              }
            }
          } catch {}
          
          console.log('✅ Loaded global poll data:', newPollData);
          setPollData(newPollData);
          
          // Store in global sync system for consistency
          globalDataSync.updateData('matches', newPollData);
          
          // Ensure pools exist for any newly merged matches
          setBettingPools(prev => {
            const updated = { ...prev };
            Object.keys(newPollData).forEach((k, index) => {
              if (!updated[k]) {
                // Initialize new matches with equal 50-50 pools
                updated[k] = { 
                  wrestler1: 100, 
                  wrestler2: 100 
                };
                console.log(`🎯 Initialized NEW MATCH pools for ${k} at 50-50:`, updated[k]);
              }
            });
            return updated;
          });
          calculateOdds(newPollData, {
            ...bettingPools,
          });
          return;
        }
      }
      
      // Fallback to local data if database fails
      console.log('⚠️ Database unavailable, using fallback data');
      let data = getFallbackData();
      setPollData(data);
      calculateOdds(data, bettingPools);
      
    } catch (error) {
      console.error('🚨 Error loading poll data:', error);
      setError(error.message);
      // Use fallback data
      setPollData(getFallbackData());
      calculateOdds(getFallbackData(), bettingPools);
    } finally {
      setLoading(false);
    }
  };

  const calculateOdds = (data, currentBettingPools = null) => {
    const newOdds = {};
    const pools = currentBettingPools || bettingPools;
    
    console.log('🔢 Calculating odds with betting pools:', pools);
    
    Object.keys(data).forEach(matchKey => {
      const matchData = data[matchKey];
      newOdds[matchKey] = {};
      
      // If there are betting pools, use WC-based odds (preferred method)
      if (pools && pools[matchKey] && (pools[matchKey].wrestler1 > 0 || pools[matchKey].wrestler2 > 0)) {
        const totalWC = pools[matchKey].wrestler1 + pools[matchKey].wrestler2;
        console.log(`💰 Using WC-based odds for ${matchKey}, total WC: ${totalWC}`);
        // Generic mapping for any match using first token keys
        const key1 = (matchData.wrestler1 || 'w1').toLowerCase().split(' ')[0];
        const key2 = (matchData.wrestler2 || 'w2').toLowerCase().split(' ')[0];
        const w1WC = pools[matchKey].wrestler1;
        const w2WC = pools[matchKey].wrestler2;
        // When there's 0 WC in the pool, both wrestlers get the same odds (2.00)
        if (totalWC === 0) {
          newOdds[matchKey][key1] = '2.00';
          newOdds[matchKey][key2] = '2.00';
        } else {
          newOdds[matchKey][key1] = w1WC > 0 ? Math.max(1.10, (totalWC / w1WC)).toFixed(2) : '2.00';
          newOdds[matchKey][key2] = w2WC > 0 ? Math.max(1.10, (totalWC / w2WC)).toFixed(2) : '2.00';
        }
        
        console.log(`✅ WC-based odds for ${matchKey}:`, newOdds[matchKey]);
      } else {
        console.log(`📊 Using vote-based odds for ${matchKey} (no betting pools)`);
        // Fallback to vote-based odds if no betting pools
        Object.keys(matchData).forEach(wrestler => {
          if (wrestler !== 'totalVotes' && wrestler !== 'matchId' && wrestler !== 'wrestler1' && wrestler !== 'wrestler2') {
            const votes = matchData[wrestler] || 0;
            const totalVotes = matchData.totalVotes || 0;
            
            if (totalVotes > 0 && votes > 0) {
              // Standard odds calculation: total votes / wrestler votes
              const baseOdds = totalVotes / votes;
              // Apply minimum odds and some variation
              newOdds[matchKey][wrestler] = Math.max(1.10, baseOdds).toFixed(2);
            } else {
              // Default odds when no votes
              newOdds[matchKey][wrestler] = '2.00';
            }
          }
        });
      }
    });
    
    console.log('📊 Final calculated odds:', newOdds);
    setOdds(newOdds);
  };

  const handleVote = async (matchId, wrestler) => {
    try {
      setLoading(true);
      console.log(`🗳️ Global voting: ${wrestler} in match ${matchId}`);
      
      // Map UI wrestler keys to actual wrestler names for database
      let actualWrestlerName = wrestler;
      const matchData = pollData[matchId];
      
      if (matchData) {
        if (wrestler === 'taylor') actualWrestlerName = 'David Taylor';
        else if (wrestler === 'yazdani') actualWrestlerName = 'Hassan Yazdani';
        else if (wrestler === 'dake') actualWrestlerName = 'Kyle Dake';
        else if (wrestler === 'punia') actualWrestlerName = 'Bajrang Punia';
        else if (wrestler === 'steveson') actualWrestlerName = 'Gable Steveson';
        else if (wrestler === 'petriashvili') actualWrestlerName = 'Geno Petriashvili';
      }
      
      // Get user IP for voting
      const getUserIP = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          return data.ip;
        } catch (error) {
          return 'unknown';
        }
      };
      
      // Update local state immediately for instant feedback
      const previousVote = selectedVotes[matchId];
      setSelectedVotes(prev => ({
        ...prev,
        [matchId]: prev[matchId] === wrestler ? null : wrestler
      }));
      
      // Update local poll data for immediate UI feedback
      setPollData(prev => {
        const newData = { ...prev };
        const match = newData[matchId];
        
        if (match) {
          const wrestlerKey = wrestler.toLowerCase();
          
          // Handle previous vote removal
          if (previousVote && previousVote !== wrestler) {
            const prevKey = previousVote.toLowerCase();
            match[prevKey] = Math.max(0, (match[prevKey] || 0) - 1);
            match.totalVotes = Math.max(0, match.totalVotes - 1);
          }
          
          // Add new vote or remove if same wrestler
          if (previousVote !== wrestler) {
            match[wrestlerKey] = (match[wrestlerKey] || 0) + 1;
            match.totalVotes = (match.totalVotes || 0) + 1;
          } else {
            match[wrestlerKey] = Math.max(0, (match[wrestlerKey] || 0) - 1);
            match.totalVotes = Math.max(0, match.totalVotes - 1);
          }
          
          // Recalculate odds
          calculateOdds(newData);
        }
        
        return newData;
      });
      
      // Sync with global database
      try {
        const realMatchId = matchData?.matchId;
        if (realMatchId) {
          const userIp = await getUserIP();
          
          const result = await safeFetch('/api/votes', {
            method: 'POST',
            body: JSON.stringify({ 
              matchId: realMatchId,
              wrestlerChoice: actualWrestlerName,
              userIp 
            }),
          });

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
        }
      } catch (error) {
        console.error('⚠️ Database sync failed, using local state:', error);
      }
      
    } catch (error) {
      console.error('Error handling vote:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const placeBetFromVote = async (matchId, wrestler, betAmount, odds) => {
    try {
      console.log(`💰 Placing global bet: ${betAmount} WC on ${wrestler} in ${matchId}`);
      
      const newBet = {
        id: Date.now().toString(),
        matchId,
        wrestler,
        amount: betAmount,
        odds,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      // Update local bets immediately for instant feedback
      setBets(prevBets => {
        const updatedBets = [...prevBets, newBet];
        updateBettingStats(updatedBets);
        return updatedBets;
      });
      
      // Update global betting pools
      setBettingPools(prev => {
        const updatedPools = { ...prev };
        if (!updatedPools[matchId]) {
          updatedPools[matchId] = { wrestler1: 0, wrestler2: 0 };
        }
        
        // Use position-based keys for consistent tracking
        let wrestlerPosition = 'wrestler1';
        
        // Get match data to determine which wrestler is which
        const matchData = pollData[matchId];
        if (matchData) {
          const wrestler1Name = matchData.wrestler1?.toLowerCase().trim();
          const wrestler2Name = matchData.wrestler2?.toLowerCase().trim();
          const betWrestler = wrestler.toLowerCase().trim();
          
          if (betWrestler === wrestler1Name) {
            wrestlerPosition = 'wrestler1';
          } else if (betWrestler === wrestler2Name) {
            wrestlerPosition = 'wrestler2';
          } else {
            // Fallback: use hash-based assignment for consistency
            const hash = betWrestler.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            wrestlerPosition = hash % 2 === 0 ? 'wrestler1' : 'wrestler2';
            console.log(`⚠️ Wrestler name mismatch, using hash assignment: ${betWrestler} -> ${wrestlerPosition}`);
          }
        } else {
          // No match data, use hash-based assignment
          const betWrestler = wrestler.toLowerCase().trim();
          const hash = betWrestler.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
          wrestlerPosition = hash % 2 === 0 ? 'wrestler1' : 'wrestler2';
          console.log(`⚠️ No match data, using hash assignment: ${betWrestler} -> ${wrestlerPosition}`);
        }
        
        // Ensure we're adding a valid number
        const currentAmount = updatedPools[matchId][wrestlerPosition] || 0;
        const newAmount = currentAmount + betAmount;
        
        // Validate the new amount
        if (isNaN(newAmount) || newAmount < 0) {
          console.log(`⚠️ Invalid bet amount calculated: ${newAmount}, using ${currentAmount}`);
          updatedPools[matchId][wrestlerPosition] = currentAmount;
        } else {
          updatedPools[matchId][wrestlerPosition] = newAmount;
        }
        
        console.log(`💰 Updated ${wrestlerPosition} pool: ${currentAmount} + ${betAmount} = ${updatedPools[matchId][wrestlerPosition]}`);
        
        // Recalculate global odds based on new betting pool using position-based keys
        const matchPools = updatedPools[matchId];
        const totalPoolWC = matchPools.wrestler1 + matchPools.wrestler2;
        
        if (totalPoolWC > 0 && !isNaN(totalPoolWC)) {
          // Validate pool amounts before calculating odds
          const wrestler1Amount = matchPools.wrestler1 || 0;
          const wrestler2Amount = matchPools.wrestler2 || 0;
          
          let wrestler1Odds = '10.00';
          let wrestler2Odds = '10.00';
          
          if (wrestler1Amount > 0 && !isNaN(wrestler1Amount)) {
            const calculatedOdds = totalPoolWC / wrestler1Amount;
            wrestler1Odds = isNaN(calculatedOdds) ? '10.00' : Math.max(1.10, calculatedOdds).toFixed(2);
          }
          
          if (wrestler2Amount > 0 && !isNaN(wrestler2Amount)) {
            const calculatedOdds = totalPoolWC / wrestler2Amount;
            wrestler2Odds = isNaN(calculatedOdds) ? '10.00' : Math.max(1.10, calculatedOdds).toFixed(2);
          }
          
          // Use position-based keys for odds
          const newOdds = { 
            'wrestler1': wrestler1Odds, 
            'wrestler2': wrestler2Odds 
          };
          
          setOdds(prev => ({ ...prev, [matchId]: newOdds }));
          console.log(`📊 Updated global odds for ${matchId}:`, newOdds);
          
          // Calculate and log new percentages for debugging
          const w1Amount = matchPools.wrestler1 || 0;
          const w2Amount = matchPools.wrestler2 || 0;
          
          let wrestler1Percent = 50;
          let wrestler2Percent = 50;
          
          if (totalPoolWC > 0 && !isNaN(totalPoolWC)) {
            if (w1Amount > 0 && !isNaN(w1Amount)) {
              wrestler1Percent = Math.round((w1Amount / totalPoolWC) * 100);
              if (isNaN(wrestler1Percent) || wrestler1Percent < 0) wrestler1Percent = 50;
              if (wrestler1Percent > 99) wrestler1Percent = 99;
            }
            
            if (w2Amount > 0 && !isNaN(w2Amount)) {
              wrestler2Percent = Math.round((w2Amount / totalPoolWC) * 100);
              if (isNaN(wrestler2Percent) || wrestler2Percent < 0) wrestler2Percent = 50;
              if (wrestler2Percent > 99) wrestler2Percent = 99;
            }
          }
          
          console.log(`📊 New percentages for ${matchId}:`, {
            wrestler1: `${wrestler1Percent}%`,
            wrestler2: `${wrestler2Percent}%`,
            totalWC: totalPoolWC,
            wrestler1Amount: w1Amount,
            wrestler2Amount: w2Amount
          });
        }
        
        // Sync pools to global database and global storage
        syncBettingPoolsToGlobal(updatedPools);
        
        // Also sync to globalDataSync for cross-device synchronization
        globalDataSync.updateData('bettingPools', updatedPools);
        
        return updatedPools;
      });
      
      // Sync bet with global database
      try {
        const matchData = pollData[matchId];
        const result = await safeFetch('/api/bets', {
          method: 'POST',
          body: JSON.stringify({
            userId: 'anonymous-user', // In production, get from auth
            matchId: matchData?.matchId,
            wrestlerChoice: wrestler,
            betAmount: betAmount,
            odds: odds
          }),
        });

        if (result.success) {
          const data = result.data;
          console.log('✅ Bet synced to global database:', data);
        } else {
          console.log('⚠️ Database bet sync failed, maintaining local state');
          // Keep local changes but also backup to localStorage
          localStorage.setItem('wrestlebet_bets', JSON.stringify([...bets, newBet]));
        }
      } catch (error) {
        console.error('Database bet sync error:', error);
        // Fallback to localStorage
        localStorage.setItem('wrestlebet_bets', JSON.stringify([...bets, newBet]));
      }
      
      return newBet;
    } catch (error) {
      console.error('Error placing bet:', error);
      return null;
    }
  };

  // Helper function to sync betting pools to global database
  const syncBettingPoolsToGlobal = async (pools) => {
    try {
      const result = await safeFetch('/api/betting-pools', {
        method: 'POST',
        body: JSON.stringify({ pools }),
      });

      if (result.success) {
        console.log('✅ Betting pools synced to global database');
      } else {
        console.log('⚠️ Global pools sync failed, using localStorage backup');
        localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(pools));
      }
    } catch (error) {
      console.error('Global pools sync error:', error);
      localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(pools));
    }
  };

  const declareMatchWinner = (matchId, winner) => {
    console.log(`🏆 Declaring winner: ${winner} for match ${matchId}`);
    
    // Update all bets for this match
    setBets(prevBets => {
      const updatedBets = prevBets.map(bet => {
        if (bet.matchId === matchId && bet.status === 'pending') {
          const isWinner = bet.wrestler === winner;
          return {
            ...bet,
            status: isWinner ? 'won' : 'lost',
            winnings: isWinner ? (bet.amount * bet.odds) : 0,
            completedAt: new Date().toISOString()
          };
        }
        return bet;
      });
      
      // Update stats with new bet results
      updateBettingStats(updatedBets);
      return updatedBets;
    });
    
    // You can add API call here to sync with database
    // syncMatchWinnerToDatabase(matchId, winner);
  };

  const resetAllPools = () => {
    console.log('🔄 Resetting all betting pools');
    
    // Get current match keys from pollData
    const currentMatches = Object.keys(pollData);
    const resetPools = {};
    
    // Reset each match to equal 50-50 pools
    currentMatches.forEach((matchKey, index) => {
      resetPools[matchKey] = { 
        wrestler1: 100, 
        wrestler2: 100 
      };
    });
    
    setBettingPools(resetPools);
    
    // Recalculate odds to 2.00 for all
    const resetOdds = {};
    currentMatches.forEach(matchKey => {
      const matchData = pollData[matchKey];
      resetOdds[matchKey] = {};
      
      // Set odds to 2.00 for all wrestlers in each match
      Object.keys(matchData).forEach(key => {
        if (key !== 'totalVotes' && key !== 'matchId' && key !== 'wrestler1' && key !== 'wrestler2') {
          resetOdds[matchKey][key] = '2.00';
        }
      });
    });
    
    setOdds(resetOdds);
    
    // You can add API call here to sync with database
    // syncPoolsResetToDatabase(resetPools);
  };

  const updateBettingStats = (betsArray) => {
    const stats = {
      totalBets: betsArray.length,
      wonBets: betsArray.filter(bet => bet.status === 'won').length,
      lostBets: betsArray.filter(bet => bet.status === 'lost').length,
      pendingBets: betsArray.filter(bet => bet.status === 'pending').length,
      totalWinnings: betsArray
        .filter(bet => bet.status === 'won')
        .reduce((sum, bet) => sum + (bet.amount * bet.odds), 0),
      totalSpent: betsArray.reduce((sum, bet) => sum + bet.amount, 0),
      netProfit: 0,
      winRate: 0
    };
    
    stats.netProfit = stats.totalWinnings - stats.totalSpent;
    stats.winRate = stats.totalBets > 0 ? ((stats.wonBets / stats.totalBets) * 100).toFixed(1) : 0;
    setBettingStats(stats);
  };

  // Debug useEffect to track betting pools changes
  useEffect(() => {
    console.log('🔍 BettingPools changed:', bettingPools);
    console.log('🔍 Odds changed:', odds);
  }, [bettingPools, odds]);

  // Listen for admin match changes and update betting pools
  useEffect(() => {
    const handleAdminMatchUpdate = () => {
      const adminMatches = globalStorage.get('admin_demo_matches') || [];
      const newPools = { ...bettingPools };
      
      adminMatches.forEach(match => {
        if (match.status === 'upcoming') {
          // Use the actual match ID from the admin system
          const matchKey = match.id || `${match.wrestler1}-${match.wrestler2}`;
          if (!newPools[matchKey]) {
            // Create new pool for this match
            const baseAmount = 200 + Math.random() * 100;
            newPools[matchKey] = { 
              wrestler1: baseAmount, 
              wrestler2: Math.round(baseAmount * (0.3 + Math.random() * 0.4))
            };
            console.log(`🎯 Created new betting pool for ${matchKey}:`, newPools[matchKey]);
          }
        }
      });
      
      if (Object.keys(newPools).length !== Object.keys(bettingPools).length) {
        setBettingPools(newPools);
        console.log('🔄 Updated betting pools due to admin match changes:', newPools);
      }
    };

    // Listen for admin match events
    window.addEventListener('admin-match-created', handleAdminMatchUpdate);
    window.addEventListener('admin-match-deleted', handleAdminMatchUpdate);

    return () => {
      window.removeEventListener('admin-match-created', handleAdminMatchUpdate);
      window.removeEventListener('admin-match-deleted', handleAdminMatchUpdate);
    };
  }, [bettingPools]);

  // Initialize global data sync for cross-device synchronization
  useEffect(() => {
    // Start global data sync for cross-device synchronization
    if (typeof window !== 'undefined') {
      globalDataSync.startAutoSync();
      console.log('🌍 Global data sync started for cross-device synchronization');
      
      // Cleanup on unmount
      return () => {
        globalDataSync.stopAutoSync();
      };
    }
  }, []);

  // Enhanced useEffect with better error handling and cleanup
  useEffect(() => {
    let isMounted = true;
    
    // Load initial data from global database first, then supplement with localStorage as fallback
    const loadInitialData = async () => {
      console.log('🌍 Loading initial data from global database...');
      
      try {
        // First, try to load betting pools from global database
        const poolsResult = await safeFetch('/api/betting-pools');
        let initialPools = {};
        
        if (poolsResult.success) {
          const poolsData = poolsResult.data;
          if (poolsData.success && poolsData.pools) {
            initialPools = poolsData.pools;
            console.log('📥 Loaded betting pools from global database:', initialPools);
          }
        } else {
          console.log('⚠️ Global betting pools not available, using localStorage fallback');
          // Fallback to localStorage
          const storedPools = localStorage.getItem('wrestlebet_betting_pools');
          if (storedPools) {
            try {
              initialPools = JSON.parse(storedPools);
              console.log('📦 Loaded betting pools from localStorage:', initialPools);
            } catch (error) {
              console.error('Error parsing stored betting pools:', error);
            }
          }
        }
        
        // Initialize with default pools if none exist
        if (Object.keys(initialPools).length === 0) {
          // Get matches from multiple sources to create pools dynamically
          const globalMatches = globalDataSync.getData('matches');
          const adminMatches = globalStorage.get('admin_demo_matches') || [];
          
          initialPools = {};
          
          // Combine all matches from different sources
          const allMatches = {};
          
          // Add global matches
          Object.keys(globalMatches).forEach(matchKey => {
            allMatches[matchKey] = globalMatches[matchKey];
          });
          
          // Add admin matches
          adminMatches.forEach(match => {
            if (match.status === 'upcoming') {
              // Use the actual match ID from the admin system
              const matchKey = match.id || `${match.wrestler1}-${match.wrestler2}`;
              allMatches[matchKey] = {
                wrestler1: match.wrestler1,
                wrestler2: match.wrestler2
              };
            }
          });
          
          // If no matches found, create some default ones for testing
          const matchesToUse = Object.keys(allMatches).length > 0 ? allMatches : {
            'david-david': { wrestler1: 'David', wrestler2: 'David' },
            'kunle-pp': { wrestler1: 'Kunle', wrestler2: 'PP' }
          };
          
          Object.keys(matchesToUse).forEach((matchKey, index) => {
            // Initialize new matches with realistic starting pools (not 50-50)
            // This creates more interesting initial odds and makes changes more visible
            const baseAmount = 200 + (index * 50); // Varying base amounts
            initialPools[matchKey] = { 
              wrestler1: baseAmount, 
              wrestler2: Math.round(baseAmount * (0.3 + Math.random() * 0.4)) // 30-70% variation
            };
          });
          
          console.log('🎯 Initialized NEW MATCH pools with realistic distribution:', initialPools);
          
          // Sync initial pools to global database only if component is still mounted
          if (isMounted) {
            try {
              await fetch('/api/betting-pools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pools: initialPools }),
              });
              console.log('✅ Synced initial pools to global database');
            } catch (error) {
              console.log('⚠️ Failed to sync to global database, using localStorage');
              localStorage.setItem('wrestlebet_betting_pools', JSON.stringify(initialPools));
            }
          }
        }
        
        if (isMounted) {
          setBettingPools(initialPools);
          console.log('✅ Set bettingPools state to:', initialPools);
          
          // Calculate initial odds for all pools
          const initialOdds = {};
          const globalMatches = globalDataSync.getData('matches');
          
          Object.keys(initialPools).forEach(matchId => {
            // Get match data from global storage
            const matchData = globalMatches[matchId];
            const newOdds = calculateDynamicOdds(matchId, initialPools, matchData);
            if (Object.keys(newOdds).length > 0) {
              initialOdds[matchId] = newOdds;
            }
          });
          setOdds(initialOdds);
          console.log('📊 Calculated initial odds:', initialOdds);
          
          // Load poll data (which internally calculates odds using current pools)
          await loadPollData();
        }
        
        // Load stored bets from global database first
        try {
          const betsResult = await safeFetch('/api/bets');
          if (betsResult.success && isMounted) {
            const betsData = betsResult.data;
            if (betsData.success && betsData.bets) {
              setBets(betsData.bets);
              updateBettingStats(betsData.bets);
              console.log('📥 Loaded bets from global database:', betsData.bets.length);
              return; // Success, no need for localStorage fallback
            }
          }
        } catch (error) {
          console.log('⚠️ Global bets not available:', error);
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
        
      } catch (error) {
        console.error('🚨 Error in initial data load:', error);
        // Complete fallback to localStorage
        if (isMounted) {
          const storedPools = localStorage.getItem('wrestlebet_betting_pools');
          if (storedPools) {
            try {
              const initialPools = JSON.parse(storedPools);
              setBettingPools(initialPools);
            } catch (e) {
              console.error('localStorage parse error:', e);
            }
          }
        }
      }
    };
    
    loadInitialData();

    // Start global data sync
    globalDataSync.startAutoSync();

    // Periodically refresh poll data to sync with admin updates
    const intervalId = setInterval(() => {
      if (isMounted) {
        loadPollData();
      }
    }, 15000); // every 15s

    // Listen for admin-created matches to refresh immediately
    const onAdminCreated = () => {
      if (isMounted) {
        loadPollData();
      }
    };
    const onAdminDeleted = (e) => {
      if (!isMounted) return;
      const matchId = e?.detail?.matchId;
      setPollData(prev => {
        const copy = { ...prev };
        // Find by matchId or key
        Object.keys(copy).forEach(k => {
          if (k === matchId || copy[k]?.matchId === matchId) delete copy[k];
        });
        return copy;
      });
      setOdds(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(k => {
          if (k === matchId) delete copy[k];
        });
        return copy;
      });
      setBettingPools(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(k => {
          if (k === matchId) delete copy[k];
        });
        return copy;
      });
    };
    const onAdminWinner = (e) => {
      if (!isMounted) return;
      const { matchId, winner } = e?.detail || {};
      if (!matchId || !winner) return;
      // Map winner to key tokens
      const winnerKey = winner.toLowerCase().split(' ')[0];
      declareMatchWinner(matchId, winnerKey);
      // Optionally remove or mark completed
      setPollData(prev => ({ ...prev }));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('admin-match-created', onAdminCreated);
      window.addEventListener('admin-match-deleted', onAdminDeleted);
      window.addEventListener('admin-declare-winner', onAdminWinner);
    }
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      globalDataSync.stopAutoSync();
      if (typeof window !== 'undefined') {
        window.removeEventListener('admin-match-created', onAdminCreated);
        window.removeEventListener('admin-match-deleted', onAdminDeleted);
        window.removeEventListener('admin-declare-winner', onAdminWinner);
      }
    };
  }, []);

  const value = {
    pollData,
    selectedVotes,
    bettingPools,
    odds,
    bets,
    loading,
    error,
    bettingStats,
    handleVote,
    placeBetFromVote,
    loadPollData,
    updateBettingStats,
    getBalanceStatus,        // ADD THIS
    declareMatchWinner,      // ADD THIS
    resetAllPools,          // ADD THIS
    completedMatches: {}     // ADD THIS
  };

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};

export default BettingProvider;
