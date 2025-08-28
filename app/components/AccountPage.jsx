"use client";

import React, { useState } from 'react';
import Link from 'next/link';
// Temporarily using Unicode icons instead of lucide-react
// import { User, Settings, History, Shield, LogOut, Coins, Download, Upload, Eye, EyeOff, Smartphone, Mail, CreditCard, TrendingUp, Check, Plus, Trash2, X } from 'lucide-react';
import SharedHeader from './SharedHeader';
import CurrencyTestPanel from './CurrencyTestPanel';
import EnhancedPaymentMethods from './EnhancedPaymentMethods';
import { useBetting } from '../contexts/SimpleBettingContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useClerk } from '@clerk/nextjs';

const AccountPage = () => {
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showGlobalPaymentModal, setShowGlobalPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    timezone: 'America/New_York',
    language: 'English'
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Get real data from contexts with error handling
  let bets = [];
  let bettingStats = {};
  let bettingLoading = false;
  let balance = 0;
  let transactions = [];
  let getFormattedBalance = () => '0 WC';
  let getBalanceStatus = () => 'normal';
  let currencyLoading = false;
  
  // Move hooks to top level
  const bettingContext = useBetting();
  const currencyContext = useCurrency();
  
  if (bettingContext) {
    bets = bettingContext.bets || [];
    bettingStats = bettingContext.bettingStats || {};
    bettingLoading = bettingContext.loading || false;
  }
  
  if (currencyContext) {
    balance = currencyContext.balance || 0;
    transactions = currencyContext.transactions || [];
    getFormattedBalance = currencyContext.getFormattedBalance || (() => '0 WC');
    getBalanceStatus = currencyContext.getBalanceStatus || (() => 'normal');
    currencyLoading = currencyContext.loading || false;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (formType) => {
    switch (formType) {
      case 'profile':
        alert('Profile updated successfully!');
        break;
      case 'password':
        if (formData.newPassword !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        if (formData.newPassword.length < 8) {
          alert('Password must be at least 8 characters long!');
          return;
        }
        alert('Password updated successfully!');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        break;
      default:
        alert('Settings saved successfully!');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  // Get recent transactions for wallet display
  const recentTransactions = transactions.slice(-10).reverse();

  // Calculate streak and other stats
  const calculateStreak = () => {
    const recentBets = bets.filter(bet => bet.status !== 'pending').slice(-10);
    let currentStreak = 0;
    for (let i = 0; i < recentBets.length; i++) {
      if (recentBets[i].status === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const winStreak = calculateStreak();

  // Use real betting history from context instead of mock data
  const recentBettingHistory = bets.slice(-10).reverse(); // Show last 10 bets

  // Use real stats from betting context
  const realStats = {
    totalBets: bettingStats.totalBets || 0,
    winRate: bettingStats.winRate || 0,
    totalWinnings: bettingStats.totalWinnings || 0,
    currentBalance: balance || 0,
    winStreak: winStreak,
    pendingBets: bettingStats.pendingBets || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <SharedHeader />

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Page Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Account Dashboard</h1>
          <p className="text-gray-400 text-sm md:text-base px-4">Manage your account, view your betting history, and update your preferences</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 md:mb-2">{realStats.totalBets}</div>
            <div className="text-gray-400 text-xs md:text-sm">Total Bets</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1 md:mb-2">{realStats.winRate}%</div>
            <div className="text-gray-400 text-xs md:text-sm">Win Rate</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-1 md:mb-2">{realStats.totalWinnings} WC</div>
            <div className="text-gray-400 text-xs md:text-sm">Winnings</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1 md:mb-2">{getFormattedBalance()}</div>
            <div className="text-gray-400 text-xs md:text-sm">Balance</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1 md:mb-2">{realStats.winStreak}</div>
            <div className="text-gray-400 text-xs md:text-sm">Win Streak</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl border border-slate-700 p-3 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1 md:mb-2">{realStats.pendingBets}</div>
            <div className="text-gray-400 text-xs md:text-sm">Pending</div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 mb-6 md:mb-8">
          {/* Global Payment Methods Button - Always Visible */}
          <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <span style={{fontSize: '20px'}}>💳</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Payment Methods</h3>
                  <p className="text-gray-400 text-sm">Manage your cards for purchasing WrestleCoins</p>
                </div>
              </div>
              <button
                onClick={() => setShowGlobalPaymentModal(true)}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full md:w-auto justify-center"
              >
                <span style={{fontSize: '16px'}}>➕</span>
                Manage Payment Methods
              </button>
            </div>
          </div>
          {/* Tab Navigation - Desktop */}
          <div className="hidden md:flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'profile' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>👤</span>
              Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'history' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>📊</span>
              Betting History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>⚙️</span>
              Settings
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'wallet' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>🪙</span>
              Wallet
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'security' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>🛡️</span>
              Security
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'payment' 
                  ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span style={{fontSize: '20px'}}>💳</span>
              Payment
            </button>
          </div>

          {/* Tab Navigation - Mobile */}
          <div className="md:hidden border-b border-slate-700 px-4 py-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="profile">👤 Profile</option>
              <option value="history">📊 Betting History</option>
              <option value="settings">⚙️ Settings</option>
              <option value="wallet">💰 Wallet</option>
              <option value="security">🔒 Security</option>
              <option value="payment">💳 Payment</option>
            </select>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Profile Information</h2>
                
                <div className="bg-slate-700/30 rounded-lg p-8 border border-slate-600/50 text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Profile Section</h3>
                  <p className="text-gray-400">Profile information form will be implemented here.</p>
                </div>
              </div>
            )}

            {/* Betting History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Betting History</h2>
                  <div className="flex gap-2">
                    <button className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center gap-2">
                      <span className="text-base">📥</span>
                      Export
                    </button>
                  </div>
                </div>
                
                {bettingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading betting history...</p>
                  </div>
                ) : recentBettingHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No betting history yet</p>
                    <Link 
                      href="/" 
                      className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                    >
                      Place Your First Bet
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBettingHistory.map((bet) => (
                      <div key={bet.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{bet.matchId}</h3>
                            <p className="text-gray-400 text-sm mb-2">
                              {bet.wrestler} • {bet.amount} WC at {bet.odds} odds
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(bet.timestamp).toLocaleDateString()} at {new Date(bet.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              bet.status === 'won' ? 'bg-green-400/20 text-green-400' :
                              bet.status === 'lost' ? 'bg-red-400/20 text-red-400' :
                              'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                            </span>
                            <p className="text-white font-semibold mt-1">
                              {bet.status === 'won' ? `+${bet.payout} WC` :
                               bet.status === 'lost' ? `-${bet.amount} WC` :
                               'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Link 
                  href="/bets" 
                  className="inline-block bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                >
                  View All Bets & Statistics
                </Link>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Account Settings</h2>
                <div className="space-y-6">
                  
                  {/* Notification Preferences */}
                  <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-xl">📧</span>
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Email Notifications</h4>
                          <p className="text-gray-400 text-sm">Receive updates about your bets and account activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">SMS Notifications</h4>
                          <p className="text-gray-400 text-sm">Get text messages for bet results and important updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Push Notifications</h4>
                          <p className="text-gray-400 text-sm">Browser notifications for live match updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Betting Preferences */}
                  <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-xl">📈</span>
                      Betting Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Quick Bet Confirmation</h4>
                          <p className="text-gray-400 text-sm">Skip confirmation dialog for bets under 50 WC</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Auto-refresh Odds</h4>
                          <p className="text-gray-400 text-sm">Automatically update odds every 30 seconds</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span style={{fontSize: '20px'}}>🛡️</span>
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Public Profile</h4>
                          <p className="text-gray-400 text-sm">Show your betting statistics on leaderboards</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                          <h4 className="font-semibold text-white">Data Analytics</h4>
                          <p className="text-gray-400 text-sm">Help improve the platform with anonymous usage data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSubmit('settings')}
                  className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Save All Settings
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
                
                {/* Password Change Section */}
                <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span style={{fontSize: '20px'}}>🛡️</span>
                    Change Password
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <span className="text-xl">🙈</span> : <span className="text-xl">👁️</span>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password (min. 8 characters)"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleSubmit('password')}
                    className="mt-4 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    Update Password
                  </button>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 mb-4">
                    <div>
                      <h4 className="font-semibold text-white">SMS Authentication</h4>
                      <p className="text-gray-400 text-sm">Add an extra layer of security with SMS codes</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Enable
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                    <div>
                      <h4 className="font-semibold text-white">Authenticator App</h4>
                      <p className="text-gray-400 text-sm">Use Google Authenticator or similar apps</p>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Setup
                    </button>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div>
                        <h4 className="font-semibold text-white">Current Session</h4>
                        <p className="text-gray-400 text-sm">Windows • Chrome • New York, US</p>
                        <p className="text-gray-500 text-xs">Active now</p>
                      </div>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        Current
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/30">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Account Actions</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleSignOut}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xl">🚪</span>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">WrestleCoins Wallet</h2>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-yellow-400">{getFormattedBalance()}</p>
                    <p className="text-gray-400">Current Balance</p>
                  </div>
                </div>

                {/* Balance Status */}
                <div className={`p-4 rounded-lg border ${
                  getBalanceStatus() === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  getBalanceStatus() === 'low' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      getBalanceStatus() === 'critical' ? 'bg-red-500' :
                      getBalanceStatus() === 'low' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}></div>
                    <div>
                      <p className={`font-semibold ${
                        getBalanceStatus() === 'critical' ? 'text-red-400' :
                        getBalanceStatus() === 'low' ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        {getBalanceStatus() === 'critical' ? 'Critical Balance' :
                         getBalanceStatus() === 'low' ? 'Low Balance' :
                         'Healthy Balance'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {getBalanceStatus() === 'critical' ? 'Consider purchasing more WrestleCoins to continue betting' :
                         getBalanceStatus() === 'low' ? 'Your balance is getting low' :
                         'You have sufficient funds for betting'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span style={{fontSize: '20px'}}>💳</span>
                      Recent Transactions
                    </h3>
                    <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
                      View All
                    </button>
                  </div>
                  
                  {currencyLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading transactions...</p>
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'credit' ? 'bg-green-500/20 text-green-400' :
                              transaction.type === 'debit' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {transaction.type === 'credit' ? <span style={{fontSize: '16px'}}>📤</span> :
                               transaction.type === 'debit' ? <span style={{fontSize: '16px'}}>📥</span> :
                               <span style={{fontSize: '16px'}}>💳</span>}
                            </div>
                            <div>
                              <p className="text-white font-medium">{transaction.description}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(transaction.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} WC
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wallet Testing Panel */}
                <div className="bg-slate-700/20 rounded-lg p-6 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-4">Wallet Management & Testing</h3>
                  <p className="text-gray-400 mb-6">
                    Test currency operations, view detailed transaction history, and manage your WrestleCoins.
                  </p>
                  <CurrencyTestPanel />
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span style={{fontSize: '24px'}}>💳</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Payment Methods</h2>
                  <p className="text-gray-400 mb-6">Your payment methods are now accessible from any tab!</p>
                  <button
                    onClick={() => setShowGlobalPaymentModal(true)}
                    className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <span style={{fontSize: '16px'}}>➕</span>
                    Manage Payment Methods
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Payment Methods Modal */}
      {showGlobalPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                <button
                  onClick={() => setShowGlobalPaymentModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <EnhancedPaymentMethods />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
