"use client";

import { useState, useEffect } from 'react';
import { safeFetch } from '../lib/safeFetch';

export default function AdminTestPage() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testMatch, setTestMatch] = useState({
    wrestler1: 'Test Wrestler 1',
    wrestler2: 'Test Wrestler 2',
    eventName: 'Test Event',
    weightClass: '74kg'
  });

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Admin Access
    results.adminAccess = localStorage.getItem('wrestlebet_admin_access') === 'true';

    // Test 2: API Health
    try {
      const healthResponse = await safeFetch('/api/health');
      results.apiHealth = healthResponse.success;
    } catch (error) {
      results.apiHealth = false;
    }

    // Test 3: Match Loading
    try {
      const matchesResponse = await safeFetch('/api/admin/matches');
      results.matchLoading = matchesResponse.success;
      results.matchCount = matchesResponse.data?.matches?.length || 0;
    } catch (error) {
      results.matchLoading = false;
      results.matchCount = 0;
    }

    // Test 4: Match Creation
    try {
      const createResponse = await safeFetch('/api/admin/matches', {
        method: 'POST',
        body: JSON.stringify({
          ...testMatch,
          adminKey: 'wrestlebet-admin-2025'
        })
      });
      results.matchCreation = createResponse.success;
      if (createResponse.success) {
        results.createdMatch = createResponse.data.match;
      }
    } catch (error) {
      results.matchCreation = false;
    }

    setTestResults(results);
    setLoading(false);
  };

  const grantAdminAccess = () => {
    localStorage.setItem('wrestlebet_admin_access', 'true');
    setTestResults(prev => ({ ...prev, adminAccess: true }));
    alert('Admin access granted!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">🧪 Admin Portal Test</h1>
          
          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Test Results</h2>
              <div className="space-y-2 text-white">
                <p><strong>Admin Access:</strong> {testResults.adminAccess ? '✅ Granted' : '❌ Not Granted'}</p>
                <p><strong>API Health:</strong> {testResults.apiHealth ? '✅ Working' : '❌ Failed'}</p>
                <p><strong>Match Loading:</strong> {testResults.matchLoading ? '✅ Working' : '❌ Failed'}</p>
                <p><strong>Match Creation:</strong> {testResults.matchCreation ? '✅ Working' : '❌ Failed'}</p>
                <p><strong>Matches Found:</strong> {testResults.matchCount || 0}</p>
              </div>
            </div>

            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Test Match Data</h2>
              <div className="space-y-2 text-white">
                <p><strong>Wrestler 1:</strong> {testMatch.wrestler1}</p>
                <p><strong>Wrestler 2:</strong> {testMatch.wrestler2}</p>
                <p><strong>Event:</strong> {testMatch.eventName}</p>
                <p><strong>Weight Class:</strong> {testMatch.weightClass}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={runTests}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? '🔄 Running Tests...' : '🧪 Run All Tests'}
            </button>
            
            <button
              onClick={grantAdminAccess}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              ✅ Grant Admin Access
            </button>
          </div>

          {/* Detailed Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Detailed Results</h2>
              <pre className="text-green-400 text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <a
              href="/admin"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              🚀 Go to Admin Panel
            </a>
            
            <a
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              🏠 Go Home
            </a>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-orange-500/20 border border-orange-500/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">How to Test Admin Portal</h2>
            <div className="text-white space-y-2">
              <p><strong>1.</strong> Click "Grant Admin Access" above</p>
              <p><strong>2.</strong> Click "Run All Tests" to verify functionality</p>
              <p><strong>3.</strong> Click "Go to Admin Panel" to test manually</p>
              <p><strong>4.</strong> Try creating a new match in the admin panel</p>
              <p><strong>5.</strong> Check if the match appears on the front page</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
