"use client";
// components/FrontPage.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '@clerk/nextjs';
import SharedHeader from './SharedHeader';
import BettingModal from './BettingModal';
import PurchaseWCModal from './PurchaseWCModal';
import AuthModal from './AuthModal';

const FrontPage = () => {
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
  
  console.log('🎯 FrontPage render - bettingPools:', bettingPools);
  console.log('🎯 FrontPage render - pollData:', pollData);
  console.log('🎯 FrontPage render - odds:', odds);
  
  const { 
    balance, 
    canAffordBet, 
    deductBalance, 
    getFormattedBalance 
  } = useCurrency();

  const { isSignedIn, isLoaded } = useUser();
  
  // Force re-render when pollData changes
  // Remove forceUpdate state - React handles re-renders automatically when data changes
  // const [forceUpdate, setForceUpdate] = useState(0);
  
  // Betting modal state
  const [bettingModal, setBettingModal] = useState({
    isOpen: false,
    matchId: '',
    wrestler: '',
    odds: ''
  });

  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Auth modal state
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'signin',
    triggeredBy: null // to track what action triggered the auth modal
  });
  
  // Watch for data changes and force re-render (debounced)
  // Remove the problematic useEffect that was causing infinite re-renders
  // The component will automatically re-render when pollData, bettingPools, or odds change
  // No need to force updates with setTimeout

  // Handle URL parameters for authentication
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
        
        // Clean up the URL parameter
        const url = new URL(window.location);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url);
      }
    }
  }, []); // Only run once on component mount

  const handleVoteWithPoll = (matchId, wrestler) => {
    // Check if Clerk has loaded and user authentication state
    if (!isLoaded) {
      console.log('🔄 Clerk not loaded yet, waiting...');
      return;
    }
    
    // Check if user is signed in before allowing voting
    if (!isSignedIn) {
      setAuthModal({
        isOpen: true,
        mode: 'signin',
        triggeredBy: { action: 'vote', matchId, wrestler }
      });
      return;
    }

    console.log(`🎯 FrontPage: Voting for ${wrestler} in ${matchId}`);
    handleVote(matchId, wrestler);
    // React will re-render automatically when state changes
  };

  // Handle placing a bet
  const handlePlaceBet = (matchId, wrestler, currentOdds) => {
    // Check if Clerk has loaded and user authentication state
    if (!isLoaded) {
      console.log('🔄 Clerk not loaded yet, waiting...');
      return;
    }
    
    // Check if user is signed in before allowing betting
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
    
    // Check if user has already bet on this match
    const existingBet = bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
    if (existingBet) {
      alert(`❌ Already Bet Placed!\n\nYou already have a pending bet on this match:\n${existingBet.bet}\n\nAmount: ${existingBet.amount} WC\nOdds: ${existingBet.odds}\n\nYou can only place one bet per match.`);
      return;
    }
    
    // Check minimum balance
    if (balance < 10) {
      alert(`❌ Insufficient Balance!\n\nYour balance: ${getFormattedBalance()}\nMinimum bet: 10 WC\n\nPlease add more WrestleCoins to your account.`);
      return;
    }
    
    // Use dynamic odds if available
    const dynamicOdds = odds[matchId] && odds[matchId][wrestler.toLowerCase()] 
      ? odds[matchId][wrestler.toLowerCase()] 
      : currentOdds;
    
    // Open betting modal
    setBettingModal({
      isOpen: true,
      matchId,
      wrestler,
      odds: dynamicOdds
    });
  };

  // Handle bet confirmation from modal
  const handleConfirmBet = (amount) => {
    const { matchId, wrestler, odds: betOdds } = bettingModal;
    
    // Deduct balance
    const success = deductBalance(amount, `Bet on ${wrestler}`);
    
    if (success) {
      placeBetFromVote(matchId, wrestler, betOdds, amount);
      alert(`✅ Bet Placed Successfully!\n\n${wrestler}: ${amount} WC at ${betOdds} odds\nPotential Payout: ${Math.floor(amount * parseFloat(betOdds))} WC\nRemaining Balance: ${getFormattedBalance()}`);
      
      // React will re-render automatically when betting pools and odds update
    } else {
      alert('❌ Failed to place bet. Please try again.');
    }
  };

  const getPercentage = (matchId, wrestler) => {
    console.log(`🔍 getPercentage called for ${matchId} - ${wrestler}`);
    console.log(`📊 Current bettingPools:`, bettingPools);
    console.log(`📊 Specific match pools:`, bettingPools?.[matchId]);
    
    // Always use fallback percentages first, then update when real data loads
    const fallbackValue = matchId === 'taylor-yazdani' ? (wrestler === 'taylor' ? 67 : 33) : 
                          matchId === 'dake-punia' ? (wrestler === 'dake' ? 38 : 62) :
                          matchId === 'steveson-petriashvili' ? (wrestler === 'steveson' ? 27 : 73) : 50;
    
    // Safety check for betting pools data
    if (!bettingPools || Object.keys(bettingPools).length === 0 || !bettingPools[matchId]) {
      console.log(`❌ No betting pool data found for match: ${matchId}, using fallback: ${fallbackValue}%`);
      return fallbackValue;
    }
    
    const pools = bettingPools[matchId];
    const totalWC = pools.wrestler1 + pools.wrestler2;
    
    console.log(`💰 Pool data - wrestler1: ${pools.wrestler1}, wrestler2: ${pools.wrestler2}, total: ${totalWC}`);
    
    if (!totalWC || totalWC === 0) {
      console.log(`❌ No WrestleCoin bets found for match: ${matchId}, total WC: ${totalWC}, using fallback: ${fallbackValue}%`);
      return fallbackValue;
    }
    
    // Get wrestler names from pollData to determine position dynamically
    const matchData = pollData[matchId];
    if (!matchData) {
      console.log(`❌ No match data found for ${matchId}, using fallback: ${fallbackValue}%`);
      return fallbackValue; // Return fallback instead of 0
    }
    
    // Determine which wrestler position this wrestler represents
    let wrestlerWC = 0;
    const wrestler1Name = matchData.wrestler1?.toLowerCase().replace(/\s+/g, '');
    const wrestler2Name = matchData.wrestler2?.toLowerCase().replace(/\s+/g, '');
    const wrestlerKey = wrestler.toLowerCase().replace(/\s+/g, '');
    
    // Map wrestler names to positions dynamically
    if (wrestler1Name && wrestlerKey.includes(wrestler1Name.split(' ')[0])) {
      wrestlerWC = pools.wrestler1;
    } else if (wrestler2Name && wrestlerKey.includes(wrestler2Name.split(' ')[0])) {
      wrestlerWC = pools.wrestler2;
    } else {
      // Fallback to hardcoded logic for existing matches
      if (matchId === 'taylor-yazdani') {
        wrestlerWC = wrestler.toLowerCase() === 'taylor' ? pools.wrestler1 : pools.wrestler2;
      } else if (matchId === 'dake-punia') {
        wrestlerWC = wrestler.toLowerCase() === 'dake' ? pools.wrestler1 : pools.wrestler2;
      } else if (matchId === 'steveson-petriashvili') {
        wrestlerWC = wrestler.toLowerCase() === 'steveson' ? pools.wrestler1 : pools.wrestler2;
      } else if (matchId === 'chamizo-takahashi') {
        wrestlerWC = wrestler.toLowerCase() === 'chamizo' ? pools.wrestler1 : pools.wrestler2;
      }
    }
    
    console.log(`� Calculating percentage for ${matchId}:`);
    console.log(`   - Wrestler: ${wrestler}`);
    console.log(`   - Wrestler WC: ${wrestlerWC}`);
    console.log(`   - Total WC in pool: ${totalWC}`);
    console.log(`   - Pool distribution:`, pools);
    
    const percentage = Math.round((wrestlerWC / totalWC) * 100);
    console.log(`   - Calculated percentage: ${percentage}%`);
    
    // Debug zero percentages and return fallback if calculation is 0
    if (percentage === 0) {
      console.warn(`🚨 ZERO PERCENTAGE for ${wrestler} in ${matchId}! Using fallback: ${fallbackValue}%`);
      console.warn(`Pools:`, bettingPools);
      return fallbackValue; // Return fallback instead of 0
    }
    
    return percentage;
  };

  // Get total WrestleCoin in betting pool for a match
  const getTotalWCInPool = (matchId) => {
    if (!bettingPools || !bettingPools[matchId]) {
      return 0;
    }
    const pools = bettingPools[matchId];
    return pools.wrestler1 + pools.wrestler2;
  };

  // Get sentiment-to-odds correlation indicator
  const getSentimentCorrelation = (matchId, wrestler) => {
    const percentage = getPercentage(matchId, wrestler);
    const wrestlerOdds = odds[matchId]?.[wrestler.toLowerCase()] || '0.00';
    const oddsValue = parseFloat(wrestlerOdds);
    
    // Enhanced correlation logic
    let correlationStatus = 'neutral';
    let icon = '';
    
    if (percentage > 60) {
      correlationStatus = 'strong-favorite';
      icon = '⭐'; // Strong favorite
    } else if (percentage >= 40 && percentage <= 60) {
      correlationStatus = 'competitive';
      icon = '⚖️'; // Balanced/competitive
    } else if (percentage < 40 && percentage > 0) {
      correlationStatus = 'underdog';
      icon = '🔥'; // Underdog (but removing fire emoji as requested)
    }
    
    return {
      percentage,
      odds: oddsValue,
      status: correlationStatus,
      icon: icon === '🔥' ? '💎' : icon, // Replace fire with diamond
      isValidCorrelation: percentage > 0 && oddsValue > 0
    };
  };

  // Get correlation icon for a wrestler
  const getCorrelationIcon = (matchId, wrestler) => {
    const correlation = getSentimentCorrelation(matchId, wrestler);
    return correlation.icon;
  };

  // Check if user has already bet on a match
  const hasAlreadyBet = (matchId) => {
    return bets.some(bet => bet.matchId === matchId && bet.status === 'pending');
  };

  // Get the existing bet for a match (if any)
  const getExistingBet = (matchId) => {
    return bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
  };

  // Handle auth modal actions
  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'signin', triggeredBy: null });
  };

  // Handle successful authentication - retry the original action
  const handleAuthSuccess = () => {
    // Store the triggered action before closing modal to avoid race condition
    const triggeredAction = authModal.triggeredBy;
    
    closeAuthModal();
    
    // If authentication was triggered by a specific action, retry it
    if (triggeredAction) {
      const { action, matchId, wrestler, odds } = triggeredAction;
      
      // Add delay to ensure auth state is fully updated
      setTimeout(() => {
        if (action === 'vote') {
          handleVote(matchId, wrestler);
          // React will re-render automatically when vote state changes
        } else if (action === 'bet') {
          // Retry betting after successful auth
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

  // Close betting modal
  const closeBettingModal = () => {
    setBettingModal({ isOpen: false, matchId: '', wrestler: '', odds: '' });
  };

  // Show loading state if data is not ready or Clerk is loading
  if (loading || !pollData || !isLoaded) {
    return (
      <div className="font-inter overflow-x-hidden text-white">
        <SharedHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400">
              {!isLoaded ? 'Initializing authentication...' : 'Loading wrestling matches...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log important data to console
  console.log('🔍 FrontPage Debug:');
  console.log('  - bettingPools:', bettingPools);
  console.log('  - odds:', odds);
  console.log('  - pollData:', pollData);

  // Get actual match keys from pollData instead of hardcoded ones
  const getMatchKeys = () => {
    return Object.keys(pollData || {});
  };

  // Get wrestler names for a match
  const getWrestlerNames = (matchKey) => {
    const match = pollData[matchKey];
    if (match && match.wrestler1 && match.wrestler2) {
      return {
        wrestler1: match.wrestler1,
        wrestler2: match.wrestler2
      };
    }
    // Fallback to parsing from key if needed
    return null;
  };

  return (
    <div className="font-inter overflow-x-hidden text-white">
      <SharedHeader 
        onTogglePurchaseModal={() => setShowPurchaseModal(!showPurchaseModal)}
        showPurchaseModal={showPurchaseModal}
      />
      
      {/* Purchase WC Panel - Shows when balance is low and clicked */}
      {showPurchaseModal && (
        <PurchaseWCModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
      
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
        
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out;
        }
        
        .animate-floating {
          animation: floating 3s ease-in-out infinite;
        }
        
        .animate-floating-delay-1 {
          animation: floating 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-floating-delay-2 {
          animation: floating 3s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #ffd700 50%, #fff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255, 217, 0, 0.525);
        }
        
        .logo-gradient {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .btn-gradient {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
        }
        
        .feature-card {
          position: relative;
          overflow: hidden;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
          transition: left 0.5s ease;
        }
        
        .feature-card:hover::before {
          left: 100%;
        }
        
        .poll-bar {
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          transition: width 0.8s ease-out;
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
          background: linear-gradient(90deg, #10b981 0%, #22c55e 100%);
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
        }
        
        .correlation-icon {
          font-size: 14px;
          margin-left: 4px;
          opacity: 0.9;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }
        
        .live-dot {
          animation: pulse-live 1.5s infinite;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>

      {/* Hero Section */}
      <section className="hero-gradient hero-radial grid-pattern min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background Animation Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-floating"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-floating-delay-1"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-floating-delay-2"></div>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="hero-content text-center max-w-4xl mx-auto animate-fadeInUp pt-16 md:pt-20">
            
            {/* Enhanced Title */}
            <div className="mb-8 md:mb-12">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border border-yellow-400/30 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  🏆 Championship Betting Platform
                </span>
              </div>
              
              <h1 className="text-gradient text-4xl md:text-6xl lg:text-8xl font-black mb-4 md:mb-6 leading-tight">
                Elite Wrestling
                <br />
                <span className="text-3xl md:text-5xl lg:text-7xl">Betting Experience</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 md:mb-12 text-slate-300 font-light px-4 leading-relaxed">
                Join the ultimate destination for freestyle wrestling betting. Experience live odds, 
                <br className="hidden md:block" />
                expert analysis, and championship action like never before.
              </p>
            </div>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
              <a href="#betting-section" className="group btn-gradient text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold no-underline inline-flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/25">
                <span className="text-2xl group-hover:scale-110 transition-transform">🥇</span>
                Start Betting Now
                <div className="w-2 h-2 bg-black/20 rounded-full group-hover:w-4 transition-all duration-300"></div>
              </a>
              <a href="#betting-section" className="group bg-slate-800/40 backdrop-blur-md text-white border-2 border-slate-600/50 hover:border-yellow-400/50 px-8 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold no-underline inline-flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-700/60">
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                View Live Odds
              </a>
            </div>
            
            {/* Enhanced Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
              <div className="feature-card animate-floating bg-slate-800/30 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-slate-700/30 transition-all duration-500 hover:-translate-y-3 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:bg-slate-700/40 group">
                <div className="feature-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-2xl md:text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">⚡</span>
                </div>
                <h3 className="text-yellow-400 text-xl md:text-2xl font-black mb-4 md:mb-6 group-hover:text-yellow-300 transition-colors">Live Betting</h3>
                <p className="text-slate-300 leading-relaxed text-base md:text-lg group-hover:text-slate-200 transition-colors">
                  Real-time odds that update as matches unfold. Experience the thrill with dynamic betting opportunities.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-600/30 group-hover:border-yellow-400/30 transition-colors">
                  <span className="text-yellow-500 text-sm font-semibold">⚡ Instant Updates</span>
                </div>
              </div>
              
              <div className="feature-card animate-floating-delay-1 bg-slate-800/30 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-slate-700/30 transition-all duration-500 hover:-translate-y-3 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:bg-slate-700/40 group">
                <div className="feature-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-2xl md:text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">🎯</span>
                </div>
                <h3 className="text-yellow-400 text-xl md:text-2xl font-black mb-4 md:mb-6 group-hover:text-yellow-300 transition-colors">Expert Analysis</h3>
                <p className="text-slate-300 leading-relaxed text-base md:text-lg group-hover:text-slate-200 transition-colors">
                  In-depth wrestler statistics, head-to-head records, and professional insights from wrestling experts.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-600/30 group-hover:border-yellow-400/30 transition-colors">
                  <span className="text-yellow-500 text-sm font-semibold">📈 Data Driven</span>
                </div>
              </div>
              
              <div className="feature-card animate-floating-delay-2 bg-slate-800/30 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-slate-700/30 transition-all duration-500 hover:-translate-y-3 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:bg-slate-700/40 group">
                <div className="feature-icon w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-2xl md:text-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mx-auto">
                  <span className="group-hover:scale-110 transition-transform duration-300">🏆</span>
                </div>
                <h3 className="text-yellow-400 text-xl md:text-2xl font-black mb-4 md:mb-6 group-hover:text-yellow-300 transition-colors">Championship Events</h3>
                <p className="text-slate-300 leading-relaxed text-base md:text-lg group-hover:text-slate-200 transition-colors">
                  Comprehensive coverage of World Championships, Olympics, and major international tournaments.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-600/30 group-hover:border-yellow-400/30 transition-colors">
                  <span className="text-yellow-500 text-sm font-semibold">🌍 Global Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats and Betting Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800" id="betting-section">
        <div className="container max-w-6xl mx-auto px-4 md:px-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
            <div className="group text-center p-8 md:p-10 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/30 hover:border-yellow-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/10">
              <div className="mb-4">
                <span className="block text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">50K+</span>
                <span className="text-slate-300 text-lg md:text-xl font-semibold group-hover:text-yellow-400 transition-colors">Active Bettors</span>
              </div>
              <p className="text-slate-400 text-sm">Join our growing community of wrestling enthusiasts</p>
            </div>
            <div className="group text-center p-8 md:p-10 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/30 hover:border-yellow-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/10">
              <div className="mb-4">
                <span className="block text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">$2M+</span>
                <span className="text-slate-300 text-lg md:text-xl font-semibold group-hover:text-yellow-400 transition-colors">Weekly Volume</span>
              </div>
              <p className="text-slate-400 text-sm">Massive betting pools with competitive odds</p>
            </div>
            <div className="group text-center p-8 md:p-10 bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/30 hover:border-yellow-400/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-400/10">
              <div className="mb-4">
                <span className="block text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">24/7</span>
                <span className="text-slate-300 text-lg md:text-xl font-semibold group-hover:text-yellow-400 transition-colors">Live Support</span>
              </div>
              <p className="text-slate-400 text-sm">Round-the-clock assistance for all your needs</p>
            </div>
          </div>

          {/* Enhanced Betting Odds Section */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-3xl md:rounded-[2rem] p-6 md:p-12 border border-slate-700/40 shadow-2xl">
            {/* Enhanced Header */}
            <div className="text-center mb-10 md:mb-12">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  🔥 TRENDING NOW
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8">
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Hot Matches This Week
                </span>
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm md:text-base font-bold">LIVE ODDS</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  <span>Updates every 30 seconds</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Match Cards */}
            <div className="space-y-6 md:space-y-8">
              {/* Taylor vs Yazdani - Enhanced */}
              <div className="group bg-gradient-to-r from-slate-700/30 via-slate-800/30 to-slate-700/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-600/30 transition-all duration-500 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex-1 mb-4 md:mb-0">
                    {/* Enhanced Match Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-base md:text-xl font-bold mb-4">
                      <div className="flex items-center justify-center md:justify-start gap-4 bg-slate-800/50 rounded-2xl p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            DT
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">David Taylor</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-yellow-400 text-xs font-bold px-3 py-1 bg-yellow-400/20 rounded-full mb-2">86kg FINAL</span>
                          <span className="text-slate-400 text-sm font-bold">VS</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            HY
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">Hassan Yazdani</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Match Details */}
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                        <span>Today 8:00 PM EST</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        <span>World Championships 2025</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Betting Buttons */}
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                    {hasAlreadyBet('taylor-yazdani') ? (
                      <div className="flex flex-col gap-2">
                        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-xl font-bold text-center shadow-lg">
                          ✅ Bet Placed Successfully
                        </div>
                        <div className="text-xs text-slate-400 text-center bg-slate-800/50 rounded-lg px-3 py-2">
                          {(() => {
                            const bet = getExistingBet('taylor-yazdani');
                            return bet ? `${bet.wrestler}: ${bet.amount} WC at ${bet.odds} odds` : '';
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 md:gap-4">
                        <button 
                          onClick={() => {
                            handlePlaceBet('taylor-yazdani', 'taylor', odds['taylor-yazdani']?.taylor || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/50 text-blue-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/25 ${selectedVotes['taylor-yazdani'] === 'taylor' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Taylor</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['taylor-yazdani']?.taylor || '0.00'}</span>
                          </div>
                          {selectedVotes['taylor-yazdani'] === 'taylor' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            handlePlaceBet('taylor-yazdani', 'yazdani', odds['taylor-yazdani']?.yazdani || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-400/25 ${selectedVotes['taylor-yazdani'] === 'yazdani' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Yazdani</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['taylor-yazdani']?.yazdani || '0.00'}</span>
                          </div>
                          {selectedVotes['taylor-yazdani'] === 'yazdani' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {/* Enhanced Sentiment Analysis */}
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
                        {getTotalWCInPool('taylor-yazdani').toLocaleString()} WC in pool
                      </span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  {/* Enhanced Sentiment Bar */}
                  <div className="sentiment-bar-container mb-4 h-3 rounded-full overflow-hidden bg-slate-800/50 border border-slate-700/50">
                    <div 
                      className="sentiment-bar-fill h-full"
                      style={{ 
                        width: `${getPercentage('taylor-yazdani', 'taylor')}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                        boxShadow: '0 0 12px rgba(59, 130, 246, 0.4)'
                      }}
                    ></div>
                    <div 
                      className="sentiment-bar-fill h-full absolute top-0"
                      style={{ 
                        width: `${getPercentage('taylor-yazdani', 'yazdani')}%`,
                        background: 'linear-gradient(90deg, #ef4444, #dc2626)',
                        boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                        right: 0,
                        left: 'auto'
                      }}
                    ></div>
                  </div>
                  
                  {/* Enhanced Sentiment Stats */}
                  <div className="flex flex-col md:flex-row justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></span>
                      <span className="text-slate-300 font-medium">Taylor</span>
                      <span className="font-bold text-yellow-400">{getPercentage('taylor-yazdani', 'taylor')}%</span>
                      <span className="text-xs text-slate-400">({odds['taylor-yazdani']?.taylor || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('taylor-yazdani', 'taylor')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                      <span className="text-slate-300 font-medium">Yazdani</span>
                      <span className="font-bold text-yellow-400">{getPercentage('taylor-yazdani', 'yazdani')}%</span>
                      <span className="text-xs text-slate-400">({odds['taylor-yazdani']?.yazdani || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('taylor-yazdani', 'yazdani')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dake vs Punia - Enhanced */}
              <div className="group bg-gradient-to-r from-slate-700/30 via-slate-800/30 to-slate-700/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-600/30 transition-all duration-500 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex-1 mb-4 md:mb-0">
                    {/* Enhanced Match Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-base md:text-xl font-bold mb-4">
                      <div className="flex items-center justify-center md:justify-start gap-4 bg-slate-800/50 rounded-2xl p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            KD
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">Kyle Dake</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-yellow-400 text-xs font-bold px-3 py-1 bg-yellow-400/20 rounded-full mb-2">65kg SEMIFINAL</span>
                          <span className="text-slate-400 text-sm font-bold">VS</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            BP
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">Bajrang Punia</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Match Details */}
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                        <span>Tomorrow 6:30 PM EST</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        <span>European Championships</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Betting Buttons */}
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                    {hasAlreadyBet('dake-punia') ? (
                      <div className="flex flex-col gap-2">
                        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-xl font-bold text-center shadow-lg">
                          ✅ Bet Placed Successfully
                        </div>
                        <div className="text-xs text-slate-400 text-center bg-slate-800/50 rounded-lg px-3 py-2">
                          {(() => {
                            const bet = getExistingBet('dake-punia');
                            return bet ? `${bet.wrestler}: ${bet.amount} WC at ${bet.odds} odds` : '';
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 md:gap-4">
                        <button 
                          onClick={() => {
                            handlePlaceBet('dake-punia', 'dake', odds['dake-punia']?.dake || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/50 text-purple-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-400/25 ${selectedVotes['dake-punia'] === 'dake' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Dake</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['dake-punia']?.dake || '0.00'}</span>
                          </div>
                          {selectedVotes['dake-punia'] === 'dake' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            handlePlaceBet('dake-punia', 'punia', odds['dake-punia']?.punia || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 text-orange-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/25 ${selectedVotes['dake-punia'] === 'punia' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Punia</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['dake-punia']?.punia || '0.00'}</span>
                          </div>
                          {selectedVotes['dake-punia'] === 'punia' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Sentiment Analysis */}
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
                        {getTotalWCInPool('dake-punia').toLocaleString()} WC in pool
                      </span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  {/* Enhanced Sentiment Bar */}
                  <div className="sentiment-bar-container mb-4 h-3 rounded-full overflow-hidden bg-slate-800/50 border border-slate-700/50">
                    <div 
                      className="sentiment-bar-fill h-full"
                      style={{ 
                        width: `${getPercentage('dake-punia', 'dake')}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                        boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)'
                      }}
                    ></div>
                    <div 
                      className="sentiment-bar-fill h-full absolute top-0"
                      style={{ 
                        width: `${getPercentage('dake-punia', 'punia')}%`,
                        background: 'linear-gradient(90deg, #f97316, #ea580c)',
                        boxShadow: '0 0 12px rgba(249, 115, 22, 0.4)',
                        right: 0,
                        left: 'auto'
                      }}
                    ></div>
                  </div>
                  
                  {/* Enhanced Sentiment Stats */}
                  <div className="flex flex-col md:flex-row justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></span>
                      <span className="text-slate-300 font-medium">Dake</span>
                      <span className="font-bold text-yellow-400">{getPercentage('dake-punia', 'dake')}%</span>
                      <span className="text-xs text-slate-400">({odds['dake-punia']?.dake || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('dake-punia', 'dake')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></span>
                      <span className="text-slate-300 font-medium">Punia</span>
                      <span className="font-bold text-yellow-400">{getPercentage('dake-punia', 'punia')}%</span>
                      <span className="text-xs text-slate-400">({odds['dake-punia']?.punia || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('dake-punia', 'punia')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steveson vs Petriashvili - Enhanced */}
              <div className="group bg-gradient-to-r from-slate-700/30 via-slate-800/30 to-slate-700/30 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-600/30 transition-all duration-500 hover:border-yellow-400/40 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex-1 mb-4 md:mb-0">
                    {/* Enhanced Match Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-base md:text-xl font-bold mb-4">
                      <div className="flex items-center justify-center md:justify-start gap-4 bg-slate-800/50 rounded-2xl p-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            GS
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">Gable Steveson</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-yellow-400 text-xs font-bold px-3 py-1 bg-yellow-400/20 rounded-full mb-2">125kg CHAMPIONSHIP</span>
                          <span className="text-slate-400 text-sm font-bold">VS</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            GP
                          </div>
                          <span className="text-slate-300 text-sm md:text-base font-semibold">Geno Petriashvili</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Match Details */}
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs md:text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                        <span>Sunday 7:00 PM EST</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        <span>Pan American Championships</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Betting Buttons */}
                  <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                    {hasAlreadyBet('steveson-petriashvili') ? (
                      <div className="flex flex-col gap-2">
                        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 text-green-400 px-6 py-3 rounded-xl font-bold text-center shadow-lg">
                          ✅ Bet Placed Successfully
                        </div>
                        <div className="text-xs text-slate-400 text-center bg-slate-800/50 rounded-lg px-3 py-2">
                          {(() => {
                            const bet = getExistingBet('steveson-petriashvili');
                            return bet ? `${bet.wrestler}: ${bet.amount} WC at ${bet.odds} odds` : '';
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 md:gap-4">
                        <button 
                          onClick={() => {
                            handlePlaceBet('steveson-petriashvili', 'steveson', odds['steveson-petriashvili']?.steveson || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/50 text-green-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-400/25 ${selectedVotes['steveson-petriashvili'] === 'steveson' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Steveson</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['steveson-petriashvili']?.steveson || '0.00'}</span>
                          </div>
                          {selectedVotes['steveson-petriashvili'] === 'steveson' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            handlePlaceBet('steveson-petriashvili', 'petriashvili', odds['steveson-petriashvili']?.petriashvili || '0.00');
                          }}
                          className={`group/btn flex-1 md:flex-none relative overflow-hidden bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 border border-indigo-500/50 text-indigo-300 hover:text-white px-5 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/25 ${selectedVotes['steveson-petriashvili'] === 'petriashvili' ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : ''}`}
                        >
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="text-sm md:text-base">Petriashvili</span>
                            <span className="text-lg md:text-xl font-black text-yellow-400">{odds['steveson-petriashvili']?.petriashvili || '0.00'}</span>
                          </div>
                          {selectedVotes['steveson-petriashvili'] === 'petriashvili' && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">✓</div>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Sentiment Analysis */}
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
                        {getTotalWCInPool('steveson-petriashvili').toLocaleString()} WC in pool
                      </span>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        LIVE
                      </span>
                    </div>
                  </div>
                  
                  {/* Enhanced Sentiment Bar */}
                  <div className="sentiment-bar-container mb-4 h-3 rounded-full overflow-hidden bg-slate-800/50 border border-slate-700/50">
                    <div 
                      className="sentiment-bar-fill h-full"
                      style={{ 
                        width: `${getPercentage('steveson-petriashvili', 'steveson')}%`,
                        background: 'linear-gradient(90deg, #10b981, #22c55e)',
                        boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
                      }}
                    ></div>
                    <div 
                      className="sentiment-bar-fill h-full absolute top-0"
                      style={{ 
                        width: `${getPercentage('steveson-petriashvili', 'petriashvili')}%`,
                        background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                        right: 0,
                        left: 'auto'
                      }}
                    ></div>
                  </div>
                  
                  {/* Enhanced Sentiment Stats */}
                  <div className="flex flex-col md:flex-row justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
                      <span className="text-slate-300 font-medium">Steveson</span>
                      <span className="font-bold text-yellow-400">{getPercentage('steveson-petriashvili', 'steveson')}%</span>
                      <span className="text-xs text-slate-400">({odds['steveson-petriashvili']?.steveson || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('steveson-petriashvili', 'steveson')}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></span>
                      <span className="text-slate-300 font-medium">Petriashvili</span>
                      <span className="font-bold text-yellow-400">{getPercentage('steveson-petriashvili', 'petriashvili')}%</span>
                      <span className="text-xs text-slate-400">({odds['steveson-petriashvili']?.petriashvili || '0.00'})</span>
                      <span className="text-lg">{getCorrelationIcon('steveson-petriashvili', 'petriashvili')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Betting Modal */}
      <BettingModal
        isOpen={bettingModal.isOpen}
        onClose={closeBettingModal}
        matchId={bettingModal.matchId}
        wrestler={bettingModal.wrestler}
        odds={bettingModal.odds}
        onPlaceBet={handleConfirmBet}
      />

      {/* Purchase Modal */}
      <PurchaseWCModal 
        isOpen={showPurchaseModal} 
        onClose={() => setShowPurchaseModal(false)} 
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default FrontPage;
