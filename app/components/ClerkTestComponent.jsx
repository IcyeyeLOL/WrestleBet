"use client";

import { useAuth, useUser } from '@clerk/nextjs';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function ClerkTestComponent() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20">
      <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Clerk Key Set:</strong> {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Yes' : '❌ No'}</p>
        <p><strong>Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
        {isSignedIn && user && (
          <p><strong>User:</strong> {user.firstName} {user.lastName} ({user.emailAddresses[0]?.emailAddress})</p>
        )}
      </div>

      <div className="flex gap-2">
        {!isSignedIn ? (
          <>
            <a href="/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign In
            </a>
            <a href="/sign-up" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Sign Up
            </a>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span>Welcome!</span>
            <UserButton />
          </div>
        )}
      </div>
    </div>
  );
}
