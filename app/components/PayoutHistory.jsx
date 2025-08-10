"use client";

import { useState, useEffect } from 'react';

const PayoutHistory = () => {
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading payout history
    // In real implementation, this would fetch from your database
    setTimeout(() => {
      setPayoutHistory([
        {
          id: 'payout_1',
          matchId: 'taylor-yazdani',
          winner: 'David Taylor',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          totalPayout: 450,
          winnerCount: 3,
          details: [
            { userId: 'user1', amount: 125, bet: '50 WC on Taylor @ 2.50' },
            { userId: 'user3', amount: 200, bet: '100 WC on Taylor @ 2.00' },
            { userId: 'user5', amount: 125, bet: '50 WC on Taylor @ 2.50' }
          ]
        },
        {
          id: 'payout_2',
          matchId: 'dake-punia',
          winner: 'Bajrang Punia',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          totalPayout: 275,
          winnerCount: 2,
          details: [
            { userId: 'user2', amount: 150, bet: '75 WC on Punia @ 2.00' },
            { userId: 'user4', amount: 125, bet: '50 WC on Punia @ 2.50' }
          ]
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300/20 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300/20 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">💰 Payout History</h2>
      
      {payoutHistory.length === 0 ? (
        <p className="text-gray-400">No payouts processed yet.</p>
      ) : (
        <div className="space-y-4">
          {payoutHistory.map(payout => (
            <div key={payout.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Match: {payout.matchId}
                  </h3>
                  <p className="text-green-400 font-medium">
                    Winner: {payout.winner}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-400">
                    {payout.totalPayout} WC
                  </div>
                  <div className="text-sm text-gray-400">
                    to {payout.winnerCount} users
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-3">
                Processed: {new Date(payout.timestamp).toLocaleString()}
              </div>
              
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
                  View Payout Details
                </summary>
                <div className="mt-2 space-y-2 pl-4 border-l border-gray-600">
                  {payout.details.map((detail, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-white font-medium">
                        User {detail.userId}:
                      </span>
                      <span className="text-green-400 ml-2">
                        +{detail.amount} WC
                      </span>
                      <span className="text-gray-400 ml-2">
                        ({detail.bet})
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayoutHistory;
