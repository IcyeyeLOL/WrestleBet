"use client";
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useGlobalState } from '../contexts/GlobalStateContext';
import { useUser } from '@clerk/nextjs';
import Navigation from './Navigation';
import globalStorage from '../lib/globalStorage';
import { supabase } from '../../lib/supabase';
import { APP_CONFIG, ANIMATION_DELAYS } from '../lib/constants';
import '../styles/front-page.css';
import '../styles/match-cards.css';
import '../styles/simplified.css';

// Lazy load heavy components
const BettingModal = lazy(() => import('./BettingModal'));
const PurchaseWCModal = lazy(() => import('./PurchaseWCModal'));
const AuthModal = lazy(() => import('./AuthModal'));
const BettingNotificationSystem = lazy(() => import('./BettingNotification').then(module => ({ default: module.BettingNotificationSystem })));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
  </div>
);

// Hero Section Component
const HeroSection = React.memo(() => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 hero-gradient"></div>
    <div className="absolute inset-0 hero-radial"></div>
    <div className="absolute inset-0 grid-pattern opacity-10"></div>
    
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <h1 className="hero-title animate-fadeInUp">
        Welcome to {APP_CONFIG.name}
      </h1>
      <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: `${ANIMATION_DELAYS.hero.subtitle}ms` }}>
        {APP_CONFIG.tagline}
      </p>
      <div className="mt-8 animate-fadeInUp" style={{ animationDelay: `${ANIMATION_DELAYS.hero.features}ms` }}>
        <div className="inline-flex items-center px-6 py-3 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 rounded-full">
          <span className="text-yellow-400 font-semibold">{APP_CONFIG.features.join(' • ')}</span>
        </div>
      </div>
    </div>
  </section>
));

