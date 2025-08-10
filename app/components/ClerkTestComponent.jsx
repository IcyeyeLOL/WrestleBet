"use client";

import React from 'react';
import { SignInButton, SignOutButton, useUser, UserButton } from '@clerk/nextjs';

const ClerkTestComponent = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-white/10 backdrop-blur">
      <h3 className="text-lg font-bold mb-4">🔐 Clerk Authentication Test</h3>
      
      {isSignedIn ? (
        <div className="space-y-3">
          <div className="text-green-400">
            ✅ Successfully signed in as: {user.emailAddresses[0]?.emailAddress}
          </div>
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <SignOutButton>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-yellow-400">
            ⚠️ Not signed in
          </div>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              Sign In with Clerk
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
};

export default ClerkTestComponent;
