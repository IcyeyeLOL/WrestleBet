"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import AdminMatchControl from '../components/AdminMatchControl';
import AdminUsers from '../components/AdminUsers';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminSettings from '../components/AdminSettings';

export default function AdminPage() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <AdminLayout currentPage="dashboard">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white">🛡️ Admin Panel</h1>
                <p className="text-gray-300 mt-2">Manage matches, users, analytics, and system settings</p>
              </div>
              <Link 
                href="/" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>Go Home</span>
              </Link>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
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
                <div className="text-white text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
                  <p className="text-gray-300">Select a section above to manage the application.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