// Match Card Component
const MatchCard = React.memo(({ match, onBet, onVote, getWrestlerTheme, getMatchCardTheme, getPercentage, getTotalWCInPool, getThemeColors, isSignedIn, canAffordBet }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleVoteClick = useCallback((wrestler) => {
    if (!isSignedIn) return;
    setIsAnimating(true);
    onVote(match.id, wrestler);
    setTimeout(() => setIsAnimating(false), 1000);
  }, [match.id, onVote, isSignedIn]);

  const handleBetClick = useCallback((wrestler) => {
    console.log('🎯 Bet button clicked:', { wrestler, matchId: match.id, isSignedIn, canAfford: canAffordBet(10) });
    if (!isSignedIn || !canAffordBet(10)) {
      console.log('❌ Bet blocked:', { isSignedIn, canAfford: canAffordBet(10) });
      return;
    }
    console.log('✅ Calling onBet with:', match.id, wrestler, '1.50');
    onBet(match.id, wrestler, '1.50');
  }, [match.id, onBet, isSignedIn, canAffordBet]);

  const wrestler1Theme = getWrestlerTheme(match.wrestler1, match.id, 'wrestler1');
  const wrestler2Theme = getWrestlerTheme(match.wrestler2, match.id, 'wrestler2');
  const matchCardTheme = getMatchCardTheme(match.id);
  
  console.log(`🎨 Match ${match.id} themes:`, {
    wrestler1: match.wrestler1,
    wrestler1Theme,
    wrestler2: match.wrestler2,
    wrestler2Theme,
    different: wrestler1Theme !== wrestler2Theme
  });

  return (
    <div className={`match-card-enhanced ${matchCardTheme} ${isAnimating ? 'animate-pulse' : ''}`}>
      <div className="match-header-enhanced">
        <div>
          <h3 className="match-title-enhanced">{match.wrestler1} vs {match.wrestler2}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="match-event-enhanced px-3 py-1 text-xs font-medium text-yellow-400">
              {match.event_name || 'Championship Match'}
            </span>
            <span className="weight-class-badge px-3 py-1 text-xs text-gray-300">
              {match.weight_class || 'Open Weight'}
            </span>
            <div className="live-indicator-enhanced">
              <div className="live-dot-enhanced"></div>
              <span>LIVE BETTING</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Total Pool</div>
          <div className="text-2xl font-bold text-yellow-400">
            {getTotalWCInPool(match.id)} WC
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Live betting active
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between my-6">
        {/* Wrestler 1 */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`wrestler-avatar-themed ${wrestler1Theme}`}>
            {match.wrestler1.charAt(0)}
          </div>
          <div className="text-center">
            <h4 className={`wrestler-name-themed ${wrestler1Theme}`}>{match.wrestler1}</h4>
            <p className="text-sm text-gray-400 mt-1">
              {getPercentage(match.id, 'wrestler1')}% • {getTotalWCInPool(match.id)} WC Pool
            </p>
            <div className="mt-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-600/50">
              <span className="text-xs font-bold text-yellow-400">
                {match.odds_wrestler1 || '2.0'}x Odds
              </span>
            </div>
          </div>
          <button
            onClick={() => handleBetClick('wrestler1')}
            className={`btn-wrestler-themed ${wrestler1Theme} ${!isSignedIn || !canAffordBet(10) ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-300 hover:animate-betting-pulse`}
            disabled={!isSignedIn || !canAffordBet(10)}
            style={{
              background: `linear-gradient(135deg, ${getThemeColors(wrestler1Theme).primary}, ${getThemeColors(wrestler1Theme).light})`,
              boxShadow: `0 8px 25px ${getThemeColors(wrestler1Theme).primary}40, inset 0 2px 0 rgba(255,255,255,0.3)`
            }}
          >
            <span className="relative z-10">Bet 10 WC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* VS Section */}
        <div className="vs-section-enhanced">
          <div className="vs-text-enhanced">VS</div>
        </div>

        {/* Wrestler 2 */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`wrestler-avatar-themed ${wrestler2Theme}`}>
            {match.wrestler2.charAt(0)}
          </div>
          <div className="text-center">
            <h4 className={`wrestler-name-themed ${wrestler2Theme}`}>{match.wrestler2}</h4>
            <p className="text-sm text-gray-400 mt-1">
              {getPercentage(match.id, 'wrestler2')}% • {getTotalWCInPool(match.id)} WC Pool
            </p>
            <div className="mt-2 px-3 py-1 bg-gray-800/50 rounded-full border border-gray-600/50">
              <span className="text-xs font-bold text-yellow-400">
                {match.odds_wrestler2 || '2.0'}x Odds
              </span>
            </div>
          </div>
          <button
            onClick={() => handleBetClick('wrestler2')}
            className={`btn-wrestler-themed ${wrestler2Theme} ${!isSignedIn || !canAffordBet(10) ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-300 hover:animate-betting-pulse`}
            disabled={!isSignedIn || !canAffordBet(10)}
            style={{
              background: `linear-gradient(135deg, ${getThemeColors(wrestler2Theme).primary}, ${getThemeColors(wrestler2Theme).light})`,
              boxShadow: `0 8px 25px ${getThemeColors(wrestler2Theme).primary}40, inset 0 2px 0 rgba(255,255,255,0.3)`
            }}
          >
            <span className="relative z-10">Bet 10 WC</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Sentiment Analysis - Merged Bar */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className={`wrestler-name-themed ${wrestler1Theme}`}>{match.wrestler1}</span>
          <span className={`wrestler-name-themed ${wrestler2Theme}`}>{match.wrestler2}</span>
        </div>
        <div className="sentiment-bar-themed relative h-6 rounded-full overflow-hidden">
          {/* Single merged bar with dynamic theme colors and animations */}
          <div 
            className="absolute top-0 left-0 h-full w-full transition-all duration-1000 ease-out"
            style={{
              background: `linear-gradient(to right, 
                ${getThemeColors(wrestler1Theme).primary} 0%, 
                ${getThemeColors(wrestler1Theme).primary} ${getPercentage(match.id, 'wrestler1')}%, 
                ${getThemeColors(wrestler2Theme).primary} ${getPercentage(match.id, 'wrestler1')}%, 
                ${getThemeColors(wrestler2Theme).primary} 100%)`,
              boxShadow: `0 0 20px ${getThemeColors(wrestler1Theme).primary}40, 0 0 20px ${getThemeColors(wrestler2Theme).primary}40`
            }}
          >
            {/* Animated shimmer effect */}
            <div 
              className="absolute top-0 left-0 h-full w-full opacity-30"
              style={{
                background: `linear-gradient(90deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.4) 50%, 
                  transparent 100%)`,
                animation: 'shimmer 2s infinite'
              }}
            ></div>
          </div>
          
          {/* Percentage labels on the bar */}
          {getPercentage(match.id, 'wrestler1') > 15 && (
            <div 
              className="absolute top-1/2 left-2 transform -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg"
              style={{ left: `${getPercentage(match.id, 'wrestler1') / 2}%` }}
            >
              {getPercentage(match.id, 'wrestler1')}%
            </div>
          )}
          {getPercentage(match.id, 'wrestler2') > 15 && (
            <div 
              className="absolute top-1/2 right-2 transform -translate-y-1/2 text-xs font-bold text-white drop-shadow-lg"
              style={{ right: `${getPercentage(match.id, 'wrestler2') / 2}%` }}
            >
              {getPercentage(match.id, 'wrestler2')}%
            </div>
          )}
        </div>
      </div>

    </div>
  );
});

