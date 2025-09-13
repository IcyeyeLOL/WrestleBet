"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 2000, // $20.00 in cents
          currency: 'usd',
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        setMessage(`Payment failed: ${error.message}`);
        setIsSuccess(false);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        setIsSuccess(true);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded border">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-semibold transition-colors"
      >
        {isLoading ? 'Processing...' : 'Pay $20.00'}
      </button>
      
      {message && (
        <div className={`p-3 rounded ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}
    </form>
  );
};

const StripeTestComponent = () => {
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setIsStripeLoaded(true);
    } else {
      console.warn('Stripe publishable key not found');
    }
  }, []);

  if (!isStripeLoaded) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Stripe Not Configured:</strong> Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4">💳 Stripe Payment Test</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-700 rounded p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Test Payment</h4>
          <p className="text-sm text-slate-300 mb-4">
            Test Stripe integration with a $20.00 payment using test card numbers.
          </p>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
        
        <div className="bg-slate-700 rounded p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Test Card Numbers</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Success:</span>
              <code className="bg-slate-600 px-2 py-1 rounded">4242 4242 4242 4242</code>
            </div>
            <div className="flex justify-between">
              <span>Decline:</span>
              <code className="bg-slate-600 px-2 py-1 rounded">4000 0000 0000 0002</code>
            </div>
            <div className="flex justify-between">
              <span>3D Secure:</span>
              <code className="bg-slate-600 px-2 py-1 rounded">4000 0025 0000 3155</code>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-700 rounded p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Environment Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Publishable Key:</span>
              <span className={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'text-green-400' : 'text-red-400'}>
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Secret Key:</span>
              <span className={process.env.STRIPE_SECRET_KEY ? 'text-green-400' : 'text-red-400'}>
                {process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestComponent;
