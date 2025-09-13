"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DynamicMatchManager = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeStatus, setRealTimeStatus] = useState('connecting');

  // Initialize real-time match loading
  useEffect(() => {
    loadMatches();
    setupRealTimeSync();
  }, []);

  // Load all dynamic matches
  const loadMatches = () => {
    setLoading(true);
    setError(null);

    supabase
      .from('matches')
      .select(`
        *,
        bets:bets(count),
        votes:votes(count)
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          throw fetchError;
        }

        setMatches(data || []);
        setRealTimeStatus('connected');
        console.log('✅ Loaded dynamic matches:', data?.length || 0);
      })
      .catch(err => {
        console.error('❌ Error loading matches:', err);
        setError(err.message);
        setRealTimeStatus('error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Setup real-time synchronization
  const setupRealTimeSync = () => {
    const channel = supabase
      .channel('dynamic-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          console.log('🔄 Real-time match update:', payload);
          handleRealTimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setRealTimeStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  // Handle real-time updates
  const handleRealTimeUpdate = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setMatches(currentMatches => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...currentMatches];
        
        case 'UPDATE':
          return currentMatches.map(match => 
            match.id === newRecord.id ? newRecord : match
          );
        
        case 'DELETE':
          return currentMatches.filter(match => match.id !== oldRecord.id);
        
        default:
          return currentMatches;
      }
    });
  };

  // Get matches by status
  const getMatchesByStatus = (status) => {
    return matches.filter(match => match.status === status);
  };

  // Get match statistics
  const getMatchStats = () => {
    return {
      total: matches.length,
      active: getMatchesByStatus('active').length,
      upcoming: getMatchesByStatus('upcoming').length,
      completed: getMatchesByStatus('completed').length,
      cancelled: getMatchesByStatus('cancelled').length
    };
  };

  // Render status indicator
  const renderStatusIndicator = () => {
    const statusColors = {
      connecting: 'text-yellow-500',
      connected: 'text-green-500',
      error: 'text-red-500'
    };

    return (
      <div className={`flex items-center space-x-2 ${statusColors[realTimeStatus]}`}>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
        <span className="text-sm font-medium">
          {realTimeStatus === 'connecting' && 'Connecting...'}
          {realTimeStatus === 'connected' && 'Live'}
          {realTimeStatus === 'error' && 'Offline'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading dynamic matches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading Matches</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          onClick={loadMatches}
          className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = getMatchStats();

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dynamic Match System</h2>
        {renderStatusIndicator()}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.upcoming}</div>
          <div className="text-sm text-gray-400">Upcoming</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
          <div className="text-sm text-gray-400">Cancelled</div>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">All Matches</h3>
        {matches.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No matches found. Create your first match using the admin panel!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <div key={match.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">
                    {match.wrestler1} vs {match.wrestler2}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {match.event_name} • {match.weight_class}
                  </p>
                  <p className="text-gray-500 text-xs">
                    Created: {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.status === 'active' ? 'bg-green-100 text-green-800' :
                    match.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    match.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {match.status}
                  </span>
                  <div className="text-gray-400 text-xs mt-1">
                    ID: {match.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicMatchManager;
