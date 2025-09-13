"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';

const Navigation = () => {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Navigation function that works like the debug buttons
  const navigateTo = (path) => {
    console.log('🧭 Navigating to:', path);
    window.location.href = path;
  };

  return (
    <>
      {/* Main Navigation Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <button 
              onClick={() => navigateTo('/')}
              className="flex items-center gap-2 text-yellow-400 text-xl font-black hover:text-yellow-300 transition-colors"
            >
              <span className="text-2xl">🤼</span>
              <span>WrestleBet</span>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigateTo('/')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                Home
              </button>
              
              <button 
                onClick={() => navigateTo('/bets')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/bets') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                Betting
              </button>
              
              <button 
                onClick={() => navigateTo('/account')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/account') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                Account
              </button>
              
              <button 
                onClick={() => navigateTo('/donation')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/donation') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                Donation
              </button>
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-4">
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300 text-sm">
                        Welcome, {user?.firstName || 'User'}!
                      </span>
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-8 h-8"
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigateTo('/sign-in')}
                        className="px-4 py-2 text-slate-300 hover:text-yellow-400 transition-colors"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={() => navigateTo('/sign-up')}
                        className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-medium hover:bg-yellow-300 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                </>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-slate-300 hover:text-yellow-400 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={closeMobileMenu}>
          <div 
            className="absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-700/50 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-4 py-6 space-y-2">
              <button 
                onClick={() => {
                  navigateTo('/');
                  closeMobileMenu();
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                🏠 Home
              </button>
              
              <button 
                onClick={() => {
                  navigateTo('/bets');
                  closeMobileMenu();
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/bets') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                🎯 Betting
              </button>
              
              <button 
                onClick={() => {
                  navigateTo('/account');
                  closeMobileMenu();
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/account') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                👤 Account
              </button>
              
              <button 
                onClick={() => {
                  navigateTo('/donation');
                  closeMobileMenu();
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive('/donation') 
                    ? 'text-yellow-400 bg-yellow-400/10' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
                }`}
              >
                ❤️ Donation
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;