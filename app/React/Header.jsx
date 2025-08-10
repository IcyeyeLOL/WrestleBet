"use client";

// components/Header.jsx
import React from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

const Header = () => {
  const { user, isSignedIn } = useUser();

  const isAdmin = isSignedIn && (
    user?.emailAddresses?.[0]?.emailAddress === 'admin@wrestlebet.com' ||
    user?.publicMetadata?.role === 'admin' ||
    user?.username === 'admin'
  );

  return (
    <header className="relative z-10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-yellow-400 text-2xl font-bold hover:text-yellow-300 transition-colors">
          WrestleBet
        </Link>
        <nav className="flex items-center space-x-8">
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition-colors">
            Home
          </Link>
          <Link href="/bets" className="text-yellow-400 hover:text-yellow-300 transition-colors">
            Betting
          </Link>
          <Link href="/account" className="text-yellow-400 hover:text-yellow-300 transition-colors">
            Account
          </Link>
          <Link href="/donation" className="text-yellow-400 hover:text-yellow-300 font-semibold">
            Donation
          </Link>
          {isAdmin && (
            <>
              <div className="w-px h-6 bg-yellow-400/50"></div>
              <div className="flex items-center space-x-4">
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                  🛡️ Admin
                </span>
                <Link 
                  href="/admin" 
                  className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                >
                  Control Panel
                </Link>
                <Link 
                  href="/admin/analytics" 
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Analytics
                </Link>
                <Link 
                  href="/admin/users" 
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Users
                </Link>
              </div>
            </>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Header;