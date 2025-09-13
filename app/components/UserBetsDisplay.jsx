"use client";

import React from 'react';
import { useBetting } from '../contexts/SimpleBettingContext';

const UserBetsDisplay = () => {
  const { bets } = useBetting();
  
  // Filter for pending bets only
  const pendingBets = bets.filter(bet => bet.status === 'pending');
  
  if (pendingBets.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
        🎯 Your Active Bets
      </h3>
      
      <div className="space-y-3">
        {pendingBets.map((bet) => (
          <div key={bet.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-white">
                  {bet.match || 'Unknown Match'}
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  Betting on: <span className="text-yellow-400 font-medium">{bet.displayWrestler || bet.wrestler}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Amount: {bet.amount} WC • Odds: {bet.odds}x
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-400">
                  Potential: {Math.round(bet.amount * bet.odds)} WC
                </div>
                <div className="text-xs text-gray-400">
                  Status: {bet.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        💡 You can only place one bet per match. To bet on a different wrestler, wait for the current match to complete.
      </div>
    </div>
  );
};

export default UserBetsDisplay;




