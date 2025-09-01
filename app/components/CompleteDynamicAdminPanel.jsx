"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import dynamicMatchSystem from '../lib/dynamicMatchSystem';

const CompleteDynamicAdminPanel = () => {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matches');
  const [stats, setStats] = useState(null);
  const [realTimeStatus, setRealTimeStatus] = useState('connecting');

  // New match form state
  const [newMatch, setNewMatch] = useState({
    wrestler1: '',
    wrestler2: '',
    eventName: '',
    weightClass: '',
    matchDate: '',
    description: '',
    status: 'upcoming'
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
    
    // Subscribe to real-time updates
    const unsubscribe = dynamicMatchSystem.subscribe((event, data) => {
      console.log('📡 Admin received real-time update:', event, data);
      setRealTimeStatus('connected');
      loadAllData(); // Refresh data on any change
    });

    return unsubscribe;
  }, []);

  // Load all admin data
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load matches and stats in parallel
      const [matchData, statsData] = await Promise.all([
        dynamicMatchSystem.loadMatches(),
        dynamicMatchSystem.getSystemStats()
      ]);

      setMatches(matchData);
      setStats(statsData);
      setRealTimeStatus('connected');

    } catch (err) {
      console.error('❌ Error loading admin data:', err);
      setError(err.message);
      setRealTimeStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Create new match
  const createMatch = async (e) => {
    e.preventDefault();
    
    if (!newMatch.wrestler1 || !newMatch.wrestler2) {
      alert('Both wrestler names are required');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMatch,
          adminUserId: user?.id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setNewMatch({
          wrestler1: '',
          wrestler2: '',
          eventName: '',
          weightClass: '',
          matchDate: '',
          description: '',
          status: 'upcoming'
        });

        // Refresh data
        await loadAllData();
        
        alert('Match created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create match');
      }

    } catch (err) {
      console.error('❌ Error creating match:', err);
      alert(`Error creating match: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update match status
  const updateMatchStatus = async (matchId, newStatus) => {
    try {
      const response = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: matchId,
          status: newStatus,
          adminUserId: user?.id
        })
      });

      const result = await response.json();

      if (result.success) {
        await loadAllData();
        alert(`Match status updated to ${newStatus}`);
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('❌ Error updating match:', err);
      alert(`Error updating match: ${err.message}`);
    }
  };

  // Delete match
  const deleteMatch = async (matchId, force = false) => {
    const match = matches.find(m => m.id === matchId);
    const matchName = match ? `${match.wrestler1} vs ${match.wrestler2}` : 'this match';
    
    if (!force) {
      if (!confirm(`Are you sure you want to delete ${matchName}? This cannot be undone.`)) {
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/matches?id=${matchId}&adminUserId=${user?.id}${force ? '&force=true' : ''}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await loadAllData();
        alert(`Match deleted successfully${force ? ' (including all bets)' : ''}`);
      } else if (result.requiresForce) {
        // Show detailed error with force delete option
        const confirmMessage = `${result.error}\n\nMatch: ${matchName}\nBets: ${result.betDetails.count}\nTotal WC: ${result.betDetails.totalAmount}\n\nWould you like to FORCE DELETE this match and ALL its bets? This cannot be undone!`;
        
        if (confirm(confirmMessage)) {
          // Recursive call with force = true
          await deleteMatch(matchId, true);
        }
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('❌ Error deleting match:', err);
      alert(`Error deleting match: ${err.message}`);
    }
  };

  // Declare winner
  const declareWinner = async (matchId, winner) => {
    try {
      const response = await fetch('/api/admin/declare-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          winner,
          adminUserId: user?.id
        })
      });

      const result = await response.json();

      if (result.success) {
        await loadAllData();
        alert(`Winner declared: ${winner}`);
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('❌ Error declaring winner:', err);
      alert(`Error declaring winner: ${err.message}`);
    }
  };

  // Render real-time status indicator
  const renderStatusIndicator = () => {
    const statusColors = {
      connecting: 'text-yellow-400',
      connected: 'text-green-400',
      error: 'text-red-400'
    };

    const statusText = {
      connecting: 'Connecting...',
      connected: 'Live',
      error: 'Offline'
    };

    return (
      <div className={`flex items-center space-x-2 ${statusColors[realTimeStatus]}`}>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
        <span className="text-sm font-medium">{statusText[realTimeStatus]}</span>
      </div>
    );
  };

  if (!isLoaded) {
    return <div className="text-center p-8">Loading authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dynamic Admin Panel</h1>
            <p className="text-gray-400 mt-1">Real-time wrestling match management</p>
          </div>
          {renderStatusIndicator()}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalMatches}</div>
              <div className="text-sm text-gray-400">Total Matches</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.activeMatches}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.upcomingMatches}</div>
              <div className="text-sm text-gray-400">Upcoming</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.completedMatches}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{stats.totalBets}</div>
              <div className="text-sm text-gray-400">Total Bets</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{stats.totalVotes}</div>
              <div className="text-sm text-gray-400">Total Votes</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Match Management
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Create Match
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-medium">Error</h3>
            <p className="text-red-400 text-sm mt-1">{error}</p>
            <button 
              onClick={loadAllData}
              className="mt-3 bg-red-800 hover:bg-red-700 text-red-200 px-3 py-1 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Matches</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading matches...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">No matches found. Create your first match!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match.id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">
                          {match.wrestler1} vs {match.wrestler2}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {match.event_name} • {match.weight_class}
                          {match.match_date && (
                            <span className="ml-2 text-gray-500">
                              • {new Date(match.match_date).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        
                        {/* Match Statistics */}
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Bets:</span>
                            <span className={`ml-1 font-medium ${
                              (match.totalBets || 0) > 0 ? 'text-yellow-400' : 'text-white'
                            }`}>
                              {match.totalBets || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Votes:</span>
                            <span className="text-white ml-1">{match.totalVotes || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Pool:</span>
                            <span className="text-white ml-1">{match.totalPool || 0} WC</span>
                          </div>
                          <div>
                            <span className="text-gray-400">ID:</span>
                            <span className="text-gray-500 ml-1 font-mono text-xs">{match.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          match.status === 'active' ? 'bg-green-900 text-green-300' :
                          match.status === 'upcoming' ? 'bg-yellow-900 text-yellow-300' :
                          match.status === 'completed' ? 'bg-purple-900 text-purple-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {match.status}
                        </span>
                        
                        <div className="flex space-x-2">
                          {match.status === 'upcoming' && (
                            <button
                              onClick={() => updateMatchStatus(match.id, 'active')}
                              className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Start
                            </button>
                          )}
                          
                          {match.status === 'active' && (
                            <>
                              <button
                                onClick={() => declareWinner(match.id, match.wrestler1)}
                                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              >
                                {match.wrestler1} Wins
                              </button>
                              <button
                                onClick={() => declareWinner(match.id, match.wrestler2)}
                                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              >
                                {match.wrestler2} Wins
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => deleteMatch(match.id)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              (match.totalBets || 0) > 0 
                                ? 'bg-orange-700 hover:bg-orange-600 text-white border border-orange-500' 
                                : 'bg-red-700 hover:bg-red-600 text-white'
                            }`}
                            title={
                              (match.totalBets || 0) > 0 
                                ? `Delete (has ${match.totalBets} bets - will require confirmation)` 
                                : 'Delete match'
                            }
                          >
                            {(match.totalBets || 0) > 0 ? '⚠️ Delete' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Match Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Create New Match</h2>
            
            <form onSubmit={createMatch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wrestler 1 *
                  </label>
                  <input
                    type="text"
                    value={newMatch.wrestler1}
                    onChange={(e) => setNewMatch({...newMatch, wrestler1: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter wrestler name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wrestler 2 *
                  </label>
                  <input
                    type="text"
                    value={newMatch.wrestler2}
                    onChange={(e) => setNewMatch({...newMatch, wrestler2: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter wrestler name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={newMatch.eventName}
                    onChange={(e) => setNewMatch({...newMatch, eventName: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., WWE Championship"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight Class
                  </label>
                  <input
                    type="text"
                    value={newMatch.weightClass}
                    onChange={(e) => setNewMatch({...newMatch, weightClass: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., 86kg, Heavyweight"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match Date
                </label>
                <input
                  type="datetime-local"
                  value={newMatch.matchDate}
                  onChange={(e) => setNewMatch({...newMatch, matchDate: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newMatch.description}
                  onChange={(e) => setNewMatch({...newMatch, description: e.target.value})}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Optional match description or notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Status
                </label>
                <select
                  value={newMatch.status}
                  onChange={(e) => setNewMatch({...newMatch, status: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !newMatch.wrestler1 || !newMatch.wrestler2}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Match'}
              </button>
            </form>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">System Analytics</h2>
            
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Match Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active Matches:</span>
                      <span className="text-green-400 font-medium">{stats.activeMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Upcoming Matches:</span>
                      <span className="text-yellow-400 font-medium">{stats.upcomingMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed Matches:</span>
                      <span className="text-purple-400 font-medium">{stats.completedMatches}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Engagement Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bets Placed:</span>
                      <span className="text-cyan-400 font-medium">{stats.totalBets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Votes Cast:</span>
                      <span className="text-pink-400 font-medium">{stats.totalVotes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Pool Value:</span>
                      <span className="text-orange-400 font-medium">{stats.totalPool} WC</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">Analytics data is loading...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompleteDynamicAdminPanel;
