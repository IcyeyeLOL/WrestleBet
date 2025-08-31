"use client";
import React, { useState, useEffect } from 'react';
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useUser } from '@clerk/nextjs';
import SharedHeader from './SharedHeader';
import BettingModal from './BettingModal';
import PurchaseWCModal from './PurchaseWCModal';
import AuthModal from './AuthModal';
import globalStorage from '../lib/globalStorage';
import { supabase } from '../../lib/supabase';

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
  
  const { 
    balance, 
    canAffordBet, 
    subtractFromBalance, 
    getFormattedBalance 
  } = useCurrency();

  const { isSignedIn, isLoaded } = useUser();
  
  // Dynamic matches state - now loaded from database
  const [dynamicMatches, setDynamicMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  
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
    triggeredBy: null
  });

  // Animation state for color bars
  const [animatedMatches, setAnimatedMatches] = useState(new Set());

  // Real-time sync status
  const [syncStatus, setSyncStatus] = useState('connecting');

  // Load dynamic matches from database with real-time sync
  useEffect(() => {
    loadDynamicMatches();
    setupRealTimeSync();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (matchesLoading) {
        console.log('⏰ Matches loading timeout - proceeding with empty state');
        setMatchesLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  // Load matches from database with real-time updates
  useEffect(() => {
    loadDynamicMatches();
    
    // Set up real-time subscription for match updates
    const matchSubscription = supabase
      .channel('match_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches'
      }, (payload) => {
        console.log('🔄 Real-time match update:', payload);
        // Reload matches when any match is updated
        loadDynamicMatches();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'bets'
      }, (payload) => {
        console.log('💰 Real-time bet update:', payload);
        // Reload matches when bets change to update pools/odds
        setTimeout(() => loadDynamicMatches(), 500); // Small delay for database trigger
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchSubscription);
    };
  }, []);

  // Load matches from database (fully dynamic - no hardcoded data)
  const loadDynamicMatches = async () => {
    try {
      setMatchesLoading(true);
      
      // Use simplified query approach
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        setDynamicMatches([]);
        return;
      }
      
      const matches = data || [];
      console.log(`📊 Raw matches from database:`, matches);

      // CRITICAL: Filter out any potential hardcoded matches
      const validMatches = matches.filter(match => {
        // Only allow matches that have valid database IDs and were created through admin
        const hasValidId = match.id && match.id.length > 10; // UUIDs are longer than 10 chars
        const hasValidWrestlers = match.wrestler1 && match.wrestler2;
        const isNotHardcoded = !isHardcodedMatch(match);
        
        if (!hasValidId || !hasValidWrestlers || !isNotHardcoded) {
          console.log('🚫 Filtering out potentially hardcoded match:', match);
          return false;
        }
        
        return true;
      });

      // Enrich matches with betting data
      const enrichedMatches = await Promise.all(validMatches.map(async (match) => {
        try {
          // Load bets for this match
          const { data: bets } = await supabase
            .from('bets')
            .select('*')
            .eq('match_id', match.id);

          // Calculate pools and odds
          const wrestler1Bets = bets?.filter(bet => bet.wrestler_choice === 'wrestler1') || [];
          const wrestler2Bets = bets?.filter(bet => bet.wrestler_choice === 'wrestler2') || [];

          const wrestler1Pool = wrestler1Bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
          const wrestler2Pool = wrestler2Bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
          const totalPool = wrestler1Pool + wrestler2Pool;

          // Calculate odds with database values as backup
          const odds1 = wrestler1Pool > 0 ? Math.max(1.10, totalPool / wrestler1Pool) : (match.odds_wrestler1 || 1.10);
          const odds2 = wrestler2Pool > 0 ? Math.max(1.10, totalPool / wrestler2Pool) : (match.odds_wrestler2 || 1.10);

          return {
            ...match,
            total_pool: totalPool || match.total_pool || 0,
            odds_wrestler1: odds1,
            odds_wrestler2: odds2,
            enriched: true
          };

        } catch (enrichError) {
          console.warn(`⚠️ Error enriching match ${match.id}:`, enrichError);
          return {
            ...match,
            total_pool: match.total_pool || 0,
            odds_wrestler1: match.odds_wrestler1 || 1.10,
            odds_wrestler2: match.odds_wrestler2 || 1.10,
            enriched: false
          };
        }
      }));
      
      setDynamicMatches(enrichedMatches);
      
      if (enrichedMatches.length === 0) {
        console.log('📋 No valid matches found - create matches using admin panel');
        console.log('🔗 Admin panel: /admin');
      } else {
        console.log('✅ Loaded valid dynamic matches from database:', enrichedMatches.length, 'matches');
        console.log('📊 Match data with pools:', enrichedMatches.map(m => ({
          id: m.id,
          wrestlers: `${m.wrestler1} vs ${m.wrestler2}`,
          pool: m.total_pool,
          odds: `${m.odds_wrestler1} / ${m.odds_wrestler2}`,
          enriched: m.enriched
        })));
      }
      
    } catch (error) {
      console.error('❌ Error loading dynamic matches:', error);
      setDynamicMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  };

  // Function to detect hardcoded matches
  const isHardcodedMatch = (match) => {
    const hardcodedNames = [
      'sarah wilson', 'emma davis', 'alex thompson', 'chris brown',
      'david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia',
      'gable steveson', 'geno petriashvili'
    ];
    
    const wrestler1Lower = (match.wrestler1 || '').toLowerCase();
    const wrestler2Lower = (match.wrestler2 || '').toLowerCase();
    
    return hardcodedNames.some(name => 
      wrestler1Lower.includes(name) || wrestler2Lower.includes(name)
    );
  };

  // Setup real-time sync for global updates
  const setupRealTimeSync = () => {
    const subscription = supabase
      .channel('global-matches-sync')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('🔄 Real-time match update:', payload);
          handleMatchUpdate(payload);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bets' },
        (payload) => {
          console.log('💰 Real-time betting update:', payload);
          handleBettingUpdate(payload);
        }
      )
      .subscribe((status) => {
        setSyncStatus(status);
        console.log('📡 Real-time sync status:', status);
      });

    return () => subscription.unsubscribe();
  };

  // Handle real-time match updates
  const handleMatchUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setDynamicMatches(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setDynamicMatches(prev => 
        prev.map(match => 
          match.id === payload.new.id ? payload.new : match
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setDynamicMatches(prev => 
        prev.filter(match => match.id !== payload.old.id)
      );
    }
  };

  // Handle real-time betting updates
  const handleBettingUpdate = (payload) => {
    // Trigger animation for updated matches
    const matchId = payload.new?.match_id || payload.old?.match_id;
    if (matchId) {
      setAnimatedMatches(prev => new Set([...prev, matchId]));
      setTimeout(() => {
        setAnimatedMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(matchId);
          return newSet;
        });
      }, 3000);
    }
  };

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
        
        const url = new URL(window.location);
        url.searchParams.delete('auth');
        window.history.replaceState({}, '', url);
      }
    }
  }, []);

  // Enhanced useEffect for real-time updates
  useEffect(() => {
    console.log('🎨 Real-time betting pools updated:', bettingPools);
    
    // Trigger animation for matches that have updated pools
    Object.keys(bettingPools).forEach(matchId => {
      if (bettingPools[matchId] && (bettingPools[matchId].wrestler1 > 0 || bettingPools[matchId].wrestler2 > 0)) {
        setAnimatedMatches(prev => new Set([...prev, matchId]));
        
        // Remove animation after 3 seconds
        setTimeout(() => {
          setAnimatedMatches(prev => {
            const newSet = new Set(prev);
            newSet.delete(matchId);
            return newSet;
          });
        }, 3000);
      }
    });
  }, [bettingPools]);

  // Watch for odds changes and trigger re-renders
  useEffect(() => {
    console.log('📊 Real-time odds updated:', odds);
  }, [odds]);

  const handleVoteWithPoll = (matchId, wrestler) => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      setAuthModal({
        isOpen: true,
        mode: 'signin',
        triggeredBy: { action: 'vote', matchId, wrestler }
      });
      return;
    }

    handleVote(matchId, wrestler);
  };

  const handlePlaceBet = (matchId, wrestler, currentOdds) => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      setAuthModal({
        isOpen: true,
        mode: 'signin',
        triggeredBy: { action: 'bet', matchId, wrestler, odds: currentOdds }
      });
      return;
    }

    const existingBet = bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
    if (existingBet) {
      alert(`❌ You already have a pending bet on this match!\n\n${existingBet.wrestler}: ${existingBet.amount} WC at ${existingBet.odds} odds`);
      return;
    }
    
    if (balance < 10) {
      alert(`❌ Insufficient Balance!\n\nYour balance: ${getFormattedBalance()}\nMinimum bet: 10 WC\n\nPlease add more WrestleCoins to your account.`);
      return;
    }
    
    setBettingModal({
      isOpen: true,
      matchId,
      wrestler,
      odds: currentOdds
    });
  };

  const handleConfirmBet = (amount) => {
    const { matchId, wrestler, odds: betOdds } = bettingModal;
    
    // Check if user can afford the bet
    if (!canAffordBet(amount)) {
      alert(`❌ Insufficient Balance!\n\nYour balance: ${getFormattedBalance()}\nBet amount: ${amount} WC`);
      return;
    }
    
    // Deduct balance and place bet
    subtractFromBalance(amount, `Bet on ${wrestler}`);
    placeBetFromVote(matchId, wrestler, betOdds, amount);
    alert(`✅ Bet Placed Successfully!\n\n${wrestler}: ${amount} WC at ${betOdds} odds\nPotential Payout: ${Math.floor(amount * parseFloat(betOdds))} WC\nRemaining Balance: ${getFormattedBalance()}`);
  };

  // Real WC percentage calculation based on actual betting pools from database
  const getPercentage = (matchId, wrestlerPosition) => {
    console.log(`🔍 getPercentage called for ${matchId} - ${wrestlerPosition}`);
    
    // Find the match in our dynamic matches
    const match = dynamicMatches.find(m => m.id === matchId);
    if (!match) {
      console.log(`⚠️ Match not found for ${matchId}, returning 50%`);
      return 50;
    }
    
    // Use real total pool from database
    const totalWC = match.total_pool || 0;
    
    console.log(`📊 Real pool data for ${matchId}:`, {
      total_pool: totalWC,
      odds_wrestler1: match.odds_wrestler1,
      odds_wrestler2: match.odds_wrestler2
    });
    
    if (!totalWC || totalWC === 0) {
      console.log(`⚠️ No real WC in pool for ${matchId}: ${totalWC}, returning 50%`);
      return 50;
    }
    
    // Calculate percentage based on odds (inverse relationship)
    let percentage = 50; // Default
    
    if (wrestlerPosition === 'wrestler1') {
      const odds = parseFloat(match.odds_wrestler1) || 1.0;
      percentage = Math.round((1 / odds) * 100);
    } else if (wrestlerPosition === 'wrestler2') {
      const odds = parseFloat(match.odds_wrestler2) || 1.0;
      percentage = Math.round((1 / odds) * 100);
    }
    
    console.log(`📊 Real percentage calculation for ${matchId} - ${wrestlerPosition}:`, {
      totalWC,
      odds: wrestlerPosition === 'wrestler1' ? match.odds_wrestler1 : match.odds_wrestler2,
      percentage
    });
    
    // Ensure percentage is valid and within bounds
    if (isNaN(percentage) || percentage < 0) {
      console.log(`⚠️ Invalid percentage calculated: ${percentage}, returning 50%`);
      return 50;
    }
    
    if (percentage === 0) {
      console.log(`⚠️ Calculated 0% for ${wrestlerPosition}, returning 1% for visual feedback`);
      return 1;
    }
    
    if (percentage > 99) {
      console.log(`⚠️ Calculated ${percentage}% for ${wrestlerPosition}, capping at 99%`);
      return 99;
    }
    
    return percentage;
  };

  const getTotalWCInPool = (matchId) => {
    // Get real WC from database match
    const match = dynamicMatches.find(m => m.id === matchId);
    if (!match) {
      return 0;
    }
    return match.total_pool || 0;
  };

  const hasAlreadyBet = (matchId) => {
    return bets.some(bet => bet.matchId === matchId && bet.status === 'pending');
  };

  const getExistingBet = (matchId) => {
    return bets.find(bet => bet.matchId === matchId && bet.status === 'pending');
  };

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

  // Get real dynamic odds from database
  const getDynamicOdds = (matchId, wrestler) => {
    console.log(`🔍 getDynamicOdds called for ${matchId} - ${wrestler}`);
    
    // Find the match in our dynamic matches
    const match = dynamicMatches.find(m => m.id === matchId);
    if (!match) {
      console.log(`⚠️ Match not found for ${matchId}, returning 2.00`);
      return '2.00';
    }
    
    // Use real odds from database
    let odds = '2.00'; // Default
    
    if (wrestler === 'wrestler1') {
      odds = (match.odds_wrestler1 || 2.0).toString();
    } else if (wrestler === 'wrestler2') {
      odds = (match.odds_wrestler2 || 2.0).toString();
    }
    
    console.log(`✅ Real odds for ${wrestler} in ${matchId}: ${odds}`);
    return odds;
  };

  if (!isLoaded) {
    return (
      <div className="font-inter overflow-x-hidden text-white">
        <SharedHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400">Initializing authentication...</p>
            {syncStatus && (
              <p className="text-blue-400 text-sm mt-2">
                Sync Status: {syncStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter overflow-x-hidden text-white">
      <SharedHeader 
        onTogglePurchaseModal={() => setShowPurchaseModal(!showPurchaseModal)}
        showPurchaseModal={showPurchaseModal}
      />
      
      {showPurchaseModal && (
        <PurchaseWCModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-6 text-yellow-400">
                Elite Wrestling
                <br />
            <span className="text-3xl md:text-5xl lg:text-7xl text-white">Betting Experience</span>
              </h1>
          <p className="text-lg md:text-xl mb-8 text-slate-300">
            Join the ultimate destination for freestyle wrestling betting
          </p>
        </div>
      </section>

      {/* Matches Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-yellow-400">
                  Hot Matches This Week
              </h2>
            </div>
            
                     {/* Dynamic Match Cards */}
           <div className="space-y-4">
             {dynamicMatches.length === 0 ? (
               <div className="text-center py-12">
                 <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-600/30">
                   <div className="text-6xl mb-4">🏆</div>
                   <h3 className="text-2xl font-bold text-yellow-400 mb-4">No Matches Available</h3>
                   <p className="text-slate-300 mb-6">
                     No upcoming matches have been created yet. Check back soon for new wrestling events!
                   </p>
                   <div className="text-sm text-slate-400">
                     Admins can create new matches through the admin panel.
                   </div>
                 </div>
               </div>
             ) : (
               dynamicMatches.map((match) => {
              const getInitials = (name) => {
                return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
              };
              
                             // Use position-based keys to avoid conflicts when wrestlers have same name
               const wrestler1Key = 'wrestler1';
               const wrestler2Key = 'wrestler2';
              
              return (
                <div key={match.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-600/30">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-center justify-center lg:justify-start gap-4 p-3">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            {getInitials(match.wrestler1)}
                          </div>
                          <span className="text-slate-300 font-semibold text-sm">{match.wrestler1}</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-yellow-400 text-xs font-bold px-3 py-1 bg-yellow-400/20 rounded-full mb-1">{match.weight_class}</span>
                          <span className="text-slate-400 font-bold text-sm">VS</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white font-black text-sm mb-2">
                            {getInitials(match.wrestler2)}
                          </div>
                          <span className="text-slate-300 font-semibold text-sm">{match.wrestler2}</span>
                      </div>
                    </div>
                    
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-slate-400 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span>{match.match_date ? new Date(match.match_date).toLocaleDateString() : 'TBD'}</span>
                      </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span>{match.event_name}</span>
                      </div>
                    </div>
                  </div>
                  
                    {/* Betting Buttons */}
                    <div className="w-full lg:w-auto">
                      {hasAlreadyBet(match.id) ? (
                        <div className="text-center">
                          <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-8 py-4 rounded-2xl font-bold shadow-lg mb-3">
                          ✅ Bet Placed Successfully
                        </div>
                          <div className="text-sm text-slate-400 bg-slate-700/50 rounded-lg px-4 py-2">
                          {(() => {
                              const bet = getExistingBet(match.id);
                            return bet ? `${bet.wrestler}: ${bet.amount} WC at ${bet.odds} odds` : '';
                          })()}
                        </div>
                      </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button 
                            onClick={() => handlePlaceBet(match.id, wrestler1Key, getDynamicOdds(match.id, wrestler1Key))}
                            className="flex-1 bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-400/25 active:scale-95 touch-manipulation"
                          >
                            <div className="text-center">
                              <div className="text-base sm:text-lg">{match.wrestler1}</div>
                              <div className="text-xl sm:text-2xl font-black text-yellow-400">{getDynamicOdds(match.id, wrestler1Key)}</div>
                          </div>
                        </button>
                        
                        <button 
                            onClick={() => handlePlaceBet(match.id, wrestler2Key, getDynamicOdds(match.id, wrestler2Key))}
                            className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 hover:text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-400/25 active:scale-95 touch-manipulation"
                          >
                            <div className="text-center">
                              <div className="text-base sm:text-lg">{match.wrestler2}</div>
                              <div className="text-xl sm:text-2xl font-black text-yellow-400">{getDynamicOdds(match.id, wrestler2Key)}</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                                     {/* Sentiment Analysis */}
                   <div className="mt-4 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                       <span className="text-slate-200 font-bold text-base sm:text-lg">Community Sentiment</span>
                       <div className="flex items-center gap-2 sm:gap-3">
                         <span className="text-yellow-300 text-xs sm:text-sm font-bold bg-yellow-400/20 px-2 sm:px-3 py-1 rounded-full border border-yellow-400/30">
                           {getTotalWCInPool(match.id).toLocaleString()} WC in pool
                         </span>
                         {animatedMatches.has(match.id) && (
                           <span className="text-green-300 text-xs font-bold bg-green-400/20 px-2 py-1 rounded-full border border-green-400/30 animate-pulse">🔄 Live</span>
                         )}
                       </div>
                     </div>
                     
                                           {/* Single Merged Sentiment Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300 font-medium">{match.wrestler1}</span>
                          <span className="text-sm text-slate-300 font-medium">{match.wrestler2}</span>
                        </div>
                        <div className="relative bg-slate-600/50 rounded-full h-3 overflow-hidden border border-slate-500/30 shadow-inner">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out shadow-lg"
                            style={{ width: `${getPercentage(match.id, wrestler1Key)}%` }}
                          ></div>
                          <div 
                            className="absolute right-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 ease-out shadow-lg"
                            style={{ width: `${getPercentage(match.id, wrestler2Key)}%` }}
                          ></div>
                          {/* Animated pulse effect when pools are updated */}
                          {animatedMatches.has(match.id) && (
                            <div 
                              className="absolute inset-0 bg-yellow-400/30 animate-pulse rounded-full"
                              style={{ 
                                animationDuration: '1s',
                                animationIterationCount: '3'
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                     
                     {/* Percentage Display */}
                     <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                       <div className="flex items-center gap-2 sm:gap-3 bg-blue-500/10 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-blue-500/20">
                         <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full shadow-lg"></div>
                         <span className="text-slate-200 font-medium">{match.wrestler1}</span>
                         <span className="font-bold text-yellow-300 text-base sm:text-lg">{getPercentage(match.id, wrestler1Key)}%</span>
                       </div>
                       <div className="flex items-center gap-2 sm:gap-3 bg-red-500/10 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-red-500/20">
                         <span className="font-bold text-yellow-300 text-base sm:text-lg">{getPercentage(match.id, wrestler2Key)}%</span>
                         <span className="text-slate-200 font-medium">{match.wrestler2}</span>
                         <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-lg"></div>
                       </div>
                     </div>
                   </div>
                                 </div>
               );
             })
             )}
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

