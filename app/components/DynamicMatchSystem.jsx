import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DynamicMatchSystem = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load matches from database
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = () => {
    setLoading(true);
    
    supabase
      .from('matches')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        setMatches(data || []);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Create new match dynamically
  const createMatch = (matchData) => {
    supabase
      .from('matches')
      .insert([{
        wrestler1: matchData.wrestler1,
        wrestler2: matchData.wrestler2,
        event_name: matchData.eventName,
        weight_class: matchData.weightClass,
        status: 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .then(({ data, error }) => {
        if (error) throw error;
        loadMatches(); // Refresh list
        return data[0];
      })
      .catch(err => {
        setError(err.message);
      });
  };

  // Delete match
  const deleteMatch = (matchId) => {
    supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .then(({ error }) => {
        if (error) throw error;
        loadMatches(); // Refresh list
      })
      .catch(err => {
        setError(err.message);
      });
  };

  if (loading) return <div>Loading matches...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dynamic-match-system">
      <h2>Dynamic Match System</h2>
      
      {/* Match List */}
      <div className="matches-list">
        {matches.map(match => (
          <div key={match.id} className="match-card">
            <h3>{match.wrestler1} vs {match.wrestler2}</h3>
            <p>Event: {match.event_name}</p>
            <p>Weight: {match.weight_class}</p>
            <button onClick={() => deleteMatch(match.id)}>
              Delete Match
            </button>
          </div>
        ))}
      </div>

      {/* Create New Match Form */}
      <div className="create-match">
        <h3>Create New Match</h3>
        <form onSubmit={handleCreateMatch}>
          <input 
            type="text" 
            placeholder="Wrestler 1" 
            value={newMatch.wrestler1} 
            onChange={(e) => setNewMatch({...newMatch, wrestler1: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Wrestler 2" 
            value={newMatch.wrestler2} 
            onChange={(e) => setNewMatch({...newMatch, wrestler2: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Event Name" 
            value={newMatch.eventName} 
            onChange={(e) => setNewMatch({...newMatch, eventName: e.target.value})}
          />
          <input 
            type="text" 
            placeholder="Weight Class" 
            value={newMatch.weightClass} 
            onChange={(e) => setNewMatch({...newMatch, weightClass: e.target.value})}
          />
          <button type="submit">Create Match</button>
        </form>
      </div>
    </div>
  );
};

export default DynamicMatchSystem;




