"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const NavigationTest = () => {
  const router = useRouter();

  const testNavigation = (path) => {
    console.log('🧪 Testing navigation to:', path);
    console.log('📍 Current URL:', window.location.href);
    
    // Try different navigation methods
    try {
      router.push(path);
      console.log('✅ Router.push called successfully');
    } catch (error) {
      console.error('❌ Router.push failed:', error);
    }
    
    // Fallback to window.location
    setTimeout(() => {
      if (window.location.pathname !== path) {
        console.log('⚠️ Router.push didn\'t work, trying window.location');
        window.location.href = path;
      }
    }, 500);
  };

  return (
    <div className="fixed top-20 right-4 bg-slate-800 p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-yellow-400 font-bold mb-2">Navigation Test</h3>
      <div className="space-y-2">
        <button 
          onClick={() => testNavigation('/')}
          className="block w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Home
        </button>
        <button 
          onClick={() => testNavigation('/bets-simple')}
          className="block w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Simple Bets
        </button>
        <button 
          onClick={() => testNavigation('/account-simple')}
          className="block w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Test Simple Account
        </button>
        <button 
          onClick={() => testNavigation('/simple-test')}
          className="block w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Test Simple Page
        </button>
      </div>
    </div>
  );
};

export default NavigationTest;
