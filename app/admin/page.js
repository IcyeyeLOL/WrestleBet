"use client";


import { useState } from 'react';
import AdminMatchControl from '../components/AdminMatchControl';
import AdminUsers from '../components/AdminUsers';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminSettings from '../components/AdminSettings';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminPage() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">🛡️ Admin Panel</h1>
          <Link href="/">
            <span className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 cursor-pointer">← Back to Home</span>
          </Link>
        </div>
        <SignedOut>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-white">
            <p className="mb-4">You must be signed in to access the admin panel.</p>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Sign in</button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button 
                onClick={() => setActivePage('matches')}
                className={`px-4 py-3 rounded-lg text-left transition-colors ${activePage==='matches' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                🥊 Match Control
              </button>
              <button 
                onClick={() => setActivePage('analytics')}
                className={`px-4 py-3 rounded-lg text-left transition-colors ${activePage==='analytics' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                📊 Analytics
              </button>
              <button 
                onClick={() => setActivePage('users')}
                className={`px-4 py-3 rounded-lg text-left transition-colors ${activePage==='users' ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                👥 Users
              </button>
              <button 
                onClick={() => setActivePage('settings')}
                className={`px-4 py-3 rounded-lg text-left transition-colors ${activePage==='settings' ? 'bg-gray-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                ⚙️ Settings
              </button>
            </div>

            <div className="mt-8">
              {activePage === 'matches' && <AdminMatchControl />}
              {activePage === 'analytics' && <AdminAnalytics />}
              {activePage === 'users' && <AdminUsers />}
              {activePage === 'settings' && <AdminSettings />}
              {activePage === 'dashboard' && (
                <div className="text-white">Select a section to manage the application.</div>
              )}
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

