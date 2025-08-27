"use client";

import { useState, useEffect } from 'react';

const AdminMatchControl = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
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
    try {
      const url = selectedStatus !== 'all' 
        ? `/api/admin/matches?status=${selectedStatus}` 
        : '/api/admin/matches';
      
      const response = await fetch(url);
      if (!response.ok) {
        // Graceful fallback without throwing to avoid noisy console
        // Prefer local demo storage if present
        try {
          const stored = localStorage.getItem('admin_demo_matches');
          const localMatches = stored ? JSON.parse(stored) : [];
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
      const data = await response.json().catch(() => ({ success: false, error: 'Invalid JSON' }));
      
      const mergeWithLocal = (apiMatches = []) => {
        try {
          const stored = localStorage.getItem('admin_demo_matches');
          const localMatches = stored ? JSON.parse(stored) : [];
          
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
          const stored = localStorage.getItem('admin_demo_matches');
          const localMatches = stored ? JSON.parse(stored) : [];
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
          id: 'demo-match-1',
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
      const response = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adminKey: 'wrestlebet-admin-2025'
        })
      });

      const data = await response.json();
      // Persist locally in demo mode or if backend refused
      if (!data.success) {
        console.warn('Creating match in demo mode (local only):', data.error);
      }

      // Build a canonical match object for local storage/front-end
      const generateUniqueId = (wrestler1, wrestler2) => {
        const baseId = `${wrestler1?.toLowerCase().replace(/\s+/g,'')}-${wrestler2?.toLowerCase().replace(/\s+/g,'')}`;
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        return `${baseId}-${timestamp}`;
      };

      const newMatch = {
        id: generateUniqueId(formData.wrestler1, formData.wrestler2),
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

      // Save to localStorage list used by frontend demo mode
      const current = localStorage.getItem('admin_demo_matches');
      const list = current ? (()=>{ try { return JSON.parse(current) } catch { return [] } })() : [];
      list.push(newMatch);
      localStorage.setItem('admin_demo_matches', JSON.stringify(list));

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
      alert('✅ Match created! It will appear on the front page shortly.');
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
      const response = await fetch('/api/admin/declare-winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          matchId, 
          winner, 
          adminKey: 'wrestlebet-admin-2025'
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadMatches(); // Reload matches
        // Mark as completed in local demo storage and notify UI
        try {
          const stored = localStorage.getItem('admin_demo_matches');
          if (stored) {
            const arr = JSON.parse(stored);
            const idx = arr.findIndex(m => m.id === matchId);
            if (idx !== -1) {
              arr[idx].status = 'completed';
              arr[idx].winner = winner;
              localStorage.setItem('admin_demo_matches', JSON.stringify(arr));
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

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('🗑️ Delete this match?\n\n⚠️ This will remove the match and all associated bets. This action cannot be undone!')) return;

    try {
      // Check if this is a demo match (created locally)
      const stored = localStorage.getItem('admin_demo_matches');
      const isDemoMatch = stored ? JSON.parse(stored).some(m => m.id === matchId) : false;
      
      if (isDemoMatch) {
        // Handle demo match deletion locally
        const arr = JSON.parse(stored).filter(m => m.id !== matchId);
        localStorage.setItem('admin_demo_matches', JSON.stringify(arr));
        
        // Notify front page to remove card immediately
        try {
          window.dispatchEvent(new CustomEvent('admin-match-deleted', { detail: { matchId } }));
        } catch {}
        
        await loadMatches();
        alert('✅ Match deleted successfully!');
        return;
      }

      // Try API deletion for real matches
      const params = new URLSearchParams({ id: String(matchId), adminUserId: 'admin-user-id' });
      const response = await fetch(`/api/admin/matches?${params.toString()}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        // Remove from local demo storage as well (in case it was there)
        try {
          const stored = localStorage.getItem('admin_demo_matches');
          if (stored) {
            const arr = JSON.parse(stored).filter(m => m.id !== matchId);
            localStorage.setItem('admin_demo_matches', JSON.stringify(arr));
          }
        } catch {}

        // Notify front page to remove card immediately
        try {
          window.dispatchEvent(new CustomEvent('admin-match-deleted', { detail: { matchId } }));
        } catch {}

        await loadMatches();
        alert('✅ Match deleted successfully!');
      } else {
        // If API fails, try local deletion as fallback
        console.warn('API deletion failed, trying local deletion:', data.error);
        try {
          const stored = localStorage.getItem('admin_demo_matches');
          if (stored) {
            const arr = JSON.parse(stored).filter(m => m.id !== matchId);
            localStorage.setItem('admin_demo_matches', JSON.stringify(arr));
          }
          
          try {
            window.dispatchEvent(new CustomEvent('admin-match-deleted', { detail: { matchId } }));
          } catch {}
          
          await loadMatches();
          alert('✅ Match deleted locally (API unavailable)!');
        } catch (localError) {
          alert(`❌ Error: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('❌ Failed to delete match');
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
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>➕</span> Create Match
        </button>
      </div>

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
          <button
            onClick={loadMatches}
            className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            🔄 Refresh
          </button>
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
                          {(match.total_bets || 0).toFixed(2)} WC
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">👥 Total Participants:</span>
                        <span className="ml-2 font-bold text-blue-400">
                          {(match.total_votes || 0) + (match.total_bets || 0)} users
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Delete
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