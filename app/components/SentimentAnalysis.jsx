"use client";

import React from 'react';

const SentimentAnalysis = ({ 
  matchId, 
  wrestler1, 
  wrestler2, 
  getPercentage, 
  getTotalWCInPool, 
  getCorrelationIcon, 
  odds,
  colors
}) => {
  // Get wrestler key for percentage lookup
  const getWrestlerKey = (wrestler) => {
    return wrestler.toLowerCase().replace(/\s+/g, '').split(' ')[0];
  };

  const wrestler1Key = getWrestlerKey(wrestler1);
  const wrestler2Key = getWrestlerKey(wrestler2);
  
  const wrestler1Percentage = getPercentage(matchId, wrestler1Key);
  const wrestler2Percentage = getPercentage(matchId, wrestler2Key);

  return (
    <div className="mt-6 pt-6 border-t border-slate-600/30 group-hover:border-yellow-400/30 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm md:text-base font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            Community Sentiment (WC Betting)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="bg-slate-700/50 px-3 py-1 rounded-full">
            {getTotalWCInPool(matchId).toLocaleString()} WC in pool
          </span>
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
      </div>
      
      {/* Sentiment Bar */}
      <div className="sentiment-bar-container mb-4 h-3 rounded-full overflow-hidden bg-slate-800/50 border border-slate-700/50">
        <div 
          className="sentiment-bar-fill h-full"
          style={{ 
            width: `${wrestler1Percentage}%`,
            background: `linear-gradient(90deg, ${colors.wrestler1.replace('from-', '').replace(' to-', ', ')})`,
            boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
          }}
        ></div>
        <div 
          className="sentiment-bar-fill h-full absolute top-0"
          style={{ 
            width: `${wrestler2Percentage}%`,
            background: `linear-gradient(90deg, ${colors.wrestler2.replace('from-', '').replace(' to-', ', ')})`,
            boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
            right: 0,
            left: 'auto'
          }}
        ></div>
      </div>
      
      {/* Sentiment Stats */}
      <div className="flex flex-col md:flex-row justify-between text-sm gap-3">
        <div className={`flex items-center gap-2 ${colors.wrestler1Bg.replace('from-', 'bg-').replace('/20 to-', '/10 border border-').replace('/20', '/30')} rounded-lg px-3 py-2`}>
          <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.wrestler1} shadow-lg`}></span>
          <span className="text-slate-300 font-medium">{wrestler1.split(' ')[0]}</span>
          <span className="font-bold text-yellow-400">{wrestler1Percentage}%</span>
          <span className="text-xs text-slate-400">({odds[matchId]?.[wrestler1Key] || '0.00'})</span>
          <span className="text-lg">{getCorrelationIcon(matchId, wrestler1Key)}</span>
        </div>
        <div className={`flex items-center gap-2 ${colors.wrestler2Bg.replace('from-', 'bg-').replace('/20 to-', '/10 border border-').replace('/20', '/30')} rounded-lg px-3 py-2`}>
          <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors.wrestler2} shadow-lg`}></span>
          <span className="text-slate-300 font-medium">{wrestler2.split(' ')[0]}</span>
          <span className="font-bold text-yellow-400">{wrestler2Percentage}%</span>
          <span className="text-xs text-slate-400">({odds[matchId]?.[wrestler2Key] || '0.00'})</span>
          <span className="text-lg">{getCorrelationIcon(matchId, wrestler2Key)}</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
