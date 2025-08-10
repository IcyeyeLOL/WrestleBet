"use client";
import React, { useState } from 'react';
import SharedHeader from './SharedHeader';
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';

const BetsPage = () => {
  const [currentTab, setCurrentTab] = useState('history');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add error handling for context
  let bets = [];
  let bettingStats = {};
  let simulateBetResult = () => {};
  
  try {
    const bettingContext = useBetting();
    if (bettingContext) {
      bets = bettingContext.bets || [];
      bettingStats = bettingContext.bettingStats || {};
      simulateBetResult = bettingContext.simulateBetResult || (() => {});
    }
  } catch (error) {
    console.error('Error accessing betting context:', error);
  }
  
  // Filter bets based on search and status
  const filteredBets = bets.filter(bet => {
    const matchesSearch = bet.match?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bet.event?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bet.wrestler?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bet.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Separate current (pending) bets from history
  const currentBets = filteredBets.filter(bet => bet.status === 'pending');
  const historyBets = filteredBets.filter(bet => bet.status !== 'pending');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won': return '✅';
      case 'lost': return '❌';
      case 'pending': return '⏳';
      default: return '📊';
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'won': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <SharedHeader />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Betting Dashboard</h1>
          <p className="text-slate-400">Track your wrestling betting performance and history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400 mb-2">{bettingStats.totalBets}</div>
            <div className="text-slate-300 text-sm">Total Bets</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-2xl font-bold text-green-400 mb-2">{bettingStats.wonBets}</div>
            <div className="text-slate-300 text-sm">Won Bets</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-2xl font-bold text-yellow-400 mb-2">{bettingStats.totalWinnings?.toFixed(0)} WC</div>
            <div className="text-slate-300 text-sm">Total Winnings</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400 mb-2">{bettingStats.winRate}%</div>
            <div className="text-slate-300 text-sm">Win Rate</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="text-2xl font-bold text-red-400 mb-2">{bettingStats.totalSpent} WC</div>
            <div className="text-slate-300 text-sm">Total Spent</div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 mb-8">
          <div className="border-b border-slate-700">
            <div className="hidden md:flex space-x-8 px-6">
              <button
                onClick={() => setCurrentTab('history')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === 'history'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Betting History
              </button>
              <button
                onClick={() => setCurrentTab('current')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === 'current'
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Current Bets
              </button>
            </div>

            <div className="md:hidden px-4 py-3">
              <select
                value={currentTab}
                onChange={(e) => setCurrentTab(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="history">📊 Betting History</option>
                <option value="current">⏳ Current Bets</option>
              </select>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {currentTab === 'history' ? (
              <div className="space-y-3 md:space-y-4">
                {historyBets.length > 0 ? (
                  historyBets.map((bet) => (
                    <div key={bet.id} className="bg-slate-700/30 rounded-lg p-3 md:p-4 border border-slate-600/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{bet.match}</h3>
                          <p className="text-slate-400 text-sm">{bet.event} • {bet.weight}</p>
                          <p className="text-slate-300 text-sm mt-1">{bet.bet}</p>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusClasses(bet.status)}`}>
                          {getStatusIcon(bet.status)} {bet.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="text-slate-400">
                          Bet: {bet.amount} WC • Odds: {bet.odds}
                        </div>
                        <div className="text-slate-300 font-medium">
                          {bet.result}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <div className="text-slate-400 mb-2">No betting history yet</div>
                    <div className="text-slate-500 text-sm">Place some bets to see your history here</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {currentBets.length > 0 ? (
                  currentBets.map((bet) => (
                    <div key={bet.id} className="bg-slate-700/30 rounded-lg p-3 md:p-4 border border-slate-600/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{bet.match}</h3>
                          <p className="text-slate-400 text-sm">{bet.event} • {bet.weight}</p>
                          <p className="text-slate-300 text-sm mt-1">{bet.bet}</p>
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusClasses(bet.status)}`}>
                          {getStatusIcon(bet.status)} {bet.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="text-slate-400">
                          Bet: {bet.amount} WC • Potential: {bet.potential} WC
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => simulateBetResult(bet.id, 'won')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs transition-colors"
                          >
                            Simulate Win
                          </button>
                          <button
                            onClick={() => simulateBetResult(bet.id, 'lost')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs transition-colors"
                          >
                            Simulate Loss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <div className="text-slate-400 mb-2">No current bets</div>
                    <div className="text-slate-500 text-sm">Place some bets to see them here</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetsPage;