"use client";

// components/ImpactCards.jsx
import React from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Trophy, Users, Shield, Star, Zap, Globe, Award, TrendingUp } from 'lucide-react';

const ImpactCards = () => {
  const impactData = [
    {
      icon: () => <span style={{fontSize: '28px'}}>🏆</span>,
      title: "Platform Excellence",
      description: "Your donations help us maintain world-class wrestling coverage with real-time odds and professional-grade analytics.",
      color: "from-yellow-400 to-yellow-500",
      amount: "$50+",
      impact: "Monthly server costs"
    },
    {
      icon: () => <span style={{fontSize: '28px'}}>👥</span>,
      title: "Community Growth",
      description: "Support helps us expand our user base and provide enhanced social features for wrestling enthusiasts worldwide.",
      color: "from-blue-400 to-blue-500",
      amount: "$100+",
      impact: "New user features"
    },
    {
      icon: () => <span style={{fontSize: '28px'}}>🛡️</span>,
      title: "Security & Trust",
      description: "Contributions ensure top-tier security infrastructure and compliance with industry standards for user protection.",
      color: "from-green-400 to-green-500",
      amount: "$250+",
      impact: "Security upgrades"
    },
    {
      icon: () => <span style={{fontSize: '28px'}}>⭐</span>,
      title: "Premium Features",
      description: "Help us develop advanced AI-powered analytics, exclusive content, and cutting-edge betting tools.",
      color: "from-purple-400 to-purple-500",
      amount: "$500+",
      impact: "Feature development"
    }
  ];

  const achievements = [
    { icon: () => <span style={{fontSize: '24px'}}>🌍</span>, value: "50K+", label: "Global Users" },
    { icon: () => <span style={{fontSize: '24px'}}>🏅</span>, value: "99.9%", label: "Uptime" },
    { icon: () => <span style={{fontSize: '24px'}}>📈</span>, value: "$2M+", label: "Weekly Volume" },
    { icon: () => <span style={{fontSize: '24px'}}>⚡</span>, value: "24/7", label: "Live Support" }
  ];

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
          Platform Impact
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="text-center">
              <achievement.icon />
              <div className="text-lg font-bold text-white">{achievement.value}</div>
              <div className="text-xs text-gray-400">{achievement.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Cards */}
      {impactData.map((item, index) => (
        <div key={index} className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl hover:transform hover:scale-105 transition-all duration-300">
          <div className={`bg-gradient-to-r ${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
            <item.icon />
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-yellow-400">
              {item.title}
            </h3>
            <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              {item.amount}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{item.impact}</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Active</span>
            </div>
          </div>
        </div>
      ))}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 text-center">
        <span style={{fontSize: '32px'}} className="block mx-auto mb-3">⭐</span>
        <h3 className="text-lg font-bold text-yellow-400 mb-2">
          Join Our Supporters
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Every contribution, no matter the size, helps us build something amazing for the wrestling community.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
          <span>Tax-deductible donations</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactCards;