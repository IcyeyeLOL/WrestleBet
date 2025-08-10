"use client";

// DonationPage.jsx
import React, { useState } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Heart, CreditCard, CheckCircle, Users, Trophy, Zap } from 'lucide-react';
import SharedHeader from '../components/SharedHeader';
import EnhancedDonationForm from './EnhancedDonationForm';
import ImpactCards from './ImpactCards';
import SubscriptionSuccess from '../components/SubscriptionSuccess';

const DonationPage = () => {
  const [selectedAmount, setSelectedAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [donationComplete, setDonationComplete] = useState(false);
  const [completedDonation, setCompletedDonation] = useState(null);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDonationSuccess = (donation) => {
    setCompletedDonation(donation);
    setDonationComplete(true);
    
    // For subscriptions, don't auto-hide - let user manually close
    // For one-time donations, auto-hide after 8 seconds
    if (donation.type === 'one-time') {
      setTimeout(() => {
        setDonationComplete(false);
        setCompletedDonation(null);
        // Reset form
        setSelectedAmount('25');
        setCustomAmount('');
        setFormData({ name: '', email: '', message: '' });
      }, 8000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Floating Gradient Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

      <SharedHeader />

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 rounded-full px-4 md:px-6 py-2 md:py-3 mb-4 md:mb-6">
              ❤️
              <span className="text-yellow-400 font-semibold text-sm md:text-base">Support WrestleBet</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400">
              Power Our Mission
            </h1>
            
            <p className="text-base md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6 md:mb-8 px-4">
              Help us revolutionize wrestling entertainment and build the ultimate betting platform. 
              Every contribution fuels innovation and keeps our community thriving.
            </p>

            {/* Impact Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/50">
                👥
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">50K+</div>
                <div className="text-gray-400 text-sm md:text-base">Active Users</div>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/50">
                🏆
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">500+</div>
                <div className="text-gray-400 text-sm md:text-base">Matches Covered</div>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700/50">
                ⚡
                <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">99.9%</div>
                <div className="text-gray-400 text-sm md:text-base">Uptime</div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {donationComplete && completedDonation && (
            <SubscriptionSuccess 
              donation={completedDonation} 
              onClose={() => {
                setDonationComplete(false);
                setCompletedDonation(null);
                // Reset form
                setSelectedAmount('25');
                setCustomAmount('');
                setFormData({ name: '', email: '', message: '' });
              }}
            />
          )}

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <EnhancedDonationForm
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              donationType={donationType}
              formData={formData}
              onAmountSelect={handleAmountSelect}
              onCustomAmountChange={handleCustomAmountChange}
              onDonationTypeChange={setDonationType}
              onInputChange={handleInputChange}
              onDonationSuccess={handleDonationSuccess}
            />
            
            <ImpactCards />
          </div>

          {/* Additional Info Section */}
          <div className="mt-12 md:mt-16 grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-700/50">
              <h3 className="text-xl md:text-2xl font-bold text-yellow-400 mb-3 md:mb-4">Why Donate?</h3>
              <div className="space-y-3 md:space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm md:text-base">Support cutting-edge wrestling analytics and live odds technology</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm md:text-base">Help us expand coverage to more wrestling events and tournaments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm md:text-base">Maintain our free platform for the wrestling community</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm md:text-base">Develop new features and improve user experience</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border border-gray-700/50">
              <h3 className="text-xl md:text-2xl font-bold text-yellow-400 mb-3 md:mb-4">Secure & Trusted</h3>
              <div className="space-y-3 md:space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  ✅
                  <span className="text-sm md:text-base">SSL encrypted transactions</span>
                </div>
                <div className="flex items-center gap-3">
                  ✅
                  <span className="text-sm md:text-base">PCI DSS compliant payment processing</span>
                </div>
                <div className="flex items-center gap-3">
                  ✅
                  <span className="text-sm md:text-base">No storage of payment information</span>
                </div>
                <div className="flex items-center gap-3">
                  ✅
                  <span className="text-sm md:text-base">100% transparent fund usage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonationPage;