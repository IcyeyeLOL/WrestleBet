"use client";

import React, { useState, useEffect } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Gift, Clock, CheckCircle, Plus } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import PurchaseWCModal from './PurchaseWCModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe-config';

const DailyBonusButton = ({ size = 'normal', className = '' }) => {
  const { 
    dailyBonusAvailable, 
    claimDailyBonus, 
    getTimeUntilNextBonus, 
    loading 
  } = useCurrency();
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Update countdown timer
  useEffect(() => {
    if (!dailyBonusAvailable) {
      const updateTimer = () => {
        const timeUntilNext = getTimeUntilNextBonus();
        setTimeLeft(timeUntilNext);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000); // Update every second

      return () => clearInterval(interval);
    }
  }, [dailyBonusAvailable, getTimeUntilNextBonus]);

  const handleClaimBonus = async () => {
    const result = claimDailyBonus();
    
    if (result.success) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000); // Hide after 3 seconds
    } else {
      alert(`❌ ${result.error}`);
    }
  };

  // Size variants
  const sizeClasses = {
    mini: 'px-1 py-1 text-xs',
    small: 'px-3 py-2 text-sm',
    normal: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  // Show celebration animation
  if (showCelebration) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center justify-center gap-2">
            ✅
            <div className="font-bold">
              +50 WC Claimed! 🎉
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bonus available - show claim button
  if (dailyBonusAvailable) {
    return (
      <button
        onClick={handleClaimBonus}
        disabled={loading}
        className={`${sizeClasses[size]} ${className} bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg shadow-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-center gap-2">
          🎁
          <div className="font-bold">
            {loading ? 'Claiming...' : 'Claim 50 WC!'}
          </div>
        </div>
      </button>
    );
  }

  // Bonus not available - show countdown
  if (timeLeft) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow-lg">
          <div className="flex items-center justify-center gap-2">
            ⏰
            <div>
              <div className="font-bold text-xs">Next Bonus In:</div>
              <div className="text-sm">
                {timeLeft.hours}h {timeLeft.minutes}m
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center gap-2">
          🎁
          <div className="font-bold text-sm">Daily Bonus</div>
        </div>
      </div>
    </div>
  );
};

// Create a separate Purchase Button component
export const PurchaseButton = ({ size = 'normal', className = '' }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    normal: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  return (
    <>
      <button
        onClick={() => setShowPurchaseModal(true)}
        className={`${sizeClasses[size]} ${className} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105`}
      >
        <div className="flex items-center justify-center gap-2">
          ➕
          <div className="font-bold">
            Buy WC
          </div>
        </div>
      </button>

      {showPurchaseModal && stripePromise && (
        <Elements stripe={stripePromise}>
          <PurchaseWCModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
          />
        </Elements>
      )}

      {showPurchaseModal && !stripePromise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg max-w-md">
            <p className="text-red-400 mb-4">⚠️ Payment system unavailable</p>
            <p className="text-sm mb-4">Stripe not properly configured</p>
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyBonusButton;
