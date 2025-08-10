"use client";
import React from 'react';
import { useBetting } from '../contexts/SimpleBettingContext';

const DebugPanel = () => {
  const { pollData, selectedVotes, odds, loading } = useBetting();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      <h3 className="text-yellow-400 font-bold mb-2">🔧 Debug Panel</h3>
      
      <div className="mb-2">
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
      </div>
      
      <div className="mb-2">
        <strong>Selected Votes:</strong>
        <pre className="bg-gray-800 p-1 rounded mt-1 overflow-auto max-h-20">
          {JSON.stringify(selectedVotes, null, 2)}
        </pre>
      </div>
      
      <div className="mb-2">
        <strong>Poll Data:</strong>
        <pre className="bg-gray-800 p-1 rounded mt-1 overflow-auto max-h-32">
          {JSON.stringify(pollData, null, 2)}
        </pre>
      </div>
      
      <div>
        <strong>Odds:</strong>
        <pre className="bg-gray-800 p-1 rounded mt-1 overflow-auto max-h-20">
          {JSON.stringify(odds, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;
