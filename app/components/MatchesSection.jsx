"use client";

import React from 'react';
import { LazyWrapper, MatchCard } from './LazyComponents';

const MatchesSection = ({ 
  pollData, 
  selectedVotes,
  odds,
  bettingPools,
  bets,
  hasAlreadyBet,
  getExistingBet,
  handlePlaceBet,
  getPercentage,
  getTotalWCInPool,
  getCorrelationIcon
}) => {
  if (!pollData || Object.keys(pollData).length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-slate-400">
            <p>No matches available at the moment. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  const matchKeys = Object.keys(pollData);

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              🔥 Active Matches
            </h2>
            <p className="text-slate-400 text-lg">
              Place your bets and watch the odds change in real-time
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <div className="bg-slate-800/50 rounded-full px-4 py-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-sm font-semibold">
                {matchKeys.length} Live Match{matchKeys.length !== 1 ? 'es' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="space-y-8">
          {matchKeys.map((matchId) => (
            <LazyWrapper key={matchId} fallback={
              <div className="bg-slate-800/30 rounded-2xl p-8 animate-pulse">
                <div className="h-24 bg-slate-700/50 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
              </div>
            }>
              <MatchCard
                matchId={matchId}
                match={pollData[matchId]}
                selectedVotes={selectedVotes}
                odds={odds}
                bettingPools={bettingPools}
                bets={bets}
                hasAlreadyBet={hasAlreadyBet}
                getExistingBet={getExistingBet}
                handlePlaceBet={handlePlaceBet}
                getPercentage={getPercentage}
                getTotalWCInPool={getTotalWCInPool}
                getCorrelationIcon={getCorrelationIcon}
              />
            </LazyWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
