"use client";

import React, { useState } from 'react';

const SubscriptionSuccess = ({ donation, onClose }) => {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const openCustomerPortal = async () => {
    setIsPortalLoading(true);
    try {
      const response = await fetch('/api/donations/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        body: JSON.stringify({
          customerId: donation.customerId,
          returnUrl: window.location.href
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (donation.type === 'subscription') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span style={{fontSize: '32px'}}>✅</span>
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              Subscription Created!
            </h2>
            <p className="text-gray-300">
              Your monthly donation has been set up successfully
            </p>
          </div>

          {/* Subscription Details */}
          <div className="bg-gray-700/50 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Monthly Amount:</span>
                <span className="text-white font-bold text-lg">
                  {formatAmount(donation.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 font-semibold capitalize">
                  {donation.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Billing Cycle:</span>
                <span className="text-white">Monthly</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Next Payment:</span>
                <span className="text-white">
                  {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>You'll receive email confirmations for each monthly payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Your payment method will be automatically charged each month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>You can cancel or modify your subscription anytime</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={openCustomerPortal}
              disabled={isPortalLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPortalLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  🔧
                  Manage Subscription
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all duration-300"
            >
              Continue to Dashboard
            </button>
          </div>

          {/* Support Note */}
          <p className="text-xs text-gray-400 text-center mt-4">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    );
  }

  // One-time donation success (existing functionality)
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span style={{fontSize: '32px'}}>✅</span>
          </div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-300 mb-6">
            Your donation of {formatAmount(donation.amount)} has been processed successfully.
          </p>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
