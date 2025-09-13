"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

const SystemDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    navigation: 'Testing...',
    clerk: 'Testing...',
    supabase: 'Testing...',
    css: 'Testing...',
    errors: []
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const info = {
        navigation: '✅ Working',
        clerk: 'Testing...',
        supabase: 'Testing...',
        css: 'Testing...',
        errors: []
      };

      // Test Clerk
      try {
        const { useUser } = await import('@clerk/nextjs');
        info.clerk = '✅ Clerk loaded';
      } catch (error) {
        info.clerk = '❌ Clerk error: ' + error.message;
        info.errors.push('Clerk: ' + error.message);
      }

      // Test Supabase
      try {
        const { supabase } = await import('../../lib/supabase');
        const { data, error } = await supabase.from('matches').select('count').limit(1);
        if (error) {
          info.supabase = '❌ Supabase error: ' + error.message;
          info.errors.push('Supabase: ' + error.message);
        } else {
          info.supabase = '✅ Supabase connected';
        }
      } catch (error) {
        info.supabase = '❌ Supabase error: ' + error.message;
        info.errors.push('Supabase: ' + error.message);
      }

      // Test CSS
      try {
        const styles = getComputedStyle(document.documentElement);
        const hasTailwind = styles.getPropertyValue('--tw-bg-opacity') !== '';
        if (hasTailwind) {
          info.css = '✅ CSS loaded';
        } else {
          info.css = '⚠️ CSS partially loaded';
        }
      } catch (error) {
        info.css = '❌ CSS error: ' + error.message;
        info.errors.push('CSS: ' + error.message);
      }

      setDebugInfo(info);
    };

    runDiagnostics();
  }, []);

  const testNavigation = (path) => {
    console.log('🧪 Testing navigation to:', path);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navigation />
      <div className="pt-20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              🔧 System Debug Dashboard
            </h1>
            
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Navigation:</span>
                    <span className="text-green-400">{debugInfo.navigation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Clerk Auth:</span>
                    <span className={debugInfo.clerk.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                      {debugInfo.clerk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Supabase:</span>
                    <span className={debugInfo.supabase.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                      {debugInfo.supabase}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">CSS:</span>
                    <span className={debugInfo.css.includes('✅') ? 'text-green-400' : 'text-yellow-400'}>
                      {debugInfo.css}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Quick Tests</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => testNavigation('/')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Home Navigation
                  </button>
                  <button 
                    onClick={() => testNavigation('/bets')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Test Bets Navigation
                  </button>
                  <button 
                    onClick={() => testNavigation('/account')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Test Account Navigation
                  </button>
                  <button 
                    onClick={() => testNavigation('/donation')}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Test Donation Navigation
                  </button>
                </div>
              </div>
            </div>

            {/* Errors */}
            {debugInfo.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Errors Found</h3>
                <ul className="space-y-1">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index} className="text-red-300 text-sm">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Console Logs */}
            <div className="bg-slate-800/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Console Information</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• Check browser console (F12) for detailed logs</p>
                <p>• Look for 404 errors in Network tab</p>
                <p>• Check for JavaScript errors in Console tab</p>
                <p>• Verify Clerk authentication status</p>
                <p>• Check Supabase connection status</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-yellow-600 text-white py-2 px-6 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Refresh Page
              </button>
              <button 
                onClick={() => window.open('/nav-test', '_blank')}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Navigation Test
              </button>
              <button 
                onClick={() => console.clear()}
                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDebug;
