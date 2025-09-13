"use client";

import { useState, useEffect } from 'react';
import { safeFetch } from '../lib/safeFetch';
import globalStorage from '../lib/globalStorage';

const AdminMatchControl = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleting, setDeleting] = useState({});
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    wrestler1: '',
    wrestler2: '',
    eventName: '',
    weightClass: '',
    matchDate: '',
    matchTime: ''
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedStatus !== 'all' 
        ? `/api/admin/matches?status=${selectedStatus}` 
        : '/api/admin/matches';
      
      const result = await safeFetch(url);
      if (!result.success) {
        // Graceful fallback without throwing to avoid noisy console
        // Prefer global storage if present
        try {
          const stored = globalStorage.get('admin_demo_matches');
          const localMatches = stored || [];
          if (Array.isArray(localMatches) && localMatches.length > 0) {
            setMatches(localMatches);
            setLoading(false);
            return;
          }
        } catch {}
        setMatches([{ id: 'taylor-yazdani', wrestler1: 'David Taylor', wrestler2: 'Hassan Yazdani', event_name: 'World Wrestling Championship', weight_class: '86kg', match_date: '2025-08-15', status: 'upcoming', total_pool: 150, created_at: new Date().toISOString() }]);
        setLoading(false);
        return;
      }
      const data = result.data;
      
      const mergeWithLocal = (apiMatches = []) => {
        try {
          const stored = globalStorage.get('admin_demo_matches');
          const localMatches = stored || [];
          
          // Create a map to ensure unique IDs and prioritize local matches over API matches
          const byId = new Map();
          
          // First add API matches
          (apiMatches || []).forEach(m => {
            if (m && m.id) byId.set(m.id, m);
          });
          
          // Then add/override with local matches (local takes precedence)
          (localMatches || []).forEach(m => {
            if (m && m.id) byId.set(m.id, m);
          });
          
          let merged = Array.from(byId.values());
          
          // Additional deduplication by ID (safety net)
          const uniqueById = new Map();
          merged.forEach(match => {
            if (match && match.id) {
              uniqueById.set(match.id, match);
            }
          });
          merged = Array.from(uniqueById.values());
          
          // Filter by status if needed
          if (selectedStatus !== 'all') {
            merged = merged.filter(m => (m.status || 'upcoming') === selectedStatus);
          }
          
          // Debug logging
          console.log('Merged matches:', merged.map(m => ({ id: m.id, wrestler1: m.wrestler1, wrestler2: m.wrestler2 })));
          
          return merged;
        } catch (error) {
          console.error('Error merging matches:', error);
          return apiMatches || [];
        }
      };
      
      if (data.success) {
        setMatches(mergeWithLocal(data.matches));
      } else {
        console.error('API Error:', data.error);
        try {
          const stored = globalStorage.get('admin_demo_matches');
          const localMatches = stored || [];
          if (Array.isArray(localMatches) && localMatches.length > 0) {
            setMatches(mergeWithLocal(localMatches));
          }
        } catch {}
      }
    } catch (error) {
      // Quiet fallback to demo data
      // Fallback to sample data for demo
      setMatches([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          wrestler1: 'John Smith',
          wrestler2: 'Mike Johnson',
          event_name: 'Demo Tournament',
          weight_class: '70kg',
          match_date: '2025-08-10',
          status: 'upcoming',
          total_pool: 100,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onCreated = () => loadMatches();
    if (typeof window !== 'undefined') {
      window.addEventListener('admin-match-created', onCreated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('admin-match-created', onCreated);
      }
    };
  }, [selectedStatus]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to create match via API first
      const result = await safeFetch('/api/admin/matches', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          adminKey: 'wrestlebet-admin-2025'
        })
      });

      const data = result.data;
      
      // Check if API creation was successful
      if (result.success && data.success) {
        // API creation successful - no need for local fallback
        console.log('✅ Match created via API:', data.match);
        await loadMatches(); // Reload matches
        setShowCreateForm(false);
        setFormData({ 
          wrestler1: '', 
          wrestler2: '', 
          eventName: '', 
          weightClass: '', 
          matchDate: '',
          matchTime: '' 
        });
        alert('✅ Match created successfully! It will appear on the front page shortly.');
        return; // Exit early - no local creation needed
      }

      // API failed - create locally as fallback
      console.log('Creating match in demo mode (local only):', data?.error || 'API not available');
      
      const generateUniqueId = () => {
        // Generate a proper UUID v4 format
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const newMatch = {
        id: generateUniqueId(),
        wrestler1: formData.wrestler1,
        wrestler2: formData.wrestler2,
        event_name: formData.eventName,
        weight_class: formData.weightClass,
        match_date: formData.matchDate || null,
        status: 'upcoming',
        total_bets: 0,
        total_votes: 0,
        created_at: new Date().toISOString()
      };

      // Save to global storage list used by frontend demo mode
      const current = globalStorage.get('admin_demo_matches') || [];
      const list = Array.isArray(current) ? current : [];
      list.push(newMatch);
      globalStorage.set('admin_demo_matches', list);

      // Notify frontend to refresh immediately
      try {
        window.dispatchEvent(new CustomEvent('admin-match-created'));
      } catch {}

      await loadMatches(); // Reload matches
      setShowCreateForm(false);
      setFormData({ 
        wrestler1: '', 
        wrestler2: '', 
        eventName: '', 
        weightClass: '', 
        matchDate: '',
        matchTime: '' 
      });
      alert('✅ Match created locally! It will appear on the front page shortly.');
      
    } catch (error) {
      console.error('Failed to create match:', error);
      alert('❌ Failed to create match. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinner = async (matchId, winner) => {
    if (!window.confirm(`🏆 Declare ${winner} as the winner?\n\nThis will:\n✅ End the match\n✅ Process all payouts\n✅ Update user balances\n\n⚠️ This action cannot be undone!`)) return;

    const loadingToast = alert('⏳ Processing winner declaration and payouts...');
    
    try {
      const result = await safeFetch('/api/admin/declare-winner', {
        method: 'POST',
        body: JSON.stringify({ 
          matchId, 
          winner, 
          adminKey: 'wrestlebet-admin-2025'
        })
      });

      const data = result.data;
      if (result.success && data.success) {
        await loadMatches(); // Reload matches
        // Mark as completed in global storage and notify UI
        try {
          const stored = globalStorage.get('admin_demo_matches') || [];
          if (Array.isArray(stored)) {
            const arr = [...stored];
            const idx = arr.findIndex(m => m.id === matchId);
            if (idx !== -1) {
              arr[idx].status = 'completed';
              arr[idx].winner = winner;
              globalStorage.set('admin_demo_matches', arr);
            }
          }
        } catch {}

        try {
          window.dispatchEvent(new CustomEvent('admin-declare-winner', { detail: { matchId, winner } }));
        } catch {}
        
        const payoutSummary = data.payoutSummary || {};
        const message = `🎉 Winner declared successfully!\n\n💰 Payout Summary:\n` +
          `• Total Payouts: ${payoutSummary.totalPayout || 0} WC\n` +
          `• Winners Paid: ${payoutSummary.winnerCount || 0} users\n` +
          `• Total Pool: ${payoutSummary.totalPool || 0} WC\n` +
          `• House Profit: ${payoutSummary.houseProfit || 0} WC`;
        
        alert(message);
      } else {
        alert(`❌ Error: ${data.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Error declaring winner:', error);
      alert('❌ Error declaring winner. Check console for details.');
    }
  };

  const handleDeleteMatch = async (matchId, force = false) => {
    try {
      setDeleting(prev => ({ ...prev, [matchId]: true }));
      
      const match = matches.find(m => m.id === matchId);
      const matchName = match ? `${match.wrestler1 || match.wrestler_1} vs ${match.wrestler2 || match.wrestler_2}` : 'this match';
      
      if (!force) {
        if (!window.confirm(`🗑️ Delete ${matchName}?\n\n⚠️ This will remove the match and all associated bets. This action cannot be undone!`)) {
          setDeleting(prev => ({ ...prev, [matchId]: false }));
          return;
        }
      }

      // Check if this is a demo match (created locally)
      const stored = globalStorage.get('admin_demo_matches') || [];
      const isDemoMatch = Array.isArray(stored) && stored.some(m => m.id === matchId);
      
      if (isDemoMatch) {
        // Handle demo match deletion locally
        const arr = stored.filter(m => m.id !== matchId);
        globalStorage.set('admin_demo_matches', arr);
        
        // Notify front page to remove card immediately
        try {
          window.dispatchEvent(new CustomEvent('admin-match-deleted', { detail: { matchId } }));
        } catch {}
        
        await loadMatches();
        alert(`✅ Match deleted successfully${force ? ' (including all bets)' : ''}!`);
        return;
      }

      // Try API deletion for real matches
      const params = new URLSearchParams({ 
        id: String(matchId), 
        adminUserId: 'admin-user-id',
        ...(force && { force: 'true' })
      });
      
      const result = await safeFetch(`/api/admin/matches?${params.toString()}`, {
        method: 'DELETE'
      });

      const data = result.data;
      if (result.success && data.success) {
        // Remove from global storage as well (in case it was there)
        try {
          const stored = globalStorage.get('admin_demo_matches') || [];
          if (Array.isArray(stored)) {
            const arr = stored.filter(m => m.id !== matchId);
            globalStorage.set('admin_demo_matches', arr);
          }
        } catch {}

        // Notify front page to remove card immediately
        try {
          window.dispatchEvent(new CustomEvent('admin-match-deleted', { detail: { matchId } }));
        } catch {}

        await loadMatches();
        alert(`✅ Match deleted successfully${force ? ' (including all bets)' : ''}!`);
      } else {
        // Check if the error message indicates bets exist (for force delete)
        if (data.error && data.error.includes('bets') && !force) {
          const confirmForce = confirm(
            `This match has existing bets. ` +
            'Do you want to force delete it? This will delete all associated bets.'
          );
          if (confirmForce) {
            await handleDeleteMatch(matchId, true);
          }
        } else {
          alert(`Failed to delete match: ${data.error}`);
        }
      }
    } catch (err) {
      alert('Error deleting match');
      console.error('Error deleting match:', err);
    } finally {
      setDeleting(prev => ({ ...prev, [matchId]: false }));
    }
  };

  // Delete all matches
  const deleteAllMatches = async () => {
    const confirmDelete = confirm('Are you sure you want to delete ALL matches? This action cannot be undone.');
    if (!confirmDelete) return;

    const confirmForce = confirm('Do you want to force delete matches that have bets? This will delete all associated bets.');
    
    for (const match of matches) {
      await handleDeleteMatch(match.id, confirmForce);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">🥊 Match Control</h2>
          <p className="text-gray-400">Create, manage, and end wrestling matches</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadMatches}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>🔄</span> Refresh
          </button>
          <button
            onClick={deleteAllMatches}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>🗑️</span> Delete All
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>➕</span> Create Match
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Filter by status:</span>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Matches', emoji: '📋' },
              { value: 'upcoming', label: 'Upcoming', emoji: '⏰' },
              { value: 'live', label: 'Live', emoji: '🔴' },
              { value: 'completed', label: 'Completed', emoji: '✅' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => {
                  setSelectedStatus(status.value);
                  setTimeout(loadMatches, 100);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status.emoji} {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Match Form */}
      {showCreateForm && (
        <div className="bg-gray-800 p-6 rounded-lg border border-blue-500">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>➕</span> Create New Match
          </h3>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">🥊 Wrestler 1</label>
                <input
                  type="text"
                  placeholder="e.g., David Taylor"
                  value={formData.wrestler1}
                  onChange={(e) => setFormData({...formData, wrestler1: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">🥊 Wrestler 2</label>
                <input
                  type="text"
                  placeholder="e.g., Hassan Yazdani"
                  value={formData.wrestler2}
                  onChange={(e) => setFormData({...formData, wrestler2: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 text-base"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">🏆 Event Name</label>
                <input
                  type="text"
                  placeholder="e.g., World Championship Finals"
                  value={formData.eventName}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">⚖️ Weight Class</label>
                <input
                  type="text"
                  placeholder="e.g., 86kg, 74kg, 125kg"
                  value={formData.weightClass}
                  onChange={(e) => setFormData({...formData, weightClass: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">📅 Match Date</label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({...formData, matchDate: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">⏰ Match Time</label>
                <input
                  type="time"
                  value={formData.matchTime}
                  onChange={(e) => setFormData({...formData, matchTime: e.target.value})}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? '⏳ Creating...' : '✅ Create Match'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ 
                    wrestler1: '', 
                    wrestler2: '', 
                    eventName: '', 
                    weightClass: '', 
                    matchDate: '',
                    matchTime: '' 
                  });
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading && matches.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-400 text-lg">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">🥊</div>
            <p className="text-gray-400 text-lg">No matches available</p>
            <p className="text-gray-500 mt-2">Create your first match to get started!</p>
          </div>
        ) : (
          matches
            .filter((match, index, self) => 
              // Remove duplicates by ID as final safety check
              index === self.findIndex(m => m.id === match.id)
            )
            .map((match, index) => (
            <div key={`${match.id}-${index}`} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-white">
                      🥊 {match.wrestler1 || match.wrestler_1} vs {match.wrestler2 || match.wrestler_2}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.status === 'upcoming' ? 'bg-blue-900 text-blue-200' :
                      match.status === 'live' ? 'bg-green-900 text-green-200' :
                      match.status === 'completed' ? 'bg-gray-900 text-gray-200' :
                      'bg-purple-900 text-purple-200'
                    }`}>
                      {match.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-gray-300">
                    <div>
                      <span className="text-gray-400 text-sm">🏆 Event:</span><br/>
                      <span className="font-medium text-sm md:text-base">{match.event_name || match.eventName || 'No event specified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">⚖️ Weight:</span><br/>
                      <span className="font-medium text-sm md:text-base">{match.weight_class || match.weightClass || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">📅 Date:</span><br/>
                      <span className="font-medium text-sm md:text-base">{match.match_date || match.matchDate ? new Date(match.match_date || match.matchDate).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>
                  
                  {/* Betting Stats */}
                  <div className="mt-4 p-4 bg-gray-750 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">💰 Total Betting Pool:</span>
                        <span className="ml-2 font-bold text-yellow-400">
                          {(match.total_pool || 0).toFixed(2)} WC
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">👥 Total Participants:</span>
                        <span className="ml-2 font-bold text-blue-400">
                          {match.total_participants || 0} users
                        </span>
                      </div>
                    </div>
                    
                    {match.winner && (
                      <div className="mt-3 p-2 bg-green-900 bg-opacity-30 rounded border border-green-700">
                        <span className="text-green-300">🏆 Winner: </span>
                        <span className="font-bold text-green-200">{match.winner}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  {match.status !== 'completed' && (
                    <>
                      <button 
                        onClick={() => handleDeclareWinner(match.id, match.wrestler1 || match.wrestler_1)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        🏆 {match.wrestler1 || match.wrestler_1} Wins
                      </button>
                      <button 
                        onClick={() => handleDeclareWinner(match.id, match.wrestler2 || match.wrestler_2)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        🏆 {match.wrestler2 || match.wrestler_2} Wins
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteMatch(match.id)}
                    disabled={deleting[match.id]}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      deleting[match.id]
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {deleting[match.id] ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMatchControl;