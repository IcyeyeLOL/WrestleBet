"use client";

import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 hero-gradient hero-radial grid-pattern overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <div className="animate-fadeInUp">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="animate-floating">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-400/50">
                <span className="text-2xl font-black text-black">🤼</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gradient">
              WrestleBet
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-slate-300 font-light mb-8 max-w-3xl mx-auto">
            Bet on your favorite wrestlers with <span className="text-yellow-400 font-bold">WrestleCoins</span> and 
            watch <span className="text-green-400 font-bold">real-time odds</span> shift with every bet placed by the community!
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>Live Odds</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              <span>Community Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span>Dynamic Payouts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
