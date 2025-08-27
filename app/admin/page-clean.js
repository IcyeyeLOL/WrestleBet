"use client";

import { useState } from 'react';

export default function AdminPage() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🛡️ Admin Panel - Working!</h1>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <p className="text-white text-lg">✅ Admin panel is loading successfully!</p>
          <p className="text-gray-300 mt-2">Current page: {activePage}</p>
          
          <div className="mt-6 space-y-4">
            <button 
              onClick={() => setActivePage('matches')}
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-left transition-colors"
            >
              🥊 Match Control - Clicked: {activePage === 'matches' ? 'YES' : 'NO'}
            </button>
            <button 
              onClick={() => setActivePage('analytics')}
              className="block w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-left transition-colors"
            >
              📊 Analytics - Clicked: {activePage === 'analytics' ? 'YES' : 'NO'}
            </button>
            <button 
              onClick={() => setActivePage('users')}
              className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-left transition-colors"
            >
              👥 Users - Clicked: {activePage === 'users' ? 'YES' : 'NO'}
            </button>
          </div>

          {activePage !== 'dashboard' && (
            <div className="mt-8 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <h2 className="text-xl font-semibold text-white mb-2">🎉 {activePage.toUpperCase()} Section</h2>
              <p className="text-green-300 font-semibold">✅ Button clicks are working! Page state: {activePage}</p>
              <p className="text-gray-300 mt-2">No more &quot;Element type is invalid&quot; errors!</p>
              <button 
                onClick={() => setActivePage('dashboard')}
                className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white/5 rounded-lg p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">🔧 Debug Info</h3>
          <p className="text-gray-300">Current time: {new Date().toLocaleTimeString()}</p>
          <p className="text-gray-300">Active page: {activePage}</p>
          <p className="text-gray-300">React rendering: ✅ Working</p>
        </div>
      </div>
    </div>
  );
}