// Matches Section Component
const MatchesSection = React.memo(({ 
  dynamicMatches, 
  matchesLoading, 
  onBet, 
  onVote, 
  getWrestlerTheme, 
  getMatchCardTheme, 
  getPercentage, 
  getTotalWCInPool, 
  getThemeColors,
  isSignedIn, 
  canAffordBet,
  onOpenAuth
}) => (
  <section className="py-20 px-4" style={{backgroundColor: '#3a3a5c'}}>
    <div className="max-w-6xl mx-auto">
      <h2 className="text-center text-4xl md:text-5xl font-bold mb-16 text-yellow-400">
        Hot Matches This Week
      </h2>
      
      {/* Login Required Message */}
      {!isSignedIn ? (
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="text-8xl mb-6">🔐</div>
            <h3 className="text-3xl font-bold text-yellow-400 mb-4">Sign In Required</h3>
            <p className="text-gray-300 mb-6 text-lg">
              You need to be signed in to view and participate in wrestling matches!
            </p>
            <p className="text-gray-400 mb-8">
              Join WrestleBet to place bets, vote on matches, and track your WrestleCoin balance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenAuth('signin')}
                className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Up
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              <p>✨ Free to join • 🎯 Start with 1000 WrestleCoins • 🏆 Compete for prizes</p>
            </div>
          </div>
        </div>
      ) : matchesLoading ? (
        <LoadingSpinner />
      ) : dynamicMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dynamicMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onBet={onBet}
              onVote={onVote}
              getWrestlerTheme={getWrestlerTheme}
              getMatchCardTheme={getMatchCardTheme}
              getPercentage={getPercentage}
              getTotalWCInPool={getTotalWCInPool}
              getThemeColors={getThemeColors}
              isSignedIn={isSignedIn}
              canAffordBet={canAffordBet}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl">
          <div className="text-6xl mb-6">🏆</div>
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">No Matches Available</h3>
          <p className="text-gray-300 mb-4">
            No upcoming matches have been created yet. Check back soon for new wrestling events!
          </p>
          <p className="text-sm text-gray-400">
            Admins can create new matches through the admin panel.
          </p>
        </div>
      )}
    </div>
  </section>
));

