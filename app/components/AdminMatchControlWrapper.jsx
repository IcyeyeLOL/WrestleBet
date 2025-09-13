"use client";

import { useState, useEffect } from 'react';
import AdminMatchControl from './AdminMatchControl';

// Wrapper component to handle async operations properly
const AdminMatchControlWrapper = () => {
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
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading admin panel...</div>
      </div>
    );
  }

  return <AdminMatchControl />;
};

export default AdminMatchControlWrapper;

