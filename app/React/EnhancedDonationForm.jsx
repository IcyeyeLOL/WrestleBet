"use client";

import React, { useState } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Heart, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { stripePromise } from '../../lib/stripe-config';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Stripe card element options for donations
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'transparent',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
    },
  },
  hidePostalCode: false,
};

// Enhanced donation form with Stripe integration
const StripeDonationForm = ({ 
  selectedAmount, 
  customAmount, 
  donationType, 
  formData, 
  onAmountSelect, 
  onCustomAmountChange, 
  onDonationTypeChange, 
  onInputChange,
  onDonationSuccess 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const predefinedAmounts = ['10', '25', '50', '100', '250', '500'];

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not ready. Please try again.');
      return;
    }

    const amount = customAmount || selectedAmount;
    
    if (!amount || amount <= 0) {
      setError('Please select a valid donation amount.');
      return;
    }
    
    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create payment intent or subscription on our server
      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
        body: JSON.stringify({
          amount: parseFloat(amount),
          donationType,
          donorInfo: {
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle subscription vs one-time payment
      if (data.isSubscription) {
        // For subscriptions, confirm the subscription
        const { error: stripeError, subscription } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: formData.name,
                email: formData.email,
              },
            }
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (subscription && subscription.status === 'active') {
          // Subscription created successfully
          onDonationSuccess({
            type: 'subscription',
            subscriptionId: data.subscriptionId,
            customerId: data.customerId,
            amount: parseFloat(amount),
            donationType: 'monthly',
            status: 'active',
            donorInfo: formData
          });
        } else {
          // Handle incomplete subscription
          throw new Error('Subscription setup incomplete. Please try again.');
        }
      } else {
        // Handle one-time payment as before
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          {
            payment_method: {
              card: elements.getElement(CardElement),
              billing_details: {
                name: formData.name,
                email: formData.email,
              },
            }
          }
        );

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent.status === 'succeeded') {
          // Confirm donation on our server
          const confirmResponse = await fetch('/api/donations/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id
            }),
          });

          const confirmResult = await confirmResponse.json();

          if (confirmResult.success) {
            onDonationSuccess({
              type: 'one-time',
              paymentIntentId: paymentIntent.id,
              amount: parseFloat(amount),
              donationType: 'one-time',
              status: 'succeeded',
              donorInfo: formData
            });
          } else {
            throw new Error('Failed to confirm donation');
          }
        }
      }

    } catch (err) {
      console.error('Donation error:', err);
      setError(err.message || 'Failed to process donation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-6 md:mb-8 flex items-center">
          ❤️
          <span className="md:hidden">Donate</span>
          <span className="hidden md:inline">Make a Donation</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Donation Type */}
          <div>
            <label className="block text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg">
              Donation Type
            </label>
            <div className="flex space-x-2 md:space-x-4">
              <button
                type="button"
                onClick={() => onDonationTypeChange('one-time')}
                className={`px-4 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold transition-all duration-300 flex-1 text-sm md:text-base ${
                  donationType === 'one-time'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30 transform scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => onDonationTypeChange('monthly')}
                className={`px-4 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold transition-all duration-300 flex-1 relative text-sm md:text-base ${
                  donationType === 'monthly'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30 transform scale-105'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:scale-105'
                }`}
              >
                Monthly
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-green-500 text-white text-xs px-1 md:px-2 py-1 rounded-full">
                  Popular
                </span>
              </button>
            </div>
            {donationType === 'monthly' && (
              <div className="mt-2 text-sm text-green-300">
                ✅ Monthly subscriptions are automatically processed via Stripe. You'll receive email confirmations for each payment.
              </div>
            )}
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg">
              Select Amount
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => onAmountSelect(amount)}
                  className={`p-3 md:p-4 rounded-lg md:rounded-xl font-bold transition-all duration-300 hover:scale-105 text-sm md:text-base ${
                    selectedAmount === amount
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-400/30 transform scale-105'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold text-base md:text-lg">$</span>
              <input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={onCustomAmountChange}
                className="w-full pl-6 md:pl-8 pr-3 md:pr-4 py-3 md:py-4 bg-gray-700/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 font-semibold text-base md:text-lg"
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <label className="block text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg">
              Personal Information
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={onInputChange}
                required
                className="p-3 md:p-4 bg-gray-700/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 font-semibold text-sm md:text-base"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={onInputChange}
                required
                className="p-3 md:p-4 bg-gray-700/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 font-semibold text-sm md:text-base"
              />
            </div>
            <textarea
              name="message"
              placeholder="Leave a message (optional)"
              value={formData.message}
              onChange={onInputChange}
              rows="3"
              className="w-full p-3 md:p-4 bg-gray-700/50 border border-gray-600 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none transition-all duration-300 font-semibold text-sm md:text-base"
            />
          </div>

          {/* Payment Information */}
          <div>
            <label className="flex text-yellow-400 font-bold mb-3 md:mb-4 text-base md:text-lg items-center gap-2">
              🔒
              Payment Information
            </label>
            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg md:rounded-xl">
              <CardElement options={cardElementOptions} />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              <p>💳 Test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (decline)</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 md:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              ⚠️
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !stripe}
            className={`w-full py-4 md:py-5 px-6 md:px-8 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform shadow-2xl flex items-center justify-center gap-2 md:gap-3 ${
              isProcessing || !stripe
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white hover:scale-105 shadow-green-500/25'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                💳
                <span className="hidden md:inline">Donate ${customAmount || selectedAmount || '0'} {donationType === 'monthly' ? '/month' : ''}</span>
                <span className="md:hidden">${customAmount || selectedAmount || '0'} {donationType === 'monthly' ? '/mo' : ''}</span>
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="text-center text-xs md:text-sm text-gray-400 bg-gray-700/30 p-3 md:p-4 rounded-lg md:rounded-xl border border-gray-600/50">
            <p className="flex items-center justify-center gap-2 mb-1 md:mb-2">
              🔒
              <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
              Your donation is secure and encrypted with Stripe
            </p>
            <p>We use industry-standard security measures to protect your information.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrapper component with Stripe Elements provider
const EnhancedDonationForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeDonationForm {...props} />
    </Elements>
  );
};

export default EnhancedDonationForm;