// Main FrontPage Component
const FrontPageOptimized = () => {
  // Global state
  const {
    matches: dynamicMatches,
    bets,
    bettingPools,
    userBalance,
    notifications,
    loading: globalLoading,
    addNotification,
    removeNotification,
    placeBet,
    loadMatches,
    isLoaded,
    user
  } = useGlobalState();
  
  const { 
    selectedVotes, 
    handleVote: contextHandleVote, 
    placeBetFromVote, 
    pollData, 
    odds,
    loading 
  } = useBetting();
  
  const { 
    balance, 
    canAffordBet, 
    subtractFromBalance, 
    getFormattedBalance 
  } = useCurrency();

  const { isSignedIn } = useUser();
  
  // Local UI state only
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

  // Wrestler theme assignment function - randomized colors with collision avoidance
  const getWrestlerTheme = useCallback((wrestlerName, matchId, wrestlerPosition) => {
    // Create a unique key for this wrestler
    const wrestlerKey = wrestlerName.toLowerCase().trim();
    
    // Available color themes - expanded color wheel
    const themes = [
      'wrestler-theme-blue', 
      'wrestler-theme-green', 
      'wrestler-theme-purple', 
      'wrestler-theme-orange', 
      'wrestler-theme-pink', 
      'wrestler-theme-cyan',
      'wrestler-theme-red',
      'wrestler-theme-indigo',
      'wrestler-theme-teal',
      'wrestler-theme-lime',
      'wrestler-theme-amber',
      'wrestler-theme-emerald',
      'wrestler-theme-violet',
      'wrestler-theme-rose',
      'wrestler-theme-sky',
      'wrestler-theme-gold'
    ];
    
    // Create a deterministic but randomized seed based on wrestler name and match
    const seed = wrestlerKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + matchId.length;
    
    // Use seed to get a random but consistent color for this wrestler
    let themeIndex = seed % themes.length;
    
    // Ensure wrestlers on the same match get different colors
    // If this is wrestler2, try to pick a different color than wrestler1
    if (wrestlerPosition === 'wrestler2') {
      // Get wrestler1's color by using the same logic
      const wrestler1Key = `${matchId}_wrestler1`;
      const wrestler1Seed = wrestler1Key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + matchId.length;
      const wrestler1ThemeIndex = wrestler1Seed % themes.length;
      
      // If wrestler2 would get the same color, pick the next available one
      if (themeIndex === wrestler1ThemeIndex) {
        themeIndex = (wrestler1ThemeIndex + 1) % themes.length;
      }
    }
    
    const selectedTheme = themes[themeIndex];
    
    console.log(`🎨 Randomized color assignment: ${wrestlerName} (${wrestlerPosition}) → ${selectedTheme} (seed: ${seed})`);
    
    return selectedTheme;
  }, []);

  // Memoized utility functions
  const utilityFunctions = useMemo(() => ({

    getThemeColors: (theme) => {
      const colorMap = {
        'wrestler-theme-blue': { primary: '#3b82f6', light: '#60a5fa' },
        'wrestler-theme-green': { primary: '#10b981', light: '#34d399' },
        'wrestler-theme-purple': { primary: '#8b5cf6', light: '#a78bfa' },
        'wrestler-theme-orange': { primary: '#f97316', light: '#fb923c' },
        'wrestler-theme-pink': { primary: '#ec4899', light: '#f472b6' },
        'wrestler-theme-cyan': { primary: '#06b6d4', light: '#22d3ee' },
        'wrestler-theme-red': { primary: '#ef4444', light: '#f87171' },
        'wrestler-theme-indigo': { primary: '#6366f1', light: '#818cf8' },
        'wrestler-theme-teal': { primary: '#14b8a6', light: '#5eead4' },
        'wrestler-theme-lime': { primary: '#84cc16', light: '#a3e635' },
        'wrestler-theme-amber': { primary: '#f59e0b', light: '#fbbf24' },
        'wrestler-theme-emerald': { primary: '#059669', light: '#34d399' },
        'wrestler-theme-violet': { primary: '#7c3aed', light: '#a78bfa' },
        'wrestler-theme-rose': { primary: '#e11d48', light: '#fb7185' },
        'wrestler-theme-sky': { primary: '#0ea5e9', light: '#38bdf8' },
        'wrestler-theme-gold': { primary: '#eab308', light: '#fde047' }
      };
      return colorMap[theme] || { primary: '#8b5cf6', light: '#a78bfa' };
    },
    
    getMatchCardTheme: (matchId) => {
      const themes = ['match-card-blue', 'match-card-green', 'match-card-purple', 'match-card-orange', 'match-card-pink', 'match-card-cyan'];
      const hash = matchId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      return themes[hash % themes.length];
    },
    
    getPercentage: (matchId, wrestler) => {
      const match = dynamicMatches.find(m => m.id === matchId);
      if (!match) {
        console.log(`⚠️ No match found for ${matchId}`);
        return 50;
      }
      
      // Calculate percentages from betting pools to ensure accuracy
      const wrestler1Pool = match.wrestler1_pool || 0;
      const wrestler2Pool = match.wrestler2_pool || 0;
      const totalPool = wrestler1Pool + wrestler2Pool;
      
      console.log(`📊 Match ${matchId} pools:`, { wrestler1Pool, wrestler2Pool, totalPool });
      
      if (totalPool > 0) {
        if (wrestler === 'wrestler1') {
          const percentage = Math.round((wrestler1Pool / totalPool) * 100);
          console.log(`📈 ${wrestler} percentage: ${percentage}%`);
          return percentage;
        } else if (wrestler === 'wrestler2') {
          // Ensure percentages add up to exactly 100%
          const wrestler1Percentage = Math.round((wrestler1Pool / totalPool) * 100);
          const wrestler2Percentage = 100 - wrestler1Percentage;
          console.log(`📈 ${wrestler} percentage: ${wrestler2Percentage}% (calculated to ensure 100% total)`);
          return wrestler2Percentage;
        }
      } else {
        // If no betting data, check if API provided percentages
        if (wrestler === 'wrestler1') {
          const apiPercentage = match.wrestler1_percentage || 50;
          console.log(`📈 Using API percentage for ${wrestler}: ${apiPercentage}%`);
          return apiPercentage;
        } else if (wrestler === 'wrestler2') {
          const apiPercentage = match.wrestler2_percentage || 50;
          console.log(`📈 Using API percentage for ${wrestler}: ${apiPercentage}%`);
          return apiPercentage;
        }
      }
      
      // Default to 50-50 if no betting data
      console.log(`📊 No betting data for ${matchId}, using 50-50 default`);
      return 50;
    },
    
    getTotalWCInPool: (matchId) => {
      const match = dynamicMatches.find(m => m.id === matchId);
      if (!match) return 0;
      return match.total_pool || 0;
    }
  }), [dynamicMatches]);

  // Global state handles all data loading automatically

  // Global state handles all real-time sync automatically

  // Event handlers
  const handleBet = useCallback((matchId, wrestler, odds) => {
    console.log('🎯 handleBet called:', { matchId, wrestler, odds, isSignedIn, canAfford: canAffordBet(10) });
    
    if (!isSignedIn) {
      console.log('❌ Not signed in, opening auth modal');
      addNotification('Please sign in to place bets', 'warning');
      setAuthModal({ isOpen: true, mode: 'signin', triggeredBy: 'betting' });
      return;
    }
    
    if (!canAffordBet(10)) {
      console.log('❌ Cannot afford bet, opening purchase modal');
      addNotification('Insufficient WrestleCoins! Purchase more to continue betting', 'error');
      setShowPurchaseModal(true);
      return;
    }
    
    console.log('✅ Opening betting modal');
    addNotification('Opening betting modal...', 'info', 2000);
    setBettingModal({
      isOpen: true,
      matchId,
      wrestler,
      odds
    });
  }, [isSignedIn, canAffordBet, addNotification]);

  const handleVote = useCallback((matchId, wrestler) => {
    if (!isSignedIn) {
      setAuthModal({ isOpen: true, mode: 'signin', triggeredBy: 'voting' });
      return;
    }
    
    contextHandleVote(matchId, wrestler);
  }, [isSignedIn, contextHandleVote]);

  const handleOpenAuth = useCallback((mode) => {
    setAuthModal({ isOpen: true, mode, triggeredBy: 'matches' });
  }, []);

  return (
    <div className="bg-gradient-wrestlebet min-h-screen">
      <Navigation />
      
      <HeroSection />
      
      <MatchesSection
        dynamicMatches={dynamicMatches}
        matchesLoading={globalLoading.matches}
        onBet={handleBet}
        onVote={handleVote}
        getWrestlerTheme={getWrestlerTheme}
        getMatchCardTheme={utilityFunctions.getMatchCardTheme}
        getPercentage={utilityFunctions.getPercentage}
        getTotalWCInPool={utilityFunctions.getTotalWCInPool}
        getThemeColors={utilityFunctions.getThemeColors}
        isSignedIn={isSignedIn}
        canAffordBet={canAffordBet}
        onOpenAuth={handleOpenAuth}
      />

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner />}>
        {bettingModal.isOpen && (
          <BettingModal
            isOpen={bettingModal.isOpen}
            onClose={() => setBettingModal({ isOpen: false, matchId: '', wrestler: '', odds: '' })}
            matchId={bettingModal.matchId}
            wrestler={bettingModal.wrestler}
            odds={bettingModal.odds}
            onPlaceBet={placeBetFromVote}
          />
        )}
        
        {showPurchaseModal && (
          <PurchaseWCModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            currentBalance={balance}
            onBalanceUpdate={() => {}}
          />
        )}
        
        {authModal.isOpen && (
          <AuthModal
            isOpen={authModal.isOpen}
            onClose={() => setAuthModal({ isOpen: false, mode: 'signin', triggeredBy: null })}
            mode={authModal.mode}
            triggeredBy={authModal.triggeredBy}
          />
        )}
      </Suspense>

      {/* Notification System */}
      <Suspense fallback={null}>
        <BettingNotificationSystem 
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />
      </Suspense>
    </div>
  );
};

export default FrontPageOptimized;