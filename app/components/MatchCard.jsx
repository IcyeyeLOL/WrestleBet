"use client";

import React from 'react';
import SentimentAnalysis from './SentimentAnalysis';
import BettingButtons from './BettingButtons';

const MatchCard = ({ 
  matchId, 
  match, 
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
  if (!match) return null;

  const { wrestler1, wrestler2, weightClass, event, date, time } = match;
  
  // Generate wrestler initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get wrestler key for odds lookup
  const getWrestlerKey = (wrestler) => {
    return wrestler.toLowerCase().replace(/\s+/g, '');
  };

  // Generate colors based on match index
  const colorSchemes = [
    { 
      wrestler1: 'from-blue-500 to-blue-600',
      wrestler2: 'from-red-500 to-red-600',
      wrestler1Bg: 'from-blue-500/20 to-blue-600/20',
      wrestler2Bg: 'from-red-500/20 to-red-600/20',
      wrestler1Border: 'border-blue-500/50',
      wrestler2Border: 'border-red-500/50',
      wrestler1Text: 'text-blue-300',
      wrestler2Text: 'text-red-300'
    },
    {
      wrestler1: 'from-purple-500 to-purple-600', 
      wrestler2: 'from-orange-500 to-orange-600',
      wrestler1Bg: 'from-purple-500/20 to-purple-600/20',
      wrestler2Bg: 'from-orange-500/20 to-orange-600/20',
      wrestler1Border: 'border-purple-500/50',
      wrestler2Border: 'border-orange-500/50',
      wrestler1Text: 'text-purple-300',
      wrestler2Text: 'text-orange-300'
    },
    {
      wrestler1: 'from-green-500 to-green-600',
      wrestler2: 'from-indigo-500 to-indigo-600',
      wrestler1Bg: 'from-green-500/20 to-green-600/20',
      wrestler2Bg: 'from-indigo-500/20 to-indigo-600/20',
      wrestler1Border: 'border-green-500/50',
      wrestler2Border: 'border-indigo-500/50',
      wrestler1Text: 'text-green-300',
      wrestler2Text: 'text-indigo-300'
    }
  ];

  const colorIndex = Math.abs(matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colorSchemes.length;
  const colors = colorSchemes[colorIndex];

  return (
    <div className="group bg-gradient-to-r from-slate-700/30 via-slate-800/30 to-slate-700/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-600/30 transition-all duration-500 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex-1 mb-4 md:mb-0">
          {/* Match Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-base md:text-xl font-bold mb-4">
            <div className="flex items-center justify-center md:justify-start gap-4 bg-slate-800/50 rounded-2xl p-4">
              <div className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors.wrestler1} rounded-xl flex items-center justify-center text-white font-black text-sm mb-2`}>
                  {getInitials(wrestler1)}
                </div>
                <span className="text-slate-300 text-sm md:text-base font-semibold">{wrestler1}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-yellow-400 text-xs font-bold px-3 py-1 bg-yellow-400/20 rounded-full mb-2">
                  {weightClass} {event?.toUpperCase() || 'MATCH'}
                </span>
                <span className="text-slate-400 text-sm font-bold">VS</span>
              </div>
              
              <div className="text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors.wrestler2} rounded-xl flex items-center justify-center text-white font-black text-sm mb-2`}>
                  {getInitials(wrestler2)}
                </div>
                <span className="text-slate-300 text-sm md:text-base font-semibold">{wrestler2}</span>
              </div>
            </div>
          </div>
          
          {/* Match Details */}
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs md:text-sm">
            {time && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                <span>{time}</span>
              </div>
            )}
            {event && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>{event}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Betting Buttons */}
        <BettingButtons
          matchId={matchId}
          wrestler1={wrestler1}
          wrestler2={wrestler2}
          selectedVotes={selectedVotes}
          odds={odds}
          hasAlreadyBet={hasAlreadyBet}
          getExistingBet={getExistingBet}
          handlePlaceBet={handlePlaceBet}
          colors={colors}
        />
      </div>
      
      {/* Sentiment Analysis */}
      <SentimentAnalysis
        matchId={matchId}
        wrestler1={wrestler1}
        wrestler2={wrestler2}
        getPercentage={getPercentage}
        getTotalWCInPool={getTotalWCInPool}
        getCorrelationIcon={getCorrelationIcon}
        odds={odds}
        colors={colors}
      />
    </div>
  );
};

export default MatchCard;
