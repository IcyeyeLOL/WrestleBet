import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const GlobalSyncSystem = () => {
  const [globalMatches, setGlobalMatches] = useState([]);
  const [userDevices, setUserDevices] = useState([]);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Real-time subscription for global sync
  useEffect(() => {
    // Subscribe to real-time changes
    const subscription = supabase
      .channel('global-matches')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('Global sync update:', payload);
          handleGlobalUpdate(payload);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bets' },
        (payload) => {
          console.log('Betting pool update:', payload);
          handleBettingUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle global match updates
  const handleGlobalUpdate = (payload) => {
    if (payload.eventType === 'INSERT') {
      setGlobalMatches(prev => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setGlobalMatches(prev => 
        prev.map(match => 
          match.id === payload.new.id ? payload.new : match
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setGlobalMatches(prev => 
        prev.filter(match => match.id !== payload.old.id)
      );
    }
  };

  // Handle betting pool updates
  const handleBettingUpdate = (payload) => {
    // Update odds based on new betting data
    updateOdds(payload);
  };

  // Calculate real odds based on betting pool
  const updateOdds = (betData) => {
    const matchId = betData.new?.match_id;
    if (!matchId) return;

    // Get all bets for this match
    supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .then(({ data: bets }) => {
        if (!bets) return;

        // Calculate total pool
        const totalPool = bets.reduce((sum, bet) => sum + bet.amount, 0);
        
        // Calculate odds for each wrestler
        const wrestler1Bets = bets.filter(bet => bet.wrestler_choice === 'wrestler1');
        const wrestler2Bets = bets.filter(bet => bet.wrestler_choice === 'wrestler2');
        
        const wrestler1Total = wrestler1Bets.reduce((sum, bet) => sum + bet.amount, 0);
        const wrestler2Total = wrestler2Bets.reduce((sum, bet) => sum + bet.amount, 0);

        // Calculate odds (simplified formula)
        const wrestler1Odds = totalPool > 0 ? (totalPool / wrestler1Total).toFixed(1) : 1.0;
        const wrestler2Odds = totalPool > 0 ? (totalPool / wrestler2Total).toFixed(1) : 1.0;

        // Update match with new odds
        supabase
          .from('matches')
          .update({ 
            odds_wrestler1: wrestler1Odds,
            odds_wrestler2: wrestler2Odds,
            total_pool: totalPool
          })
          .eq('id', matchId);
      });
  };

  // Register device for global sync
  const registerDevice = () => {
    const deviceId = generateDeviceId();
    supabase
      .from('user_devices')
      .insert([{
        device_id: deviceId,
        user_id: 'current_user', // Replace with actual user ID
        last_seen: new Date().toISOString(),
        is_active: true
      }])
      .then(({ error }) => {
        if (!error) {
          setSyncStatus('connected');
        }
      });
  };

  // Generate unique device ID
  const generateDeviceId = () => {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Load global matches
  const loadGlobalMatches = () => {
    supabase
      .from('matches')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        setGlobalMatches(data || []);
      })
      .catch(err => {
        console.error('Failed to load global matches:', err);
      });
  };

  useEffect(() => {
    registerDevice();
    loadGlobalMatches();
  }, []);

  return (
    <div className="global-sync-system">
      <div className="sync-status">
        <h3>Global Sync Status: {syncStatus}</h3>
        <p>Connected Devices: {userDevices.length}</p>
      </div>

      <div className="global-matches">
        <h3>Global Matches ({globalMatches.length})</h3>
        {globalMatches.map(match => (
          <div key={match.id} className="global-match-card">
            <h4>{match.wrestler1} vs {match.wrestler2}</h4>
            <p>Event: {match.event_name}</p>
            <p>Total Pool: {match.total_pool || 0} WC</p>
            <p>Odds: {match.odds_wrestler1 || 1.0} / {match.odds_wrestler2 || 1.0}</p>
            <p>Status: {match.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalSyncSystem;




