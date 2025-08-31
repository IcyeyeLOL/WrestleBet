"use client";

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const BettingContext = createContext();

// Enhanced precision helper for financial calculations
const preciseCurrencyCalculation = (amount) => {
  return Math.round(amount * 100) / 100;
};

const validateBetAmount = (amount, currentBalance) => {
  const preciseAmount = preciseCurrencyCalculation(amount);
  const preciseBalance = preciseCurrencyCalculation(currentBalance);
  
  return {
    isValid: preciseBalance >= preciseAmount && preciseAmount >= 10 && preciseAmount <= 10000,
    preciseAmount: preciseAmount,
    hasMinimum: preciseAmount >= 10,
    hasSufficientFunds: preciseBalance >= preciseAmount,
    withinMaximum: preciseAmount <= 10000
  };
};

export const BettingProvider = ({ children }) => {
  // Reset all pools to show 50-50 odds (better visual than 0-0)
  const [bettingPools, setBettingPools] = useState({});
  const [userBets, setUserBets] = useState([]);
  const [completedMatches, setCompletedMatches] = useState({});
  const [userBetResults, setUserBetResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced odds calculation with 50-50 default and proper bounds
  const calculateOdds = useCallback((matchId) => {
    const pools = bettingPools[matchId];
    if (!pools || (pools.wrestler1 === 0 && pools.wrestler2 === 0)) {
      // 50-50 default odds look much better than 0-0
      return { wrestler1: '2.00', wrestler2: '2.00' };
    }

    const totalPoolWC = pools.wrestler1 + pools.wrestler2;
    
    if (totalPoolWC === 0) {
      return { wrestler1: '2.00', wrestler2: '2.00' };
    }

    // Enhanced bounds: min 1.10, max 50.00 to prevent unrealistic odds
    const wrestler1Odds = pools.wrestler1 > 0 ? 
      Math.min(50.00, Math.max(1.10, (totalPoolWC / pools.wrestler1))) : 50.00;
    const wrestler2Odds = pools.wrestler2 > 0 ? 
      Math.min(50.00, Math.max(1.10, (totalPoolWC / pools.wrestler2))) : 50.00;

    return {
      wrestler1: wrestler1Odds.toFixed(2),
      wrestler2: wrestler2Odds.toFixed(2)
    };
  }, [bettingPools]);

  // WINNING SYSTEM: Declare match winner and process payouts
  const declareMatchWinner = useCallback((matchId, winnerWrestler) => {
    console.log(`🏆 Declaring winner: ${winnerWrestler} for match ${matchId}`);
    
    // Mark match as completed
    setCompletedMatches(prev => ({
      ...prev,
      [matchId]: {
        winner: winnerWrestler,
        completedAt: new Date().toISOString()
      }
    }));

    // Process all bets for this match
    processMatchPayouts(matchId, winnerWrestler);
  }, [userBets]);

  // WINNING SYSTEM: Process payouts with precise calculations
  const processMatchPayouts = useCallback((matchId, winner) => {
    const matchBets = userBets.filter(bet => bet.matchId === matchId);
    
    matchBets.forEach(bet => {
      if (bet.wrestler === winner) {
        // WIN: Calculate precise winnings
        const winnings = preciseCurrencyCalculation(bet.amount * parseFloat(bet.odds));
        
        // Add winnings to balance
        const currentBalance = parseFloat(localStorage.getItem('wrestlecoins_balance') || '1000');
        const newBalance = preciseCurrencyCalculation(currentBalance + winnings);
        localStorage.setItem('wrestlecoins_balance', newBalance.toString());
        
        // Update bet result
        setUserBetResults(prev => [...prev, {
          betId: bet.id,
          matchId,
          wrestler: bet.wrestler,
          amount: bet.amount,
          odds: bet.odds,
          status: 'won',
          winnings: winnings,
          completedAt: new Date().toISOString()
        }]);
        
        console.log(`✅ WIN: ${bet.wrestler} - Paid ${winnings} WC`);
        
      } else {
        // LOSS: No payout (money already deducted when bet was placed)
        setUserBetResults(prev => [...prev, {
          betId: bet.id,
          matchId,
          wrestler: bet.wrestler,
          amount: bet.amount,
          odds: bet.odds,
          status: 'lost',
          winnings: 0,
          completedAt: new Date().toISOString()
        }]);
        
        console.log(`❌ LOSS: ${bet.wrestler} - No payout`);
      }
    });

    // Trigger balance update event
    window.dispatchEvent(new CustomEvent('balanceUpdated'));
  }, [userBets]);

  // Enhanced bet placement with precise calculations
  const placeBet = useCallback(async (matchId, wrestler, amount, odds) => {
    const preciseAmount = preciseCurrencyCalculation(amount);
    
    // Get current balance from localStorage
    const currentBalance = parseFloat(localStorage.getItem('wrestlecoins_balance') || '1000');
    
    const validation = validateBetAmount(preciseAmount, currentBalance);
    
    if (!validation.isValid) {
      throw new Error('Invalid bet amount or insufficient funds');
    }

    try {
      // Update betting pools with precise amount
      setBettingPools(prev => {
        const newPools = { ...prev };
        if (!newPools[matchId]) {
          newPools[matchId] = { wrestler1: 0, wrestler2: 0 };
        }
        
        // Determine wrestler position dynamically (remove hardcoded names)
        const wrestlerKey = wrestler.toLowerCase().includes('wrestler1') || 
                           hash % 2 === 0 ? 'wrestler1' : 'wrestler2';
        newPools[matchId][wrestlerKey] = preciseCurrencyCalculation(
          newPools[matchId][wrestlerKey] + preciseAmount
        );
        
        return newPools;
      });

      // Subtract from balance with precision
      const newBalance = preciseCurrencyCalculation(currentBalance - preciseAmount);
      localStorage.setItem('wrestlecoins_balance', newBalance.toString());

      // Add to user bets
      const newBet = {
        id: Date.now(),
        matchId,
        wrestler,
        amount: preciseAmount,
        odds: parseFloat(odds),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      setUserBets(prev => [...prev, newBet]);

      // Trigger balance update event
      window.dispatchEvent(new CustomEvent('balanceUpdated', { 
        detail: { newBalance } 
      }));

      console.log(`✅ Bet placed: ${preciseAmount} WC on ${wrestler} at ${odds} odds`);
      
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }, [bettingPools]);

  // RESET FUNCTION: Clear all pools to show 50-50 odds
  const resetAllPools = useCallback(() => {
    setBettingPools({});
    console.log('✅ All betting pools reset to 50-50 odds (2.00/2.00)');
  }, []);

  const value = {
    bettingPools,
    setBettingPools,
    userBets,
    setUserBets,
    completedMatches,
    userBetResults,
    matches,
    setMatches,
    isLoading,
    setIsLoading,
    calculateOdds,
    placeBet,
    declareMatchWinner,
    resetAllPools,
    processMatchPayouts,
    preciseCurrencyCalculation,
    validateBetAmount
  };

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};

export const useDatabaseBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};