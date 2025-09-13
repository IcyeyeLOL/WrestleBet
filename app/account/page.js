"use client";

import React, { Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import Navigation from '../components/Navigation';

// Lazy load the AccountPage component to prevent blocking navigation
const AccountPage = React.lazy(() => import('../components/AccountPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
      <p className="text-yellow-400">Loading account page...</p>
    </div>
  </div>
);

// Error boundary component
class AccountErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Account page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <Navigation />
          <div className="pt-20 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Page Error
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  There was an error loading the account page. Please try refreshing or contact support.
                </p>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
                >
                  Refresh Page
                </button>
                <a 
                  href="/"
                  className="block w-full border-2 border-white/30 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Account() {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // If not signed in, show sign-up required message
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <Navigation />
        <div className="pt-20 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                👤 Sign Up Required
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Create an account to access your profile, manage settings, and track your wrestling predictions!
              </p>
            </div>
            
            <div className="space-y-4">
              <a 
                href="/sign-up"
                className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
              >
                Sign Up Now
              </a>
              <a 
                href="/sign-in"
                className="block w-full border-2 border-white/30 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Already have an account? Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the account page for authenticated users with error boundary
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navigation />
      <div className="pt-20">
        <AccountErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <AccountPage />
          </Suspense>
        </AccountErrorBoundary>
      </div>
    </div>
  );
}