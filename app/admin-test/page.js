"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminAccessTest() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [adminAccess, setAdminAccess] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Check localStorage for admin access
    const hasAdminAccess = localStorage.getItem('wrestlebet_admin_access') === 'true';
    setAdminAccess(hasAdminAccess);
  }, []);

  const runTests = () => {
    const results = {
      clerkLoaded: isLoaded,
      userSignedIn: isSignedIn,
      userEmail: user?.emailAddresses?.[0]?.emailAddress || 'Not signed in',
      userName: user?.username || 'No username',
      userFirstName: user?.firstName || 'No first name',
      localStorageAccess: localStorage.getItem('wrestlebet_admin_access') === 'true',
      adminKey: 'wrestlebet-admin-2025'
    };
    setTestResults(results);
  };

  const grantAdminAccess = () => {
    localStorage.setItem('wrestlebet_admin_access', 'true');
    setAdminAccess(true);
    alert('Admin access granted! You can now access the admin panel.');
  };

  const revokeAdminAccess = () => {
    localStorage.removeItem('wrestlebet_admin_access');
    setAdminAccess(false);
    alert('Admin access revoked.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">🔧 Admin Access Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Status */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Current Status</h2>
              <div className="space-y-2 text-white">
                <p><strong>Clerk Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</p>
                <p><strong>User Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Admin Access:</strong> {adminAccess ? '✅ Granted' : '❌ Not Granted'}</p>
                <p><strong>User Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'Not signed in'}</p>
                <p><strong>Username:</strong> {user?.username || 'No username'}</p>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Test Results</h2>
              {Object.keys(testResults).length > 0 ? (
                <div className="space-y-2 text-white">
                  {Object.entries(testResults).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">Click "Run Tests" to see results</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={runTests}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🧪 Run Tests
              </button>
              
              <button
                onClick={grantAdminAccess}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                ✅ Grant Admin Access
              </button>
              
              <button
                onClick={revokeAdminAccess}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                ❌ Revoke Admin Access
              </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/admin"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🚀 Go to Admin Panel
              </Link>
              
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                🏠 Go Home
              </Link>
            </div>
          </div>

          {/* Admin Key Info */}
          <div className="mt-8 bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Admin Key Information</h2>
            <div className="text-white">
              <p><strong>Admin Key:</strong> <code className="bg-slate-800 px-2 py-1 rounded text-yellow-400">wrestlebet-admin-2025</code></p>
              <p className="mt-2 text-gray-300">Use this key when prompted in the admin panel.</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-orange-500/20 border border-orange-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Access Methods</h2>
            <div className="text-white space-y-2">
              <p><strong>Method 1:</strong> Use the admin key above when prompted</p>
              <p><strong>Method 2:</strong> Click "Grant Admin Access" button above</p>
              <p><strong>Method 3:</strong> Run the admin-access-helper.js script in browser console</p>
              <p><strong>Method 4:</strong> Sign in with admin@wrestlebet.com email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
