"use client";

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Temporarily using text icons instead of lucide-react
// import { Menu, X } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import BalanceDisplay from './BalanceDisplay';
import DailyBonusButton from './DailyBonusButton';
import AuthModal from './AuthModal';

const SharedHeader = ({ onTogglePurchaseModal, showPurchaseModal }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { isSignedIn, user, isLoaded } = useUser();

  const isActive = (path) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-yellow-400 text-xl md:text-2xl font-black hover:text-yellow-300 transition-colors"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl">🤼</span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                WrestleBet
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center space-x-8">
                <Link 
                  href="/" 
                  className={`relative py-2 transition-all duration-300 font-medium ${
                    isActive('/') 
                      ? 'text-yellow-400' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  Home
                  {isActive('/') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/bets" 
                  className={`relative py-2 transition-all duration-300 font-medium ${
                    isActive('/bets') 
                      ? 'text-yellow-400' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  Betting
                  {isActive('/bets') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/account" 
                  className={`relative py-2 transition-all duration-300 font-medium ${
                    isActive('/account') 
                      ? 'text-yellow-400' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  Account
                  {isActive('/account') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                  )}
                </Link>
                <Link 
                  href="/donation" 
                  className={`relative py-2 transition-all duration-300 font-medium ${
                    isActive('/donation') 
                      ? 'text-yellow-400' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  Donation
                  {isActive('/donation') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                  )}
                </Link>
              </nav>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
                <DailyBonusButton size="small" />
                <BalanceDisplay 
                  size="small" 
                  onTogglePurchaseModal={onTogglePurchaseModal}
                  showPurchaseModal={showPurchaseModal}
                />
                
                {/* Authentication */}
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 text-sm font-medium hidden lg:block">
                          Welcome back, <span className="text-yellow-400">{user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]}</span>
                        </span>
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: "w-9 h-9 ring-2 ring-yellow-400/20 hover:ring-yellow-400/40 transition-all",
                            },
                          }}
                          afterSignOutUrl="/"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={openSignIn}
                          className="group relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-400/30 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Sign In
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                        <button 
                          onClick={openSignUp}
                          className="group relative bg-transparent border-2 border-yellow-500/60 text-yellow-400 hover:border-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/5 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-yellow-400/10 overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Join Now
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button & Controls */}
            <div className="flex items-center gap-1 md:hidden">
              <DailyBonusButton size="small" />
              <BalanceDisplay 
                size="small" 
                onTogglePurchaseModal={onTogglePurchaseModal}
                showPurchaseModal={showPurchaseModal}
              />
              
              {/* Mobile Auth */}
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 ring-2 ring-yellow-400/20",
                        },
                      }}
                      afterSignOutUrl="/"
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={openSignIn}
                        className="group relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-2 py-1.5 rounded-md text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden xs:inline">Sign In</span>
                          <span className="xs:hidden">In</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                      <button 
                        onClick={openSignUp}
                        className="group relative bg-transparent border border-yellow-500/60 text-yellow-400 hover:border-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/5 px-2 py-1.5 rounded-md text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden xs:inline">Join</span>
                          <span className="xs:hidden">+</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </button>
                    </div>
                  )}
                </>
              )}
              
              <button
                onClick={toggleMobileMenu}
                className="text-slate-300 p-2 hover:text-yellow-400 hover:bg-slate-800/50 rounded-lg transition-all duration-300"
                aria-label="Toggle menu"
              >
                                {mobileMenuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999]" onClick={closeMobileMenu}>
          <div 
            className="absolute top-[73px] left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="px-4 py-8 space-y-2 max-h-[calc(100vh-73px)] overflow-y-auto">
              <Link 
                href="/" 
                className={`flex items-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/') 
                    ? 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/70 border border-transparent'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="text-xl">🏠</span>
                <span>Home</span>
              </Link>
              <Link 
                href="/bets" 
                className={`flex items-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/bets') 
                    ? 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/70 border border-transparent'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="text-xl">🎯</span>
                <span>Betting</span>
              </Link>
              <Link 
                href="/account" 
                className={`flex items-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/account') 
                    ? 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/70 border border-transparent'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="text-xl">👤</span>
                <span>Account</span>
              </Link>
              <Link 
                href="/donation" 
                className={`flex items-center gap-3 py-4 px-4 rounded-xl transition-all duration-300 font-medium ${
                  isActive('/donation') 
                    ? 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 border border-yellow-400/30' 
                    : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/70 border border-transparent'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="text-xl">❤️</span>
                <span>Donation</span>
              </Link>
              
              {/* Mobile Menu Auth */}
              {isLoaded && !isSignedIn && (
                <div className="pt-6 border-t border-slate-700/50 space-y-4">
                  <button 
                    className="group relative w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black py-5 px-6 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-yellow-400/30 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    onClick={() => {
                      closeMobileMenu();
                      openSignIn();
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-lg font-black tracking-wide">Sign In to WrestleBet</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  <button 
                    className="group relative w-full bg-transparent border-2 border-yellow-500/60 text-yellow-400 hover:border-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/5 py-5 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-yellow-400/20 overflow-hidden"
                    onClick={() => {
                      closeMobileMenu();
                      openSignUp();
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <div className="w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-lg font-black tracking-wide">Join WrestleBet</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              )}
              
              {isLoaded && isSignedIn && (
                <div className="pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-slate-800/70 to-slate-700/70 rounded-xl border border-slate-600/30">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs font-medium">Welcome back</span>
                      <span className="text-yellow-400 font-semibold">
                        {user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]}
                      </span>
                    </div>
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 ring-2 ring-yellow-400/30",
                        },
                      }}
                      afterSignOutUrl="/"
                    />
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        mode={authMode}
      />
    </>
  );
};

export default SharedHeader;
