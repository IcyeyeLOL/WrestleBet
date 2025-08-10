"use client";

import React, { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

const AuthModal = ({ isOpen, onClose, mode = "signin", onAuthSuccess }) => {
  const { isSignedIn } = useUser();
  const [currentMode, setCurrentMode] = useState(mode);
  const [error, setError] = useState(null);

  // Update currentMode when external mode prop changes
  useEffect(() => {
    setCurrentMode(mode);
    setError(null); // Clear any previous errors when mode changes
  }, [mode]);

  // Close modal and trigger callback when user successfully signs in
  useEffect(() => {
    if (isSignedIn && isOpen) {
      // Add a small delay to ensure authentication is fully processed
      const timer = setTimeout(() => {
        onClose();
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }, 250);
      
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isOpen, onClose, onAuthSuccess]);

  const switchMode = () => {
    setCurrentMode(currentMode === "signin" ? "signup" : "signin");
    setError(null); // Clear errors when switching modes
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Authentication error:', error);
    }
    setError(error?.message || 'Authentication failed. Please try again.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 backdrop-blur-lg"
        onClick={onClose}
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="rounded-3xl p-6 shadow-2xl transform transition-all duration-500 scale-100 hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(145deg, #0a0a1f 0%, #1a1a3a 25%, #2d2d5a 75%, #3d3d6a 100%)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 100px rgba(255, 215, 0, 0.1)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}
        >
          {/* Enhanced Close Button */}
          <button
            onClick={onClose}
            className="group absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all duration-300 flex items-center justify-center hover:rotate-90 hover:scale-110"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Enhanced Header Section */}
          <div className="text-center mb-6 space-y-4">
            {/* Enhanced Logo */}
            <div className="inline-block">
              <div 
                className="relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl shadow-2xl transform transition-all duration-700 hover:rotate-12 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffc107 100%)',
                  boxShadow: '0 0 60px rgba(255, 215, 0, 0.4), inset 0 2px 20px rgba(255, 255, 255, 0.2)',
                }}
              >
                🤼
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-50" />
              </div>
            </div>
            
            {/* Enhanced Title */}
            <div className="space-y-1">
              <h1 
                className="text-3xl font-black mb-1 tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 25%, #ffed4e 50%, #ffd700 75%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
                  lineHeight: '1.1'
                }}
              >
                {currentMode === "signin" ? "Welcome Back!" : "Join WrestleBet"}
              </h1>
              
              {/* Enhanced Subtitle */}
              <p className="text-white/80 font-light text-base leading-relaxed">
                {currentMode === "signin" 
                  ? "Ready to continue your betting journey?" 
                  : "Start your wrestling betting adventure today"
                }
              </p>
            </div>

            {/* Enhanced Mode Switcher */}
            <div className="flex items-center justify-center gap-2 text-sm bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
              <span className="text-white/70 text-xs">
                {currentMode === "signin" ? "New to WrestleBet?" : "Already a member?"}
              </span>
              <button
                onClick={switchMode}
                className="relative text-yellow-400 hover:text-yellow-300 font-bold transition-all duration-300 hover:scale-105 px-2 py-1 rounded-full hover:bg-yellow-400/10 text-xs"
              >
                {currentMode === "signin" ? "Create Account" : "Sign In"}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </button>
            </div>
          </div>
          
          {/* Enhanced Auth Form */}
          <div 
            className="rounded-2xl p-5 mb-4 transform transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 215, 0, 0.1)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {currentMode === "signin" ? (
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "mx-auto max-w-sm",
                    card: "bg-transparent shadow-none border-none",
                    headerTitle: "text-white text-xl font-black mb-2 tracking-wide",
                    headerSubtitle: "text-white/70 text-sm mb-4 leading-relaxed",
                    socialButtonsBlockButton: "bg-white/8 border-2 border-white/15 hover:border-white/25 text-white hover:bg-white/15 transition-all duration-300 rounded-xl font-bold py-3 px-5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                    socialButtonsBlockButtonText: "font-bold text-white text-sm",
                    formButtonPrimary: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/50 active:scale-95 tracking-wide text-base",
                    formFieldInput: "bg-white/8 border-2 border-white/15 hover:border-white/25 focus:border-yellow-400/60 text-white placeholder:text-white/40 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300 focus:bg-white/12 focus:shadow-lg text-sm font-medium",
                    formFieldLabel: "text-white font-bold mb-2 text-xs tracking-wide uppercase",
                    footerActionLink: "text-yellow-400 hover:text-yellow-300 font-bold transition-all duration-300 hover:scale-105 underline decoration-yellow-400/50 hover:decoration-yellow-300",
                    dividerLine: "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                    dividerText: "text-white/60 font-medium px-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full",
                    identityPreviewEditButton: "text-yellow-400 hover:text-yellow-300 font-semibold",
                    formFieldAction: "text-yellow-400 hover:text-yellow-300 font-semibold",
                  },
                  variables: {
                    colorPrimary: "#ffd700",
                    colorBackground: "transparent",
                    colorInputBackground: "rgba(255, 255, 255, 0.08)",
                    colorInputText: "#ffffff",
                    borderRadius: "12px",
                    spacingUnit: "0.75rem",
                  }
                }}
                redirectUrl="/"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "mx-auto max-w-sm",
                    card: "bg-transparent shadow-none border-none",
                    headerTitle: "text-white text-xl font-black mb-2 tracking-wide",
                    headerSubtitle: "text-white/70 text-sm mb-4 leading-relaxed",
                    socialButtonsBlockButton: "bg-white/8 border-2 border-white/15 hover:border-white/25 text-white hover:bg-white/15 transition-all duration-300 rounded-xl font-bold py-3 px-5 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                    socialButtonsBlockButtonText: "font-bold text-white text-sm",
                    formButtonPrimary: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/50 active:scale-95 tracking-wide text-base",
                    formFieldInput: "bg-white/8 border-2 border-white/15 hover:border-white/25 focus:border-yellow-400/60 text-white placeholder:text-white/40 rounded-xl py-3 px-4 backdrop-blur-sm transition-all duration-300 focus:bg-white/12 focus:shadow-lg text-sm font-medium",
                    formFieldLabel: "text-white font-bold mb-2 text-xs tracking-wide uppercase",
                    footerActionLink: "text-yellow-400 hover:text-yellow-300 font-bold transition-all duration-300 hover:scale-105 underline decoration-yellow-400/50 hover:decoration-yellow-300",
                    dividerLine: "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                    dividerText: "text-white/60 font-medium px-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full",
                    identityPreviewEditButton: "text-yellow-400 hover:text-yellow-300 font-semibold",
                    formFieldAction: "text-yellow-400 hover:text-yellow-300 font-semibold",
                  },
                  variables: {
                    colorPrimary: "#ffd700",
                    colorBackground: "transparent",
                    colorInputBackground: "rgba(255, 255, 255, 0.08)",
                    colorInputText: "#ffffff",
                    borderRadius: "12px",
                    spacingUnit: "0.75rem",
                  }
                }}
                redirectUrl="/"
              />
            )}
          </div>

          {/* Enhanced Stats Section */}
          <div className="mt-4">
            <div 
              className="rounded-2xl p-4 transform transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.15)',
                backdropFilter: 'blur(16px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 215, 0, 0.1)'
              }}
            >
              <div className="text-center mb-3">
                <h3 className="text-white/80 font-bold text-xs uppercase tracking-wider">Join the Action</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-xl font-black text-yellow-400 tracking-tight">50K+</div>
                  <div className="text-white/60 text-xs font-medium uppercase tracking-wide">Active Users</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-black text-yellow-400 tracking-tight">$2M+</div>
                  <div className="text-white/60 text-xs font-medium uppercase tracking-wide">Paid Out</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-black text-yellow-400 tracking-tight">24/7</div>
                  <div className="text-white/60 text-xs font-medium uppercase tracking-wide">Live Betting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
