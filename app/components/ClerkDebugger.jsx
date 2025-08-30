"use client";

import React, { useEffect } from 'react';

export default function ClerkDebugger() {
  useEffect(() => {
    // Set up global error handler for Clerk-related errors
    const handleGlobalError = (event) => {
      const error = event.error || event.reason;
      
      if (error && (
        error.message?.toLowerCase().includes('clerk') ||
        error.message?.toLowerCase().includes('sign') ||
        error.message?.toLowerCase().includes('auth') ||
        error.stack?.toLowerCase().includes('clerk')
      )) {
        console.error('🔍 Clerk Error Detected:', error);
        console.error('Error Details:', {
          message: error.message,
          code: error.code,
          status: error.status,
          stack: error.stack,
          type: event.type
        });
      }
    };

    // Add global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleGlobalError);
      
      // Also catch console errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const errorMessage = args.join(' ');
        if (errorMessage.toLowerCase().includes('clerk')) {
          console.log('🔍 Clerk Console Error Detected:', args);
        }
        originalConsoleError.apply(console, args);
      };
    }

    return () => {
      // Clean up event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleGlobalError);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
