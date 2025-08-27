"use client";

import React from 'react';

const BettingButtons = ({ 
  matchId, 
  wrestler1, 
  wrestler2, 
  selectedVotes, 
  odds, 
  hasAlreadyBet, 
  getExistingBet, 
  handlePlaceBet,
  colors
}) => {
  // Get wrestler key for odds lookup
  const getWrestlerKey = (wrestler) => {
    if (!wrestler || typeof wrestler !== 'string') return '';
    return wrestler.toLowerCase().trim().split(/\s+/)[0];
  };

  const wrestler1Key = getWrestlerKey(wrestler1);
  const wrestler2Key = getWrestlerKey(wrestler2);

  if (hasAlreadyBet(matchId)) {
    const bet = getExistingBet(matchId);
    return (
      <div className="flex flex-col gap-2">
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-xl font-bold text-center shadow-lg">
          ✅ Bet Placed Successfully
        </div>
        <div className="text-xs text-slate-400 text-center bg-slate-800/50 rounded-lg px-3 py-2">
          {bet ? `${bet.wrestler}: ${bet.amount} WC at ${bet.odds} odds` : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
      <div className="flex gap-2 md:gap-4 w-full">
        <button 
          onClick={() => {
            if (!wrestler1Key) return;
            handlePlaceBet(matchId, wrestler1Key, odds[matchId]?.[wrestler1Key] || '0.00');
          }}
          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r ${colors.wrestler1Bg} border ${colors.wrestler1Border} ${colors.wrestler1Text} hover:text-white px-3 md:px-5 py-4 md:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg touch-manipulation min-h-[60px] md:min-h-[auto] ${selectedVotes[matchId] === wrestler1Key ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-sm md:text-base font-medium">{typeof wrestler1 === 'string' && wrestler1 ? wrestler1.split(' ')[0] : 'Blue'}</span>
            <span className="text-lg md:text-xl font-black text-yellow-400 mt-1">
              {odds[matchId]?.[wrestler1Key] || '0.00'}
            </span>
          </div>
          {selectedVotes[matchId] === wrestler1Key && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
          )}
        </button>
        
        <button 
          onClick={() => {
            if (!wrestler2Key) return;
            handlePlaceBet(matchId, wrestler2Key, odds[matchId]?.[wrestler2Key] || '0.00');
          }}
          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r ${colors.wrestler2Bg} border ${colors.wrestler2Border} ${colors.wrestler2Text} hover:text-white px-3 md:px-5 py-4 md:py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg touch-manipulation min-h-[60px] md:min-h-[auto] ${selectedVotes[matchId] === wrestler2Key ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-sm md:text-base font-medium">{typeof wrestler2 === 'string' && wrestler2 ? wrestler2.split(' ')[0] : 'Red'}</span>
            <span className="text-lg md:text-xl font-black text-yellow-400 mt-1">
              {odds[matchId]?.[wrestler2Key] || '0.00'}
            </span>
          </div>
          {selectedVotes[matchId] === wrestler2Key && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
          )}
        </button>
      </div>
    </div>
  );
};

export default BettingButtons;
