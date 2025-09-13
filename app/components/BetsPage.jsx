"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

const BetsPage = () => {
  const [currentTab, setCurrentTab] = useState('history');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle Clerk availability gracefully
  let user = null;
  try {
    const clerkData = useUser();
    user = clerkData.user || null;
  } catch (error) {
    console.warn('Clerk not available in BetsPage:', error.message);
    user = null;
  }

  // Mock betting data to avoid API calls
  const mockBets = useMemo(() => [
    {
      id: 1,
      match: 'David Taylor vs Yanni D',
      event: 'NCAA Championships',
      betAmount: 50,
      odds: 2.1,
      potentialWin: 105,
      status: 'pending',
      date: '2025-01-15',
      wrestler: 'David Taylor'
    },
    {
      id: 2,
      match: 'Gassmoupour P vs Hassan Yazdani',
      event: 'World Championships',
      betAmount: 75,
      odds: 1.8,
      potentialWin: 135,
      status: 'won',
      date: '2025-01-10',
      wrestler: 'Hassan Yazdani'
    },
    {
      id: 3,
      match: 'Jordan Burroughs vs Kyle Dake',
      event: 'US Open',
      betAmount: 100,
      odds: 2.5,
      potentialWin: 250,
      status: 'lost',
      date: '2025-01-05',
      wrestler: 'Jordan Burroughs'
    }
  ], []);

  const mockStats = useMemo(() => ({
    totalBets: 3,
    totalWon: 1,
    totalLost: 1,
    totalPending: 1,
    winRate: 33.3,
    totalWagered: 225,
    totalWon: 135,
    netProfit: -90
  }), []);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setBets(mockBets);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [mockBets]);

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
      const matchesSearch = bet.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bet.event.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bets, filterStatus, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'won': return 'text-green-400 bg-green-400/10';
      case 'lost': return 'text-red-400 bg-red-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return '✅';
      case 'lost': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading your betting history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Error loading betting data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">🎯 Your Betting Dashboard</h1>
        <p className="text-gray-300 text-lg">
          Track your bets, analyze your performance, and manage your wrestling predictions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-xl font-bold text-white mb-1">Total Bets</h3>
          <p className="text-2xl font-bold text-yellow-400">{mockStats.totalBets}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-xl font-bold text-white mb-1">Win Rate</h3>
          <p className="text-2xl font-bold text-green-400">{mockStats.winRate}%</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-xl font-bold text-white mb-1">Total Wagered</h3>
          <p className="text-2xl font-bold text-blue-400">${mockStats.totalWagered}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="text-xl font-bold text-white mb-1">Net Profit</h3>
          <p className={`text-2xl font-bold ${mockStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${mockStats.netProfit}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
        {[
          { id: 'history', label: 'Betting History', icon: '📋' },
          { id: 'stats', label: 'Statistics', icon: '📊' },
          { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
              currentTab === tab.id
                ? 'bg-yellow-400 text-slate-900'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {currentTab === 'history' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search matches or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Betting History */}
          <div className="space-y-4">
            {filteredBets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Bets Found</h3>
                <p className="text-gray-300">Start placing bets to see your history here!</p>
              </div>
            ) : (
              filteredBets.map((bet) => (
                <div key={bet.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getStatusIcon(bet.status)}</span>
                        <h3 className="text-xl font-bold text-white">{bet.match}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bet.status)}`}>
                          {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2">{bet.event}</p>
                      <p className="text-sm text-gray-400">Bet on: {bet.wrestler}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 text-right">
                      <div>
                        <p className="text-sm text-gray-400">Bet Amount</p>
                        <p className="text-lg font-bold text-white">${bet.betAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Odds</p>
                        <p className="text-lg font-bold text-yellow-400">{bet.odds}x</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Potential Win</p>
                        <p className="text-lg font-bold text-green-400">${bet.potentialWin}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {currentTab === 'stats' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">📊 Detailed Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Performance Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Bets Placed:</span>
                  <span className="text-white font-semibold">{mockStats.totalBets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bets Won:</span>
                  <span className="text-green-400 font-semibold">{mockStats.totalWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bets Lost:</span>
                  <span className="text-red-400 font-semibold">{mockStats.totalLost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending Bets:</span>
                  <span className="text-yellow-400 font-semibold">{mockStats.totalPending}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Wagered:</span>
                  <span className="text-blue-400 font-semibold">${mockStats.totalWagered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Won:</span>
                  <span className="text-green-400 font-semibold">${mockStats.totalWon}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Net Profit:</span>
                  <span className={`font-semibold ${mockStats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${mockStats.netProfit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-yellow-400 font-semibold">{mockStats.winRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'leaderboard' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">🏆 Top Bettors</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-2">Leaderboard Coming Soon!</h3>
            <p className="text-gray-300">Compete with other wrestling fans and climb the rankings!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetsPage;