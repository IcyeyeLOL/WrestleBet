"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';

const DonationPage = () => {
  // Handle Clerk availability gracefully
  let user = null;
  try {
    const clerkData = useUser();
    user = clerkData.user || null;
  } catch (error) {
    console.warn('Clerk not available in DonationPage:', error.message);
    user = null;
  }
  
  const [selectedAmount, setSelectedAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [formData, setFormData] = useState({
    name: user?.firstName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    message: ''
  });
  const [donationComplete, setDonationComplete] = useState(false);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setSelectedAmount('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDonation = async (e) => {
    e.preventDefault();
    
    const amount = customAmount || selectedAmount;
    
    // Simulate donation processing
    setDonationComplete(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setDonationComplete(false);
      setFormData({
        name: user?.firstName || '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        message: ''
      });
      setSelectedAmount('25');
      setCustomAmount('');
    }, 3000);
  };

  if (donationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Thank You!</h2>
          <p className="text-gray-300 text-lg mb-6">
            Your donation has been processed successfully. Your support helps us grow the WrestleBet community!
          </p>
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 font-semibold">Donation Amount: ${customAmount || selectedAmount}</p>
            <p className="text-gray-300 text-sm">Type: {donationType === 'one-time' ? 'One-time' : 'Monthly'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">💝 Support WrestleBet</h1>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto">
          Help us grow the wrestling betting community and bring you more exciting matches, features, and rewards!
        </p>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Community Growth</h3>
          <p className="text-gray-300">Help us expand our user base and create a thriving wrestling betting community</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏆</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Better Features</h3>
          <p className="text-gray-300">Fund new features like live streaming, advanced analytics, and mobile apps</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Faster Performance</h3>
          <p className="text-gray-300">Improve server infrastructure for faster loading and better user experience</p>
        </div>
      </div>

      {/* Donation Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Make a Donation</h2>
        
        <form onSubmit={handleDonation} className="space-y-6">
          {/* Donation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Donation Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDonationType('one-time')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  donationType === 'one-time'
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => setDonationType('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  donationType === 'monthly'
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Select Amount</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {['10', '25', '50', '100'].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedAmount === amount
                      ? 'bg-yellow-400 text-slate-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Leave a message of support..."
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-bold text-lg rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
            >
              💝 Donate ${customAmount || selectedAmount} {donationType === 'monthly' ? '/month' : ''}
            </button>
          </div>
        </form>
      </div>

      {/* Thank You Message */}
      <div className="text-center mt-12">
        <p className="text-gray-400 text-lg">
          Thank you for supporting WrestleBet! Every donation helps us improve the platform for all wrestling fans.
        </p>
      </div>
    </div>
  );
};

export default DonationPage;
