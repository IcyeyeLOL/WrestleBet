"use client";

import React from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Coins, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBetting } from '../contexts/SimpleBettingContext';

const BalanceDisplay = ({ showDetails = false, size = 'normal', onTogglePurchaseModal, showPurchaseModal }) => {
  const { balance, getFormattedBalance, getBalanceStatus, loading } = useCurrency();
  
  const balanceStatus = getBalanceStatus();
  const isLowBalance = balanceStatus === 'low' || balanceStatus === 'critical';
  
  // Size variants
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    normal: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  // Status color variants
  const statusColors = {
    normal: 'from-yellow-400 to-yellow-600 text-black',
    low: 'from-orange-400 to-orange-600 text-white',
    critical: 'from-red-500 to-red-700 text-white'
  };

  const statusIcons = {
    normal: <span style={{fontSize: '20px'}}>🪙</span>,
    low: <span style={{fontSize: '20px'}}>⚠️</span>,
    critical: <span style={{fontSize: '20px'}} className="animate-pulse">⚠️</span>
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-lg animate-pulse ${sizeClasses[size]}`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          <span className="font-bold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`bg-gradient-to-r ${statusColors[balanceStatus]} rounded-lg shadow-lg ${sizeClasses[size]} ${
          isLowBalance ? 'cursor-pointer hover:scale-105 transition-transform' : ''
        } ${showPurchaseModal && isLowBalance ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}
        onClick={isLowBalance && onTogglePurchaseModal ? () => onTogglePurchaseModal() : undefined}
        title={isLowBalance ? (showPurchaseModal ? 'Click to close purchase panel' : 'Click to purchase WrestleCoins') : ''}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {statusIcons[balanceStatus]}
            <div>
              <div className="font-bold">
                {getFormattedBalance()}
              </div>
              {showDetails && (
                <div className="text-xs opacity-80">
                  WrestleCoins
                </div>
              )}
            </div>
          </div>
          
          {showDetails && balanceStatus !== 'normal' && (
            <div className="text-xs">
              {balanceStatus === 'low' && '⚠️ Low'}
              {balanceStatus === 'critical' && '🚨 Critical'}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BalanceDisplay;
