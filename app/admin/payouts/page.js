"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function PayoutAdmin() {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winner, setWinner] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [payoutInfo, setPayoutInfo] = useState(null);

  // Load matches on component mount
  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = () => {
    fetch('/api/matches')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Filter for active matches (no winner declared yet)
          const activeMatches = data.matches.filter(match => !match.winner);
          setMatches(activeMatches);
        } else {
          setMessage('Failed to load matches');
        }
      })
      .catch(error => {
        console.error('Error loading matches:', error);
        setMessage('Error loading matches');
      });
  };

  const loadPayoutInfo = (matchId) => {
    fetch(`/api/payouts?matchId=${matchId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPayoutInfo(data.data);
        } else {
          setMessage('Failed to load payout info');
        }
      })
      .catch(error => {
        console.error('Error loading payout info:', error);
        setMessage('Error loading payout info');
      });
  };

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setWinner('');
    setPayoutInfo(null);
    loadPayoutInfo(match.id);
  };

  const declareWinner = () => {
    if (!selectedMatch || !winner) {
      setMessage('Please select a match and declare a winner');
      return;
    }

    setLoading(true);
    setMessage('');

    fetch('/api/payouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matchId: selectedMatch.id,
        winner: winner,
        adminKey: 'admin-declare-winner-2024'
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setMessage(`✅ Winner declared successfully! ${data.data.totalPayout} WC distributed to winners.`);
        // Reload matches to update the list
        loadMatches();
        setSelectedMatch(null);
        setWinner('');
        setPayoutInfo(null);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Error declaring winner:', error);
      setMessage('Error declaring winner');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Please sign in to access admin features.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🏆 Payout Administration</h1>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('✅') ? 'bg-green-900 border border-green-600' : 
            message.includes('❌') ? 'bg-red-900 border border-red-600' : 
            'bg-blue-900 border border-blue-600'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Matches List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Active Matches</h2>
            
            {matches.length === 0 ? (
              <p className="text-gray-400">No active matches found.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMatch?.id === match.id
                        ? 'border-yellow-400 bg-yellow-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => handleMatchSelect(match)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{match.wrestler1} vs {match.wrestler2}</h3>
                        <p className="text-sm text-gray-400">
                          Pool: {match.total_pool || 0} WC | 
                          {match.wrestler1_percentage || 50}% - {match.wrestler2_percentage || 50}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Status: {match.status || 'active'}</p>
                        <p className="text-xs text-gray-500">
                          {match.event_name || 'Unknown Event'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Winner Declaration */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Declare Winner</h2>
            
            {selectedMatch ? (
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Selected Match:</h3>
                  <p className="text-lg">{selectedMatch.wrestler1} vs {selectedMatch.wrestler2}</p>
                  <p className="text-sm text-gray-400">
                    Total Pool: {selectedMatch.total_pool || 0} WC
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Winner:</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="winner"
                        value="wrestler1"
                        checked={winner === 'wrestler1'}
                        onChange={(e) => setWinner(e.target.value)}
                        className="text-yellow-400"
                      />
                      <span>{selectedMatch.wrestler1}</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="winner"
                        value="wrestler2"
                        checked={winner === 'wrestler2'}
                        onChange={(e) => setWinner(e.target.value)}
                        className="text-yellow-400"
                      />
                      <span>{selectedMatch.wrestler2}</span>
                    </label>
                  </div>
                </div>

                {payoutInfo && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Payout Preview:</h4>
                    <div className="text-sm space-y-1">
                      <p>Total Pool: {payoutInfo.totalPool} WC</p>
                      <p>Total Bets: {payoutInfo.totalBets}</p>
                      <p>Winning Bets: {payoutInfo.bets.filter(bet => bet.wrestler_choice === winner).length}</p>
                      <p>Losing Bets: {payoutInfo.bets.filter(bet => bet.wrestler_choice !== winner).length}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={declareWinner}
                  disabled={loading || !winner}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    loading || !winner
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400'
                  }`}
                >
                  {loading ? 'Processing...' : 'Declare Winner & Process Payouts'}
                </button>
              </div>
            ) : (
              <p className="text-gray-400">Select a match to declare a winner.</p>
            )}
          </div>
        </div>

        {/* Payout History */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Payouts</h2>
          <div className="text-sm text-gray-400">
            <p>Payout history will be displayed here once matches are completed.</p>
            <p className="mt-2">
              <strong>How it works:</strong> When you declare a winner, the total betting pool is distributed 
              proportionally among all winning bets. Each winner receives their share of the total pool 
              based on their bet amount relative to other winning bets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

