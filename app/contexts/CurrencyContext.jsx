"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext();

// Constants
const STARTING_BALANCE = 1000;
const DAILY_BONUS_AMOUNT = 50;

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

  // Load initial balance and bonus data from localStorage
  useEffect(() => {
    const storedBalance = localStorage.getItem('wrestlecoins_balance');
    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    }
    
    const storedBonusTime = localStorage.getItem('wrestlecoins_last_bonus');
    if (storedBonusTime) {
      setLastBonusTime(new Date(storedBonusTime));
    }
    
    setLoading(false);
  }, []);

  // Enhanced balance addition with precision
  const addToBalance = useCallback((amount) => {
    const preciseAmount = preciseCurrencyCalculation(amount);
    
    setBalance(prevBalance => {
      const newBalance = updateBalanceWithPrecision(prevBalance, preciseAmount);
      localStorage.setItem('wrestlecoins_balance', newBalance.toString());
      return newBalance;
    });
  }, []);

  // Enhanced balance subtraction with validation
  const subtractFromBalance = useCallback((amount) => {
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
    addToBalance(DAILY_BONUS_AMOUNT);
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
    loading,
    lastBonusTime,
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