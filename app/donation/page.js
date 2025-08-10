'use client';

import { useUser, SignIn } from '@clerk/nextjs';
import DonationPage from '../React/DonationPage';

export default function Donation() {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // If not signed in, show sign-up required message
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              💝 Sign Up Required
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Create an account to make donations and support the WrestleBet platform!
            </p>
          </div>
          
          <div className="space-y-4">
            <a 
              href="/signup"
              className="block w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold py-3 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
            >
              Sign Up Now
            </a>
            <a 
              href="/signin"
              className="block w-full border-2 border-white/30 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Already have an account? Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <DonationPage />;
}
