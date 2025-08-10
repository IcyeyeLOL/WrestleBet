"use client";

import React, { useState } from 'react';
import { stripePromise } from '../../lib/stripe-config';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
// Temporarily using Unicode icons instead of lucide-react
// import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

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

const StripeTestForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testPayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');
    setResult(null);

    try {
      // Test creating a payment method
      const cardElement = elements.getElement(CardElement);
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      setResult({
        success: true,
        message: 'Payment method created successfully!',
        paymentMethodId: paymentMethod.id,
        cardBrand: paymentMethod.card.brand,
        cardLast4: paymentMethod.card.last4
      });

    } catch (err) {
      setError(err.message);
      setResult({ success: false });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg border border-slate-600">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span style={{fontSize: '24px'}}>💳</span>
        Stripe Integration Test
      </h3>
      
      <form onSubmit={testPayment} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Test Card Details
          </label>
          <div className="p-3 bg-slate-700 border border-slate-600 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Use test card: 4242 4242 4242 4242, any future date, any CVC
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            processing
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Testing...
            </>
          ) : (
            'Test Stripe Integration'
          )}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <span className="text-green-400 text-xl">✅</span>
            ) : (
              <span className="text-red-400 text-xl">❌</span>
            )}
            <span className={`font-semibold ${
              result.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {result.success ? 'Success!' : 'Failed!'}
            </span>
          </div>
          <p className="text-slate-300 text-sm">{result.message}</p>
          {result.success && (
            <div className="mt-2 text-xs text-slate-400">
              <p>Payment Method ID: {result.paymentMethodId}</p>
              <p>Card: {result.cardBrand} ending in {result.cardLast4}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-lg">❌</span>
            <span className="text-red-400 font-semibold">Error</span>
          </div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Status Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h4 className="text-blue-400 font-semibold text-sm mb-2">Stripe Status</h4>
        <div className="text-xs text-slate-300 space-y-1">
          <p>Stripe Loaded: {stripe ? '✅ Yes' : '❌ No'}</p>
          <p>Elements Ready: {elements ? '✅ Yes' : '❌ No'}</p>
          <p>Publishable Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
};

const StripeTestComponent = () => {
  return (
    <Elements stripe={stripePromise}>
      <StripeTestForm />
    </Elements>
  );
};

export default StripeTestComponent;
