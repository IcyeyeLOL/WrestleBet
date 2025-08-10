"use client";

import React from 'react';

// Simple test component without context dependencies
export default function SimpleBetsTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Simple Bets Page Test</h1>
        <p className="text-gray-300">This is a test to see if the component renders without context dependencies.</p>
      </div>
    </div>
  );
}
