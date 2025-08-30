"use client";

import React, { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';

export default function ClerkDebugger() {
  const { client } = useClerk();

  useEffect(() => {
    // Listen for Clerk errors
    const handleError = (error) => {
      console.error('🔍 Clerk Error Detected:', error);
      console.error('Error Details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
    };

    // Listen for sign-up errors
    const handleSignUpError = (error) => {
      console.error('🔍 Clerk Sign-Up Error:', error);
      console.error('Sign-Up Error Details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        email: error.email,
        stack: error.stack
      });
    };

    // Add error listeners
    if (client) {
      client.addListener('error', handleError);
      client.addListener('signUpError', handleSignUpError);
    }

    return () => {
      if (client) {
        client.removeListener('error', handleError);
        client.removeListener('signUpError', handleSignUpError);
      }
    };
  }, [client]);

  return null; // This component doesn't render anything
}
