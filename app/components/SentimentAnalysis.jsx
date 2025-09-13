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
    if (!wrestler || typeof wrestler !== 'string') return '';
    return wrestler.toLowerCase().trim().split(/\s+/)[0];
  };

  // Convert Tailwind gradient classes to CSS colors
  const getGradientColors = (gradientClass) => {
    const colorMap = {
      'blue-500': '#3b82f6',
      'blue-600': '#2563eb',
      'red-500': '#ef4444',
      'red-600': '#dc2626',
      'purple-500': '#8b5cf6',
      'purple-600': '#7c3aed',
      'orange-500': '#f97316',
      'orange-600': '#ea580c',
      'green-500': '#22c55e',
      'green-600': '#16a34a',
      'indigo-500': '#6366f1',
      'indigo-600': '#4f46e5',
      'pink-500': '#ec4899',
      'pink-600': '#db2777',
      'teal-500': '#14b8a6',
      'teal-600': '#0d9488',
      'yellow-500': '#eab308',
      'yellow-600': '#ca8a04',
      'cyan-500': '#06b6d4',
      'cyan-600': '#0891b2',
      'emerald-500': '#10b981',
      'emerald-600': '#059669',
      'violet-500': '#8b5cf6',
      'violet-600': '#7c3aed',
      'rose-500': '#f43f5e',
      'rose-600': '#e11d48'
    };

    // Handle different gradient class formats
    if (!gradientClass || typeof gradientClass !== 'string') {
      return { from: '#3b82f6', to: '#1d4ed8' };
    }

    // Extract colors from gradient class (e.g., "from-blue-500 to-blue-600")
    const match = gradientClass.match(/from-(\w+-\d+)\s+to-(\w+-\d+)/);
    if (match) {
      const fromColor = colorMap[match[1]] || '#3b82f6';
      const toColor = colorMap[match[2]] || '#1d4ed8';
      return { from: fromColor, to: toColor };
    }
    
    // Try to extract single color if no gradient format
    const singleColorMatch = gradientClass.match(/(\w+-\d+)/);
    if (singleColorMatch) {
      const color = colorMap[singleColorMatch[1]] || '#3b82f6';
      return { from: color, to: color };
    }
    
    // Fallback to blue gradient
    return { from: '#3b82f6', to: '#1d4ed8' };
  };

  // Get colors for both wrestlers
  const wrestler1Colors = getGradientColors(colors.wrestler1);
  const wrestler2Colors = getGradientColors(colors.wrestler2);
  
  // Dynamic colors based on betting percentages - optimized
  const getDynamicColors = (maxPercentage) => {
    if (maxPercentage >= 60) {
      return {
        wrestler1: { from: '#00ff88', to: '#00cc6a' }, // Bright green
        wrestler2: { from: '#ff4757', to: '#ff3742' }   // Bright red
      };
    } else if (maxPercentage >= 40) {
      return {
        wrestler1: { from: '#3b82f6', to: '#2563eb' }, // Blue
        wrestler2: { from: '#ef4444', to: '#dc2626' }   // Red
      };
    } else {
      return {
        wrestler1: { from: '#8b5cf6', to: '#7c3aed' }, // Purple
        wrestler2: { from: '#f59e0b', to: '#d97706' }   // Orange
      };
    }
  };

  const wrestler1Key = getWrestlerKey(wrestler1);
  const wrestler2Key = getWrestlerKey(wrestler2);
  
  // Use 'wrestler1' and 'wrestler2' as keys for getPercentage function
  let wrestler1Percentage = getPercentage(matchId, 'wrestler1');
  let wrestler2Percentage = getPercentage(matchId, 'wrestler2');
  
  // Normalize percentages to ensure they add up to 100%
  const totalPercentage = wrestler1Percentage + wrestler2Percentage;
  if (totalPercentage > 0) {
    wrestler1Percentage = Math.round((wrestler1Percentage / totalPercentage) * 100);
    wrestler2Percentage = Math.round((wrestler2Percentage / totalPercentage) * 100);
    
    // Ensure they add up to exactly 100%
    const actualTotal = wrestler1Percentage + wrestler2Percentage;
    if (actualTotal !== 100) {
      wrestler2Percentage = 100 - wrestler1Percentage;
    }
  } else {
    // Default to 50-50 if no data
    wrestler1Percentage = 50;
    wrestler2Percentage = 50;
  }

  // Calculate dynamic colors AFTER percentages are defined
  const dynamicColors = getDynamicColors(Math.max(wrestler1Percentage, wrestler2Percentage));

  return (
    <div className="mt-6 pt-6 border-t border-slate-600/30 group-hover:border-yellow-400/30 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 text-sm md:text-base font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="hidden sm:inline">Community Sentiment (WC Betting)</span>
            <span className="sm:hidden">Sentiment</span>
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs text-slate-400">
          <span className="bg-slate-700/50 px-2 md:px-3 py-1 rounded-full">
            <span className="hidden sm:inline">{getTotalWCInPool(matchId).toLocaleString()} WC in pool</span>
            <span className="sm:hidden">{getTotalWCInPool(matchId).toLocaleString()} WC</span>
          </span>
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            LIVE
          </span>
        </div>
      </div>
      
      {/* Sentiment Bar */}
      <div className="relative mb-4 h-8 md:h-10 rounded-full overflow-hidden bg-slate-800/50 border-2 border-slate-700/50 shadow-inner">
        {/* Background fill to ensure no gaps */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${dynamicColors.wrestler1.from} ${wrestler1Percentage}%, ${dynamicColors.wrestler2.from} ${wrestler1Percentage}%)`
          }}
        ></div>
        
        {/* Wrestler 1 Bar - Left side */}
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-500 ease-out flex items-center justify-center"
          style={{ 
            width: `${wrestler1Percentage}%`,
            background: `${dynamicColors.wrestler1.from}`,
            boxShadow: `0 0 12px ${dynamicColors.wrestler1.from}60`,
            minWidth: wrestler1Percentage > 0 ? '8px' : '0px',
            zIndex: 10,
            borderRadius: '9999px 0 0 9999px'
          }}
        >
          {wrestler1Percentage > 15 && (
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {wrestler1Percentage}%
            </span>
          )}
        </div>
        
        {/* Wrestler 2 Bar - Right side */}
        <div 
          className="absolute top-0 h-full transition-all duration-500 ease-out flex items-center justify-center"
          style={{ 
            left: `${wrestler1Percentage}%`,
            width: `${wrestler2Percentage}%`,
            background: `${dynamicColors.wrestler2.from}`,
            boxShadow: `0 0 12px ${dynamicColors.wrestler2.from}60`,
            minWidth: wrestler2Percentage > 0 ? '8px' : '0px',
            zIndex: 10,
            borderRadius: '0 9999px 9999px 0'
          }}
        >
          {wrestler2Percentage > 15 && (
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {wrestler2Percentage}%
            </span>
          )}
        </div>
        
        {/* Center divider line for 50-50 */}
        {wrestler1Percentage === 50 && wrestler2Percentage === 50 && (
          <div 
            className="absolute top-0 h-full w-0.5 bg-white/20"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          ></div>
        )}
        
        {/* Fallback: Show empty state if no percentages */}
        {wrestler1Percentage === 0 && wrestler2Percentage === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-slate-500">No betting data yet</span>
          </div>
        )}
      </div>
      
      {/* Sentiment Stats */}
      <div className="flex flex-col md:flex-row justify-between text-sm gap-2 md:gap-3">
        <div 
          className="flex items-center gap-2 rounded-lg px-3 py-2 border"
          style={{
            backgroundColor: `${dynamicColors.wrestler1.from}20`,
            borderColor: `${dynamicColors.wrestler1.from}50`
          }}
        >
          <span 
            className="w-3 h-3 rounded-full shadow-lg"
            style={{
              background: `${dynamicColors.wrestler1.from}`
            }}
          ></span>
          <span className="text-slate-300 font-medium">{typeof wrestler1 === 'string' && wrestler1 ? wrestler1.split(' ')[0] : 'Wrestler 1'}</span>
          <span className="font-bold text-yellow-400">{wrestler1Percentage}%</span>
          <span className="text-xs text-slate-400">({odds[matchId]?.[wrestler1Key] || '0.00'})</span>
          <span className="text-lg">{getCorrelationIcon(matchId, wrestler1Key)}</span>
        </div>
        <div 
          className="flex items-center gap-2 rounded-lg px-3 py-2 border"
          style={{
            backgroundColor: `${dynamicColors.wrestler2.from}20`,
            borderColor: `${dynamicColors.wrestler2.from}50`
          }}
        >
          <span 
            className="w-3 h-3 rounded-full shadow-lg"
            style={{
              background: `${dynamicColors.wrestler2.from}`
            }}
          ></span>
          <span className="text-slate-300 font-medium">{typeof wrestler2 === 'string' && wrestler2 ? wrestler2.split(' ')[0] : 'Wrestler 2'}</span>
          <span className="font-bold text-yellow-400">{wrestler2Percentage}%</span>
          <span className="text-xs text-slate-400">({odds[matchId]?.[wrestler2Key] || '0.00'})</span>
          <span className="text-lg">{getCorrelationIcon(matchId, wrestler2Key)}</span>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
