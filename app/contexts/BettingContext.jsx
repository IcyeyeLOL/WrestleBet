"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const BettingContext = createContext();

// Create a custom hook to use the context
export const useBasicBetting = () => {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error('useBetting must be used within a BettingProvider');
  }
  return context;
};

// Create the provider component
export const BettingProvider = ({ children }) => {
  const [bets, setBets] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});

  // Add a new bet
  const addBet = (betData) => {
    const newBet = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...betData
    };
    
    setBets(prev => [...prev, newBet]);
    
    // Store in localStorage for persistence
    try {
      const existingBets = JSON.parse(localStorage.getItem('wrestlebet_bets') || '[]');
      const updatedBets = [...existingBets, newBet];
      localStorage.setItem('wrestlebet_bets', JSON.stringify(updatedBets));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Update bet status
  const updateBetStatus = (betId, status, result) => {
    setBets(prev => 
      prev.map(bet => 
        bet.id === betId 
          ? { ...bet, status, result }
          : bet
      )
    );
    
    // Update localStorage
    try {
      const existingBets = JSON.parse(localStorage.getItem('wrestlebet_bets') || '[]');
      const updatedBets = existingBets.map(bet => 
        bet.id === betId 
          ? { ...bet, status, result }
          : bet
      );
      localStorage.setItem('wrestlebet_bets', JSON.stringify(updatedBets));
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  // Load bets from localStorage on mount
  useEffect(() => {
    try {
      const savedBets = localStorage.getItem('wrestlebet_bets');
      if (savedBets) {
        setBets(JSON.parse(savedBets));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Handle votes (for polls)
  const handleVote = (matchId, wrestler) => {
    setSelectedVotes(prev => ({
      ...prev,
      [matchId]: prev[matchId] === wrestler ? null : wrestler
    }));
  };

  // Place a bet from voting
  const placeBetFromVote = (matchId, wrestler, odds, amount = 10) => {
    const matchNames = {
      'taylor-yazdani': {
        match: 'David Taylor vs. Hassan Yazdani',
        event: 'World Wrestling Championships 2025',
        weight: '86kg Final'
      },
      'dake-punia': {
        match: 'Kyle Dake vs. Bajrang Punia', 
        event: 'European Championships',
        weight: '65kg Semifinal'
      },
      'steveson-petriashvili': {
        match: 'Gable Steveson vs. Geno Petriashvili',
        event: 'Pan American Championships', 
        weight: '125kg Championship'
      }
    };

    const matchInfo = matchNames[matchId];
    if (matchInfo) {
      const bet = {
        ...matchInfo,
        bet: `${wrestler} to win`,
        amount: amount,
        odds: odds,
        potential: amount * parseFloat(odds)
      };
      
      addBet(bet);
    }
  };

  const value = {
    bets,
    selectedVotes,
    addBet,
    updateBetStatus,
    handleVote,
    placeBetFromVote
  };

  return (
    <BettingContext.Provider value={value}>
      {children}
    </BettingContext.Provider>
  );
};
