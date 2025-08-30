"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const AdminLayout = ({ children, currentPage = 'dashboard' }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [adminAccess, setAdminAccess] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Admin key for access
  const ADMIN_KEY = 'wrestlebet-admin-2025';

  // Check if user has admin access
  const isAdmin = isSignedIn && (
    adminAccess ||
    user?.emailAddresses?.[0]?.emailAddress === 'admin@wrestlebet.com' ||
    user?.publicMetadata?.role === 'admin' ||
    user?.username === 'admin' ||
    user?.firstName === 'Kunle' || // Added your user
    user?.username === 'Kunle' ||  // Alternative check
    localStorage.getItem('wrestlebet_admin_access') === 'true'
  );

  useEffect(() => {
    // Check localStorage for saved admin access
    if (localStorage.getItem('wrestlebet_admin_access') === 'true') {
      setAdminAccess(true);
    }
  }, []);

  const handleAdminKeySubmit = (e) => {
    e.preventDefault();
    if (adminKeyInput === ADMIN_KEY) {
      setAdminAccess(true);
      localStorage.setItem('wrestlebet_admin_access', 'true');
      setShowKeyInput(false);
      setAdminKeyInput('');
    } else {
      alert('Invalid admin key');
    }
  };

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/');
    }
  }, [isLoaded, isAdmin, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="bg-red-500/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-500/20 max-w-md w-full text-center">
          <div className="text-6xl mb-4">�️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-gray-300 mb-6">Enter the admin key to access the admin panel.</p>
          
          {!showKeyInput ? (
            <div className="space-y-4">
              <button
                onClick={() => setShowKeyInput(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors w-full"
              >
                🔑 Enter Admin Key
              </button>
              <Link href="/" className="block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
                Go Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleAdminKeySubmit} className="space-y-4">
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter admin key..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Access Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowKeyInput(false);
                    setAdminKeyInput('');
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: '🏠' },
    { id: 'matches', label: 'Match Control', href: '/admin', icon: '🥊' },
    { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: '📊' },
    { id: 'users', label: 'Users', href: '/admin/users', icon: '👥' },
    { id: 'bets', label: 'Betting Pools', href: '/admin/bets', icon: '💰' },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🛡️</span>
              </div>
              <div>
                <h3 className="text-white font-bold">Admin Panel</h3>
                <p className="text-gray-400 text-sm">WrestleBet Control</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Home Navigation Button */}
              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-green-400 hover:bg-green-500/20 hover:text-green-300"
                >
                  <span className="text-xl">🏠</span>
                  <span className="font-medium">Go Home</span>
                </Link>
              </div>
            </nav>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {user?.firstName || user?.username || 'Admin'}
                  </p>
                  <p className="text-gray-400 text-xs">Administrator</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('wrestlebet_admin_access');
                  setAdminAccess(false);
                  router.push('/');
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
              >
                🚪 Logout Admin
              </button>
            </div>
          </div>
        </div>

        {/* Main Admin Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;