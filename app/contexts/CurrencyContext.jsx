"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import globalDataSync from '../lib/globalDataSync';
import { APP_CONFIG } from '../lib/constants';

const CurrencyContext = createContext();

// Constants
const STARTING_BALANCE = APP_CONFIG.currency.startingBalance;
const DAILY_BONUS_AMOUNT = APP_CONFIG.currency.dailyBonus;

// Enhanced precision helpers
const preciseCurrencyCalculation = (amount) => {
  return Math.round(amount * 100) / 100;
};

const updateBalanceWithPrecision = (currentBalance, change) => {
  const newBalance = preciseCurrencyCalculation(currentBalance + change);
  return Math.max(0, newBalance);
};

export const CurrencyProvider = ({ children }) => {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [lastBonusTime, setLastBonusTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // Load initial balance and bonus data from global sync
  useEffect(() => {
    // Try to get from global sync first
    const globalData = globalDataSync.getData('currency');
    
    if (globalData.balance !== undefined) {
      setBalance(globalData.balance);
    } else {
      // Fallback to localStorage
      const storedBalance = localStorage.getItem('wrestlecoins_balance');
      if (storedBalance) {
        setBalance(parseFloat(storedBalance));
      }
    }
    
    if (globalData.lastBonusTime) {
      setLastBonusTime(new Date(globalData.lastBonusTime));
    } else {
      // Fallback to localStorage
      const storedBonusTime = localStorage.getItem('wrestlecoins_last_bonus');
      if (storedBonusTime) {
        setLastBonusTime(new Date(storedBonusTime));
      }
    }

    // Load transactions
    if (globalData.transactions && Array.isArray(globalData.transactions)) {
      setTransactions(globalData.transactions);
    } else {
      // Fallback to localStorage
      const storedTx = localStorage.getItem('wrestlecoins_transactions');
      if (storedTx) {
        try {
          const parsed = JSON.parse(storedTx);
          if (Array.isArray(parsed)) setTransactions(parsed);
        } catch {}
      }
    }
    
    setLoading(false);
  }, []);

  // Sync transactions from database (for betting payouts)
  const syncTransactionsFromDatabase = useCallback((userId) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !userId) return;
    
    return new Promise((resolve, reject) => {
      try {
        fetch(`/api/transactions?userId=${userId}`)
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error('Failed to fetch transactions');
          })
          .then(data => {
            if (data.success && data.transactions) {
              console.log('💰 Syncing transactions from database:', data.transactions.length);
              
              // Get current local transactions
              const localTxIds = new Set(transactions.map(tx => tx.id));
              
              // Find new transactions from database
              const newTransactions = data.transactions.filter(dbTx => 
                !localTxIds.has(dbTx.id) && dbTx.type === 'bet_win'
              );
              
              if (newTransactions.length > 0) {
                console.log(`✅ Found ${newTransactions.length} new payout transactions`);
                
                // Add new transactions and update balance
                let totalPayout = 0;
                const formattedTx = newTransactions.map(dbTx => {
                  totalPayout += parseFloat(dbTx.amount || 0);
                  return {
                    id: dbTx.id,
                    type: 'credit',
                    amount: parseFloat(dbTx.amount || 0),
                    description: dbTx.description || 'Betting payout',
                    timestamp: dbTx.created_at,
                    source: 'database'
                  };
                });
                
                // Update balance with precision
                if (totalPayout > 0) {
                  setBalance(prevBalance => {
                    const newBalance = updateBalanceWithPrecision(prevBalance, totalPayout);
                    localStorage.setItem('wrestlecoins_balance', newBalance.toString());
                    return newBalance;
                  });
                }
                
                // Add transactions
                setTransactions(prev => {
                  const updated = [...prev, ...formattedTx];
                  localStorage.setItem('wrestlecoins_transactions', JSON.stringify(updated));
                  
                  // Update global sync
                  const globalData = globalDataSync.getData('currency');
                  globalDataSync.updateData('currency', {
                    ...globalData,
                    transactions: updated
                  });
                  
                  return updated;
                });
              }
              
              resolve(data.transactions);
            } else {
              resolve([]);
            }
          })
          .catch(error => {
            console.error('Error syncing transactions from database:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error in syncTransactionsFromDatabase:', error);
        reject(error);
      }
    });
  }, [transactions]);

  // Enhanced balance addition with precision
  const addToBalance = useCallback((amount, description = 'Balance credit') => {
    const preciseAmount = preciseCurrencyCalculation(amount);
    
    setBalance(prevBalance => {
      const newBalance = updateBalanceWithPrecision(prevBalance, preciseAmount);
      localStorage.setItem('wrestlecoins_balance', newBalance.toString());
      
      // Update global sync
      const globalData = globalDataSync.getData('currency');
      globalDataSync.updateData('currency', {
        ...globalData,
        balance: newBalance
      });
      
      return newBalance;
    });

    // Record transaction
    setTransactions(prev => {
      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        type: 'credit',
        amount: preciseAmount,
        description,
        timestamp: new Date().toISOString(),
      };
      const updated = [...prev, tx];
      localStorage.setItem('wrestlecoins_transactions', JSON.stringify(updated));
      
      // Update global sync
      const globalData = globalDataSync.getData('currency');
      globalDataSync.updateData('currency', {
        ...globalData,
        transactions: updated
      });
      
      return updated;
    });
  }, []);

  // Enhanced balance subtraction with validation
  const subtractFromBalance = useCallback((amount, description = 'Balance debit') => {
    const preciseAmount = preciseCurrencyCalculation(amount);
    
    setBalance(prevBalance => {
      // Enhanced validation with proper bounds checking
      if (preciseAmount < 10) {
        console.error('Minimum transaction is 10 WrestleCoins');
        return prevBalance;
      }
      
      if (preciseAmount > 10000) {
        console.error('Maximum transaction is 10,000 WrestleCoins');
        return prevBalance;
      }
      
      if (prevBalance < preciseAmount) {
        console.error('Insufficient balance');
        return prevBalance;
      }
      
      const newBalance = updateBalanceWithPrecision(prevBalance, -preciseAmount);
      localStorage.setItem('wrestlecoins_balance', newBalance.toString());
      return newBalance;
    });

    // Record transaction
    setTransactions(prev => {
      const tx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        type: 'debit',
        amount: preciseAmount,
        description,
        timestamp: new Date().toISOString(),
      };
      const updated = [...prev, tx];
      localStorage.setItem('wrestlecoins_transactions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Add getFormattedBalance function
  const getFormattedBalance = useCallback(() => {
    return `${balance.toLocaleString()} WC`;
  }, [balance]);

  // Add getBalanceStatus function
  const getBalanceStatus = useCallback(() => {
    if (balance <= 50) return 'critical';
    if (balance <= 200) return 'low';
    return 'normal';
  }, [balance]);

  // Helper: can the user afford a given bet amount?
  const canAffordBet = useCallback((amount) => {
    const preciseAmount = preciseCurrencyCalculation(amount || 0);
    if (preciseAmount < 10) return false;
    if (preciseAmount > 10000) return false;
    return balance >= preciseAmount;
  }, [balance]);

  // Daily bonus functions
  const isDailyBonusAvailable = useCallback(() => {
    if (!lastBonusTime) return true;
    
    const now = new Date();
    const timeDiff = now - lastBonusTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  }, [lastBonusTime]);

  const getTimeUntilNextBonus = useCallback(() => {
    if (!lastBonusTime) return null;
    
    const now = new Date();
    const nextBonusTime = new Date(lastBonusTime.getTime() + 24 * 60 * 60 * 1000);
    const timeDiff = nextBonusTime - now;
    
    if (timeDiff <= 0) return null;
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }, [lastBonusTime]);

  const claimDailyBonus = useCallback(() => {
    if (!isDailyBonusAvailable()) {
      return { success: false, error: 'Daily bonus not available yet' };
    }
    
    const now = new Date();
    addToBalance(DAILY_BONUS_AMOUNT, 'Daily bonus');
    setLastBonusTime(now);
    localStorage.setItem('wrestlecoins_last_bonus', now.toISOString());
    
    return { success: true, amount: DAILY_BONUS_AMOUNT };
  }, [isDailyBonusAvailable, addToBalance]);

  const value = {
    balance,
    setBalance,
    addToBalance,
    subtractFromBalance,
    getFormattedBalance,
    getBalanceStatus,
    canAffordBet,
    loading,
    lastBonusTime,
    transactions,
    DAILY_BONUS_AMOUNT,
    preciseCurrencyCalculation,
    updateBalanceWithPrecision,
    // Daily bonus functions
    dailyBonusAvailable: isDailyBonusAvailable(),
    claimDailyBonus,
    getTimeUntilNextBonus
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};