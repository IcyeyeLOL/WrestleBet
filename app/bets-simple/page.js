"use client";

import React from 'react';
import Navigation from '../components/Navigation';

export default function BetsSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navigation />
      <div className="pt-20 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Betting Page
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              This is a simplified betting page to test navigation!
            </p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/"
              className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}