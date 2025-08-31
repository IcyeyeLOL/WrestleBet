/**
 * Dynamic Match System for WrestleBet
 * This file provides utilities for managing a fully dynamic wrestling betting system
 * All matches are created through the admin panel - NO hardcoded data
 */

"use client";

import { supabase } from '../../lib/supabase';

class DynamicMatchSystem {
  constructor() {
    this.listeners = new Set();
    this.cache = new Map();
    this.realTimeChannel = null;
  }

  /**
   * Initialize the dynamic match system
   */
  async initialize() {
    console.log('🎯 Initializing Dynamic Match System...');
    
    try {
      // Clear any cached hardcoded data
      this.clearLegacyData();
      
      // Setup real-time sync
      await this.setupRealTimeSync();
      
      // Load current matches
      const matches = await this.loadMatches();
      
      console.log('✅ Dynamic Match System initialized successfully');
      console.log(`📊 Found ${matches.length} dynamic matches`);
      
      return { success: true, matches };
    } catch (error) {
      console.error('❌ Failed to initialize Dynamic Match System:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all legacy hardcoded data
   */
  clearLegacyData() {
    if (typeof window !== 'undefined') {
      // Remove old hardcoded data from localStorage
      const legacyKeys = [
        'admin_demo_matches',
        'wrestlebet_legacy_matches',
        'hardcoded_matches',
        'static_poll_data'
      ];
      
      legacyKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🧹 Cleared legacy hardcoded data');
    }
  }

  /**
   * Load all dynamic matches from database (SIMPLIFIED APPROACH)
   */
  async loadMatches(filters = {}) {
    try {
      let query = supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database error loading matches:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} matches from database`);

      // For each match, load bets and votes separately to avoid join issues
      const enrichedMatches = await this.enrichMatchDataSeparately(data || []);
      
      // Cache the results
      this.cache.set('matches', enrichedMatches);
      
      return enrichedMatches;
    } catch (error) {
      console.error('❌ Error loading dynamic matches:', error);
      // Return empty array but don't fail silently
      return [];
    }
  }

  /**
   * Enrich match data by loading bets and votes separately (more reliable)
   */
  async enrichMatchDataSeparately(matches) {
    const enrichedMatches = [];

    for (const match of matches) {
      try {
        // Load bets for this match
        const { data: bets, error: betsError } = await supabase
          .from('bets')
          .select('*')
          .eq('match_id', match.id);

        if (betsError) {
          console.warn(`⚠️ Error loading bets for match ${match.id}:`, betsError);
        }

        // Load votes for this match
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('match_id', match.id);

        if (votesError) {
          console.warn(`⚠️ Error loading votes for match ${match.id}:`, votesError);
        }

        // Calculate stats
        const matchBets = bets || [];
        const matchVotes = votes || [];

        const wrestler1Bets = matchBets.filter(bet => bet.wrestler_choice === 'wrestler1');
        const wrestler2Bets = matchBets.filter(bet => bet.wrestler_choice === 'wrestler2');

        const wrestler1Pool = wrestler1Bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
        const wrestler2Pool = wrestler2Bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
        const totalPool = wrestler1Pool + wrestler2Pool;

        // Calculate odds with minimum 1.10
        const wrestler1Odds = wrestler1Pool > 0 ? Math.max(1.10, totalPool / wrestler1Pool) : 1.10;
        const wrestler2Odds = wrestler2Pool > 0 ? Math.max(1.10, totalPool / wrestler2Pool) : 1.10;

        // Calculate vote percentages
        const wrestler1Votes = matchVotes.filter(vote => vote.wrestler_choice === 'wrestler1').length;
        const wrestler2Votes = matchVotes.filter(vote => vote.wrestler_choice === 'wrestler2').length;
        const totalVotes = wrestler1Votes + wrestler2Votes;

        const wrestler1Percentage = totalVotes > 0 ? (wrestler1Votes / totalVotes) * 100 : 50;
        const wrestler2Percentage = totalVotes > 0 ? (wrestler2Votes / totalVotes) * 100 : 50;

        enrichedMatches.push({
          ...match,
          enriched: true,
          bets: matchBets,
          votes: matchVotes,
          stats: {
            totalBets: matchBets.length,
            totalVotes: totalVotes,
            totalPool,
            wrestler1Pool,
            wrestler2Pool,
            wrestler1Odds: Number(wrestler1Odds.toFixed(2)),
            wrestler2Odds: Number(wrestler2Odds.toFixed(2)),
            wrestler1Votes,
            wrestler2Votes,
            wrestler1Percentage: Number(wrestler1Percentage.toFixed(1)),
            wrestler2Percentage: Number(wrestler2Percentage.toFixed(1))
          }
        });

      } catch (error) {
        console.warn(`⚠️ Error enriching match ${match.id}:`, error);
        // Include match even if enrichment fails
        enrichedMatches.push({
          ...match,
          enriched: false,
          stats: {
            totalBets: 0,
            totalVotes: 0,
            totalPool: 0,
            wrestler1Pool: 0,
            wrestler2Pool: 0,
            wrestler1Odds: 1.10,
            wrestler2Odds: 1.10,
            wrestler1Votes: 0,
            wrestler2Votes: 0,
            wrestler1Percentage: 50,
            wrestler2Percentage: 50
          }
        });
      }
    }

    return enrichedMatches;
  }

  /**
   * Setup real-time synchronization
   */
  async setupRealTimeSync() {
    if (this.realTimeChannel) {
      await supabase.removeChannel(this.realTimeChannel);
    }

    this.realTimeChannel = supabase
      .channel('dynamic-matches-sync')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => this.handleMatchChange(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bets' },
        (payload) => this.handleBetChange(payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        (payload) => this.handleVoteChange(payload)
      )
      .subscribe((status) => {
        console.log('📡 Real-time sync status:', status);
      });

    return this.realTimeChannel;
  }

  /**
   * Handle real-time match changes
   */
  handleMatchChange(payload) {
    console.log('🔄 Match change detected:', payload);
    
    // Notify all listeners
    this.notifyListeners('match-change', payload);
    
    // Invalidate cache
    this.cache.delete('matches');
  }

  /**
   * Handle real-time bet changes
   */
  handleBetChange(payload) {
    console.log('💰 Bet change detected:', payload);
    
    // Notify all listeners
    this.notifyListeners('bet-change', payload);
    
    // Invalidate cache
    this.cache.delete('matches');
  }

  /**
   * Handle real-time vote changes
   */
  handleVoteChange(payload) {
    console.log('🗳️ Vote change detected:', payload);
    
    // Notify all listeners
    this.notifyListeners('vote-change', payload);
    
    // Invalidate cache
    this.cache.delete('matches');
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('❌ Error notifying listener:', error);
      }
    });
  }

  /**
   * Get match by ID
   */
  async getMatch(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (error) {
        throw error;
      }

      return this.enrichMatchData([data])[0];
    } catch (error) {
      console.error('❌ Error getting match:', error);
      return null;
    }
  }

  /**
   * Get active matches only
   */
  async getActiveMatches() {
    return this.loadMatches({ status: 'active' });
  }

  /**
   * Get upcoming matches only
   */
  async getUpcomingMatches() {
    return this.loadMatches({ status: 'upcoming' });
  }

  /**
   * Get match statistics
   */
  async getSystemStats() {
    try {
      const matches = await this.loadMatches();
      
      const stats = {
        totalMatches: matches.length,
        activeMatches: matches.filter(m => m.status === 'active').length,
        upcomingMatches: matches.filter(m => m.status === 'upcoming').length,
        completedMatches: matches.filter(m => m.status === 'completed').length,
        totalBets: matches.reduce((sum, m) => sum + (m.stats?.totalBets || 0), 0),
        totalVotes: matches.reduce((sum, m) => sum + (m.stats?.totalVotes || 0), 0),
        totalPool: matches.reduce((sum, m) => sum + (m.stats?.totalPool || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
      return null;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.realTimeChannel) {
      await supabase.removeChannel(this.realTimeChannel);
    }
    
    this.listeners.clear();
    this.cache.clear();
    
    console.log('🧹 Dynamic Match System cleaned up');
  }
}

// Create and export singleton instance
const dynamicMatchSystem = new DynamicMatchSystem();

export default dynamicMatchSystem;

// Export utilities for React components
export const useDynamicMatches = () => {
  const [matches, setMatches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;

    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const matchData = await dynamicMatchSystem.loadMatches();
        
        if (mounted) {
          setMatches(matchData);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMatches();

    // Subscribe to real-time updates
    const unsubscribe = dynamicMatchSystem.subscribe((event, data) => {
      if (mounted && ['match-change', 'bet-change', 'vote-change'].includes(event)) {
        loadMatches(); // Reload matches on any change
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { matches, loading, error, reload: () => dynamicMatchSystem.loadMatches() };
};

// Initialize on import
if (typeof window !== 'undefined') {
  dynamicMatchSystem.initialize().then(result => {
    if (result.success) {
      console.log('🚀 Dynamic Match System ready for use!');
    }
  });
}
