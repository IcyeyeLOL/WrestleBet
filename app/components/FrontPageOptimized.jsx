"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

// Import contexts
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';

// Import optimized components
import SharedHeader from './SharedHeader';
import HeroSection from './HeroSection';
import MatchesSection from './MatchesSection';
import LoadingSpinner from './LoadingSpinner';
import { LazyWrapper, BettingModal, PurchaseWCModal, AuthModal } from './LazyComponents';

// Import mobile styles
import '../styles/mobile.css';

// Import types (when TypeScript is fully enabled)
// import type { BettingModalState, AuthModalState } from '../types';

const FrontPageOptimized = () => {
  // Contexts
  const { 
    selectedVotes, 
    handleVote, 
    placeBetFromVote, 
    pollData, 
    odds,
    bettingPools,
    bets,
    loading 
  } = useBetting();
  
  const { 
    balance, 
    deductBalance, 
    getFormattedBalance 
  } = useCurrency();

  const { isSignedIn, isLoaded } = useUser();
  
  // Component state
  const [bettingModal, setBettingModal] = useState({
    isOpen: false,
    matchId: '',
    wrestler: '',
    odds: ''
  });

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signin',
    triggeredBy: null
  });

  // Handle URL authentication parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authParam = urlParams.get('auth');
      
      if (authParam && (authParam === 'signin' || authParam === 'signup')) {
        setAuthModal({
          isOpen: true,
          mode: authParam,
          triggeredBy: { action: 'url_redirect' }
        });
        
        // Clean up URL parameter
        const url = new URL(window.location);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url);
      }
    }
  }, []);

  // Memoized utility functions for better performance
  const utilityFunctions = useMemo(() => ({
    getPercentage: (matchId, wrestler) => {
      console.log(`🔍 getPercentage called for ${matchId} - ${wrestler}`);
      
      // Fallback values
      const fallbackValue = matchId === 'taylor-yazdani' ? (wrestler === 'taylor' ? 67 : 33) : 
                            matchId === 'dake-punia' ? (wrestler === 'dake' ? 38 : 62) :
                            matchId === 'steveson-petriashvili' ? (wrestler === 'steveson' ? 27 : 73) : 50;
      
      if (!bettingPools || Object.keys(bettingPools).length === 0 || !bettingPools[matchId]) {
        return fallbackValue;
      }
      
      const pools = bettingPools[matchId];
      const totalWC = pools.wrestler1 + pools.wrestler2;
      
      if (!totalWC || totalWC === 0) {
        return fallbackValue;
      }
      
      const matchData = pollData[matchId];
      if (!matchData) {
        return fallbackValue;
      }
      
      // Dynamic wrestler mapping
      let wrestlerWC = 0;
      const wrestler1Name = matchData.wrestler1?.toLowerCase().replace(/\s+/g, '');
      const wrestler2Name = matchData.wrestler2?.toLowerCase().replace(/\s+/g, '');
      const wrestlerKey = wrestler.toLowerCase().replace(/\s+/g, '');
      
      if (wrestler1Name && wrestlerKey.includes(wrestler1Name.split(' ')[0])) {
        wrestlerWC = pools.wrestler1;
      } else if (wrestler2Name && wrestlerKey.includes(wrestler2Name.split(' ')[0])) {
        wrestlerWC = pools.wrestler2;
      } else {
        // Fallback mapping
        if (matchId === 'taylor-yazdani') {
          wrestlerWC = wrestler.toLowerCase() === 'taylor' ? pools.wrestler1 : pools.wrestler2;
        } else if (matchId === 'dake-punia') {
          wrestlerWC = wrestler.toLowerCase() === 'dake' ? pools.wrestler1 : pools.wrestler2;
        } else if (matchId === 'steveson-petriashvili') {
          wrestlerWC = wrestler.toLowerCase() === 'steveson' ? pools.wrestler1 : pools.wrestler2;
        }
      }
      
      const percentage = Math.round((wrestlerWC / totalWC) * 100);
      return percentage === 0 ? fallbackValue : percentage;
    },

    getTotalWCInPool: (matchId) => {
      if (!bettingPools || !bettingPools[matchId]) {
        return 0;
      }
      const pools = bettingPools[matchId];
      return pools.wrestler1 + pools.wrestler2;
    },

    getSentimentCorrelation: (matchId, wrestler) => {
      const percentage = utilityFunctions.getPercentage(matchId, wrestler);
      const wrestlerOdds = odds[matchId]?.[wrestler.toLowerCase()] || '0.00';
      const oddsValue = parseFloat(wrestlerOdds);
      
      let correlationStatus = 'neutral';
      let icon = '';
      
      if (percentage > 60) {
        correlationStatus = 'strong-favorite';
        icon = '⭐';
      } else if (percentage >= 40 && percentage <= 60) {
        correlationStatus = 'competitive';
        icon = '⚖️';
      } else if (percentage < 40 && percentage > 0) {
        correlationStatus = 'underdog';
        icon = '💎';
      }
      
      return {
        percentage,
        odds: oddsValue,
        status: correlationStatus,
        icon,
        isValidCorrelation: percentage > 0 && oddsValue > 0
      };
    },

    getCorrelationIcon: (matchId, wrestler) => {
      const correlation = utilityFunctions.getSentimentCorrelation(matchId, wrestler);
      return correlation.icon;
    },

    hasAlreadyBet: (matchId) => {
      return bets.some(bet => bet.matchId === matchId && bet.status === 'pending');
    },

    getExistingBet: (matchId) => {
      return bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
    }
  }), [bettingPools, pollData, odds, bets]);

  // Handle betting
  const handlePlaceBet = (matchId, wrestler, currentOdds) => {
    if (!isLoaded) {
      console.log('🔄 Clerk not loaded yet, waiting...');
      return;
    }
    
    if (!isSignedIn) {
      setAuthModal({
        isOpen: true,
        mode: 'signin',
        triggeredBy: { action: 'bet', matchId, wrestler, odds: currentOdds }
      });
      return;
    }

    if (loading) {
      alert('Please wait for the previous action to complete...');
      return;
    }
    
    const existingBet = utilityFunctions.getExistingBet(matchId);
    if (existingBet) {
      alert(`❌ Already Bet Placed!\n\nYou already have a pending bet on this match:\n${existingBet.bet}\n\nAmount: ${existingBet.amount} WC\nOdds: ${existingBet.odds}\n\nYou can only place one bet per match.`);
      return;
    }
    
    if (balance < 10) {
      alert(`❌ Insufficient Balance!\n\nYour balance: ${getFormattedBalance()}\nMinimum bet: 10 WC\n\nPlease add more WrestleCoins to your account.`);
      return;
    }
    
    const dynamicOdds = odds[matchId] && odds[matchId][wrestler.toLowerCase()] 
      ? odds[matchId][wrestler.toLowerCase()] 
      : currentOdds;
    
    setBettingModal({
      isOpen: true,
      matchId,
      wrestler,
      odds: dynamicOdds
    });
  };

  // Handle bet confirmation
  const handleConfirmBet = (amount) => {
    const { matchId, wrestler, odds: betOdds } = bettingModal;
    
    const success = deductBalance(amount, `Bet on ${wrestler}`);
    
    if (success) {
      placeBetFromVote(matchId, wrestler, betOdds, amount);
      alert(`✅ Bet Placed Successfully!\n\n${wrestler}: ${amount} WC at ${betOdds} odds\nPotential Payout: ${Math.floor(amount * parseFloat(betOdds))} WC\nRemaining Balance: ${getFormattedBalance()}`);
    } else {
      alert('❌ Failed to place bet. Please try again.');
    }
  };

  // Modal handlers
  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin', triggeredBy: null });
  };

  const handleAuthSuccess = () => {
    const triggeredAction = authModal.triggeredBy;
    closeAuthModal();
    
    if (triggeredAction) {
      const { action, matchId, wrestler, odds } = triggeredAction;
      
      setTimeout(() => {
        if (action === 'vote') {
          handleVote(matchId, wrestler);
        } else if (action === 'bet') {
          setBettingModal({
            isOpen: true,
            matchId,
            wrestler,
            odds
          });
        }
      }, 500);
    }
  };

  const closeBettingModal = () => {
    setBettingModal({ isOpen: false, matchId: '', wrestler: '', odds: '' });
  };

  // Show loading state
  if (loading || !pollData || !isLoaded) {
    const loadingMessage = !isLoaded ? 'Initializing authentication...' : 'Loading wrestling matches...';
    return (
      <div className="font-inter overflow-x-hidden text-white">
        <SharedHeader />
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  return (
    <div className="font-inter overflow-x-hidden text-white mobile-optimized high-dpi-text">
      <SharedHeader 
        onTogglePurchaseModal={() => setShowPurchaseModal(!showPurchaseModal)}
        showPurchaseModal={showPurchaseModal}
      />
      
      {/* Purchase WC Modal */}
      {showPurchaseModal && (
        <LazyWrapper fallback={<LoadingSpinner message="Loading purchase options..." />}>
          <PurchaseWCModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
          />
        </LazyWrapper>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* Matches Section */}
      <MatchesSection
        pollData={pollData}
        selectedVotes={selectedVotes}
        odds={odds}
        bettingPools={bettingPools}
        bets={bets}
        hasAlreadyBet={utilityFunctions.hasAlreadyBet}
        getExistingBet={utilityFunctions.getExistingBet}
        handlePlaceBet={handlePlaceBet}
        getPercentage={utilityFunctions.getPercentage}
        getTotalWCInPool={utilityFunctions.getTotalWCInPool}
        getCorrelationIcon={utilityFunctions.getCorrelationIcon}
      />

      {/* Betting Modal */}
      {bettingModal.isOpen && (
        <LazyWrapper fallback={<LoadingSpinner message="Loading betting interface..." />}>
          <BettingModal
            isOpen={bettingModal.isOpen}
            matchId={bettingModal.matchId}
            wrestler={bettingModal.wrestler}
            odds={bettingModal.odds}
            onClose={closeBettingModal}
            onConfirmBet={handleConfirmBet}
          />
        </LazyWrapper>
      )}

      {/* Auth Modal */}
      {authModal.isOpen && (
        <LazyWrapper fallback={<LoadingSpinner message="Loading authentication..." />}>
          <AuthModal
            isOpen={authModal.isOpen}
            mode={authModal.mode}
            onClose={closeAuthModal}
            onAuthSuccess={handleAuthSuccess}
          />
        </LazyWrapper>
      )}

      {/* Enhanced Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #2d2d5a 100%);
        }
        
        .hero-radial {
          background: radial-gradient(ellipse at center, rgba(255,215,0,0.1) 0%, transparent 70%);
        }
        
        .grid-pattern::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23ffffff" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(5px) translateX(-5px); }
          75% { transform: translateY(-5px) translateX(10px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes floating {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
        
        .animate-floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #ffd700 50%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255, 217, 0, 0.525);
        }
        
        .sentiment-bar-container {
          position: relative;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          height: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sentiment-bar-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: 12px;
          transition: all 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FrontPageOptimized;
