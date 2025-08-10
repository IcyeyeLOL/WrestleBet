"use client";

import React, { useState, useEffect } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { CreditCard, Coins, X, Check } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { stripePromise, stripeConfig, getPackageById, formatPrice } from '../../lib/stripe-config';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#9ca3af',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Payment form component with full Stripe integration
const PaymentForm = ({ selectedPackage, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !selectedPackage) {
      return;
    }

    setProcessing(true);

    try {
      // Test with Stripe's test mode
      console.log('🔧 Testing Stripe with package:', selectedPackage);
      
      // Create a test payment method for demonstration
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Test User',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Payment method created successfully:', paymentMethod);
      
      // For testing purposes, we'll simulate success
      // In production, you would create a payment intent on your server
      onSuccess(selectedPackage);
      
    } catch (err) {
      console.error('❌ Payment failed:', err);
      onError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="mb-3">
          <p className="text-sm text-blue-400 mb-2">🧪 Stripe Test Mode Active</p>
          <p className="text-xs text-gray-400 mb-3">Use test card: 4242 4242 4242 4242</p>
        </div>
        <CardElement options={cardElementOptions} />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          processing
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
        }`}
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing with Stripe...
          </>
        ) : (
          <>
            💳
            Pay ${selectedPackage?.price} with Stripe
          </>
        )}
      </button>
    </form>
  );
};

const PurchaseWCModal = ({ isOpen, onClose, embedded = false }) => {
  const { purchaseWrestleCoins } = useCurrency();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [error, setError] = useState('');

  // WrestleCoin packages
  const packages = [
    {
      id: 'starter',
      wc: 100,
      price: 0.99,
      popular: false,
      bonus: 0,
      description: 'Perfect for trying out betting'
    },
    {
      id: 'basic',
      wc: 500,
      price: 4.99,
      popular: false,
      bonus: 50,
      description: 'Great value for casual bettors'
    },
    {
      id: 'premium',
      wc: 1000,
      price: 9.99,
      popular: true,
      bonus: 200,
      description: 'Most popular choice'
    },
    {
      id: 'pro',
      wc: 2500,
      price: 19.99,
      popular: false,
      bonus: 500,
      description: 'For serious bettors'
    },
    {
      id: 'ultimate',
      wc: 5000,
      price: 39.99,
      popular: false,
      bonus: 1500,
      description: 'Maximum value package'
    }
  ];

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setError('');
  };

  const handlePaymentSuccess = (packageData) => {
    // Add WC to user's balance
    const result = purchaseWrestleCoins(packageData);
    
    if (result.success) {
      setPurchaseComplete(true);
      setTimeout(() => {
        setPurchaseComplete(false);
        setSelectedPackage(null);
        onClose();
      }, 3000);
    }
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    console.error('Payment failed:', errorMessage);
  };

  if (!isOpen) return null;

  // Purchase success screen
  if (purchaseComplete) {
    const successContent = (
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            ✅
          </div>
          <h3 className="text-2xl font-bold text-green-400 mb-2">Purchase Successful!</h3>
          <p className="text-gray-300">
            You received <span className="text-yellow-400 font-bold">
              {selectedPackage?.wc + selectedPackage?.bonus} WC
            </span>
          </p>
          {selectedPackage?.bonus > 0 && (
            <p className="text-sm text-green-400 mt-2">
              Includes {selectedPackage.bonus} bonus WC!
            </p>
          )}
        </div>
      </div>
    );

    if (!embedded) {
      return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {successContent}
          </div>
        </div>
      );
    }
    return successContent;
  }

  const modalContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
            🪙
            Purchase WrestleCoins
          </h2>
          <p className="text-gray-400 mt-1">Choose a package to add WrestleCoins to your account</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => handlePackageSelect(pkg)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedPackage?.id === pkg.id
                ? 'border-yellow-400 bg-yellow-400/10 shadow-yellow-400/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            } ${pkg.popular ? 'ring-2 ring-green-400 ring-opacity-50' : ''}`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <span className="bg-gradient-to-r from-green-400 to-green-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  MOST POPULAR
                </span>
              </div>
            )}
            
            <div className="text-center pt-2">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {pkg.wc.toLocaleString()}
                {pkg.bonus > 0 && (
                  <span className="text-green-400 text-lg ml-1">
                    +{pkg.bonus}
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-xs mb-3">WrestleCoins</div>
              
              <div className="text-xl font-bold text-white mb-3">
                ${pkg.price}
              </div>
              
              <div className="text-xs text-gray-400 mb-3 px-1">
                {pkg.description}
              </div>
              
              {pkg.bonus > 0 && (
                <div className="bg-gradient-to-r from-green-400/20 to-green-500/20 text-green-400 px-2 py-1 rounded-lg text-xs font-semibold mb-2">
                  +{pkg.bonus} Bonus WC
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-auto">
                ${(pkg.price / (pkg.wc + pkg.bonus)).toFixed(3)} per WC
              </div>
            </div>
          </div>
        ))}
      </div>
        {/* Selected Package Summary */}
        {selectedPackage && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🪙
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Package:</span>
                <span className="text-white font-semibold">
                  {selectedPackage.wc.toLocaleString()} WC
                  {selectedPackage.bonus > 0 && (
                    <span className="text-green-400"> (+{selectedPackage.bonus} bonus)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total WC:</span>
                <span className="text-yellow-400 font-bold">
                  {(selectedPackage.wc + selectedPackage.bonus).toLocaleString()} WC
                </span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-300">Total Price:</span>
                  <span className="text-green-400">${selectedPackage.price}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form (Demo Mode) */}
        {selectedPackage && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Payment Details</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <PaymentForm
              selectedPackage={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            * WrestleCoins are virtual currency for betting simulation only.
            No real money gambling. Purchases are non-refundable.
          </p>
        </div>
    </div>
  );

  // If not embedded, wrap with modal backdrop and Stripe Elements
  if (!embedded) {
    return (
      <Elements stripe={stripePromise}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {modalContent}
          </div>
        </div>
      </Elements>
    );
  }

  // For embedded mode, just return the content (Elements wrapper should be provided by parent)
  return modalContent;
};

export default PurchaseWCModal;
