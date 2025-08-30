"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function AdminAccessPage() {
  const [showKey, setShowKey] = useState(false);
  const adminKey = 'wrestlebet-admin-2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-2xl w-full text-center">
        <div className="text-6xl mb-6">🔑</div>
        <h1 className="text-4xl font-bold text-white mb-6">Admin Access Guide</h1>
        
        <div className="space-y-6 text-left">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-400 font-bold text-lg mb-2">Method 1: Direct URL</h3>
            <p className="text-slate-300">Navigate directly to <code className="bg-slate-800 px-2 py-1 rounded text-yellow-400">/admin</code></p>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <h3 className="text-green-400 font-bold text-lg mb-2">Method 2: Navigation Link</h3>
            <p className="text-slate-300">Click the "Admin" link in the main navigation header</p>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-purple-400 font-bold text-lg mb-2">Method 3: Admin Key</h3>
            <p className="text-slate-300 mb-3">Use this admin key when prompted:</p>
            <div className="flex items-center justify-center gap-3">
              <code className="bg-slate-800 px-4 py-2 rounded text-yellow-400 font-mono text-lg">
                {showKey ? adminKey : '••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowKey(!showKey)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-3">
          <Link 
            href="/admin"
            className="block w-full bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold transition-colors"
          >
            🚀 Go to Admin Panel
          </Link>
          
          <Link 
            href="/"
            className="block w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        
        <div className="mt-6 text-xs text-slate-400">
          <p>💡 <strong>Pro tip:</strong> Bookmark this page for quick admin access!</p>
        </div>
      </div>
    </div>
  );
}

