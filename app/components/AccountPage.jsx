"use client";

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

const AccountPage = () => {
  const { signOut } = useClerk();
  
  // Handle Clerk availability gracefully
  let user = null;
  try {
    const clerkData = useUser();
    user = clerkData.user || null;
  } catch (error) {
    console.warn('Clerk not available in AccountPage:', error.message);
    user = null;
  }
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.firstName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: user?.phoneNumbers[0]?.phoneNumber || '',
    country: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    timezone: 'America/New_York',
    language: 'English'
  });

  // Mock betting data to avoid API calls
  const mockStats = {
    totalBets: 3,
    totalWon: 1,
    totalLost: 1,
    totalPending: 1,
    winRate: 33.3,
    totalWagered: 225,
    totalWon: 135,
    netProfit: -90,
    joinDate: '2025-01-01',
    lastActive: '2025-01-15'
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Simulate profile update
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Simulate password change
    alert('Password changed successfully!');
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSignOut = () => {
    if (signOut) {
      signOut();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">👤 Account Settings</h1>
        <p className="text-gray-300 text-lg">
          Manage your profile, preferences, and account security
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-3xl text-slate-900">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || '👤'}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </h2>
            <p className="text-gray-300 mb-2">{user?.emailAddresses[0]?.emailAddress}</p>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>Member since: {mockStats.joinDate}</span>
              <span>Last active: {mockStats.lastActive}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
        {[
          { id: 'profile', label: 'Profile', icon: '👤' },
          { id: 'security', label: 'Security', icon: '🔒' },
          { id: 'preferences', label: 'Preferences', icon: '⚙️' },
          { id: 'stats', label: 'Statistics', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === tab.id
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
      {activeTab === 'profile' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">👤 Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Enter your country"
                />
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">🔒 Security Settings</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-12"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Confirm new password"
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">⚙️ Preferences</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
            <div className="text-center">
              <button
                onClick={() => alert('Preferences saved!')}
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">📊 Account Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Betting Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Bets:</span>
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
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-yellow-400 font-semibold">{mockStats.winRate}%</span>
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
                  <span className="text-gray-300">Member Since:</span>
                  <span className="text-gray-400 font-semibold">{mockStats.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;