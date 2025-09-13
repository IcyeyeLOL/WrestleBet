"use client";

import React, { useState, useEffect } from 'react';
import { BettingProvider as SimpleBettingProvider } from './SimpleBettingContext';

// Wrapper component to handle async operations properly
const SimpleBettingProviderWrapper = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-600">Loading betting system...</div>
      </div>
    );
  }

  return <SimpleBettingProvider>{children}</SimpleBettingProvider>;
};

export const BettingProvider = SimpleBettingProviderWrapper;

export default SimpleBettingProviderWrapper;
