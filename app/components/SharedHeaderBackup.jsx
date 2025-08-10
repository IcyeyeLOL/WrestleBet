"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SharedHeader() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="text-yellow-400 text-2xl font-bold hover:text-yellow-300 transition-colors"
          >
            WrestleBet
          </Link>
          <nav className="flex space-x-8">
            <Link 
              href="/" 
              className={`transition-colors font-medium ${
                isActive('/') 
                  ? 'text-yellow-400' 
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/bets" 
              className={`transition-colors font-medium ${
                isActive('/bets') 
                  ? 'text-yellow-400' 
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Betting
            </Link>
            <Link 
              href="/account" 
              className={`transition-colors font-medium ${
                isActive('/account') 
                  ? 'text-yellow-400' 
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Account
            </Link>
            <Link 
              href="/donation" 
              className={`transition-colors font-medium ${
                isActive('/donation') 
                  ? 'text-yellow-400' 
                  : 'text-white hover:text-yellow-400'
              }`}
            >
              Donation
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
