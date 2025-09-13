"use client";

import { useState, useEffect } from 'react';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [period, activeTab]);

  const loadAnalytics = () => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}&type=${activeTab}`, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setAnalyticsData(data.data);
      }
    })
    .catch(error => {
      console.error('Failed to load analytics:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'border-blue-500 text-blue-400',
      green: 'border-green-500 text-green-400',
      purple: 'border-purple-500 text-purple-400',
      yellow: 'border-yellow-500 text-yellow-400',
      red: 'border-red-500 text-red-400'
    };

    return (
      <div className={`bg-gray-800 rounded-lg p-4 border-l-4 ${colorClasses[color]}`}>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    );
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 text-sm font-medium rounded-lg ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <select 
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
        <TabButton id="betting" label="Betting" isActive={activeTab === 'betting'} onClick={setActiveTab} />
        <TabButton id="users" label="Users" isActive={activeTab === 'users'} onClick={setActiveTab} />
        <TabButton id="revenue" label="Revenue" isActive={activeTab === 'revenue'} onClick={setActiveTab} />
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analyticsData?.overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={formatNumber(analyticsData.overview.totalUsers)} 
              color="blue"
            />
            <StatCard 
              title="Total Matches" 
              value={formatNumber(analyticsData.overview.totalMatches)} 
              color="green"
            />
            <StatCard 
              title="Total Bets" 
              value={formatNumber(analyticsData.overview.totalBets)} 
              color="purple"
            />
            <StatCard 
              title="Total Volume" 
              value={`${formatNumber(analyticsData.overview.totalVolume)} WC`} 
              color="yellow"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard 
              title="Total Winnings Paid" 
              value={`${formatNumber(analyticsData.overview.totalWinnings)} WC`} 
              color="green"
              subtitle="Paid to winners"
            />
            <StatCard 
              title="Period" 
              value={period.toUpperCase()} 
              color="blue"
              subtitle="Analytics timeframe"
            />
          </div>
        </div>
      )}

      {/* Betting Tab */}
      {activeTab === 'betting' && analyticsData?.betting && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Active Matches" 
              value={analyticsData.betting.totalMatches} 
              color="blue"
            />
            <StatCard 
              title="Top Match Volume" 
              value={`${formatNumber(Math.max(...(analyticsData.betting.matchStats.map(m => m.totalVolume) || [0])))} WC`} 
              color="green"
            />
            <StatCard 
              title="Average Bet" 
              value={`${formatNumber(
                analyticsData.betting.matchStats.reduce((sum, m) => sum + m.avgBetAmount, 0) / 
                Math.max(analyticsData.betting.matchStats.length, 1)
              )} WC`} 
              color="purple"
            />
          </div>

          {/* Top Matches */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Matches by Volume</h3>
            <div className="space-y-3">
              {analyticsData.betting.matchStats.slice(0, 5).map((match, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-white">
                      {match.match?.wrestler1} vs {match.match?.wrestler2}
                    </p>
                    <p className="text-sm text-gray-400">
                      {match.totalBets} bets • Avg: {formatNumber(match.avgBetAmount)} WC
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatNumber(match.totalVolume)} WC</p>
                    <p className="text-xs text-gray-400">Total Volume</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && analyticsData?.users && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Active Users" 
              value={analyticsData.users.activeUsers} 
              subtitle={`In last ${period}`}
              color="blue"
            />
            <StatCard 
              title="New Users" 
              value={analyticsData.users.newUsersCount} 
              subtitle={`In last ${period}`}
              color="green"
            />
            <StatCard 
              title="Top Bettors" 
              value={analyticsData.users.topBettors.length} 
              subtitle="High-volume users"
              color="purple"
            />
          </div>

          {/* Top Bettors */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Top Bettors</h3>
            <div className="space-y-3">
              {analyticsData.users.topBettors.slice(0, 10).map((user, index) => (
                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">{formatNumber(user.total_spent)} WC</p>
                    <p className="text-xs text-gray-400">Total Spent</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Growth Chart */}
          {Object.keys(analyticsData.users.userGrowth).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">User Growth</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.users.userGrowth).map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center">
                    <span className="text-gray-400">{new Date(date).toLocaleDateString()}</span>
                    <span className="text-white font-semibold">{count} new users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && analyticsData?.revenue && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Revenue" 
              value={`${formatNumber(analyticsData.revenue.totalRevenue)} WC`} 
              subtitle="House edge earnings"
              color="green"
            />
            <StatCard 
              title="Total Payouts" 
              value={`${formatNumber(analyticsData.revenue.totalPayouts)} WC`} 
              subtitle="Paid to winners"
              color="blue"
            />
            <StatCard 
              title="Completed Matches" 
              value={analyticsData.revenue.completedMatches} 
              subtitle={`In last ${period}`}
              color="purple"
            />
          </div>

          {/* Revenue Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Revenue Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">Revenue Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">House Edge (5%)</span>
                    <span className="text-green-400 font-semibold">
                      {formatNumber(analyticsData.revenue.totalRevenue)} WC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payouts to Winners</span>
                    <span className="text-blue-400 font-semibold">
                      {formatNumber(analyticsData.revenue.totalPayouts)} WC
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Margin</span>
                    <span className="text-yellow-400 font-semibold">
                      {analyticsData.revenue.totalRevenue > 0 
                        ? ((analyticsData.revenue.totalRevenue / (analyticsData.revenue.totalRevenue + analyticsData.revenue.totalPayouts)) * 100).toFixed(1) + '%'
                        : '0%'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Revenue per Match</span>
                    <span className="text-purple-400 font-semibold">
                      {analyticsData.revenue.completedMatches > 0 
                        ? formatNumber(analyticsData.revenue.totalRevenue / analyticsData.revenue.completedMatches) + ' WC'
                        : '0 WC'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading analytics data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
