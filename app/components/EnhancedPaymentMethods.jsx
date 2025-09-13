"use client";

import React, { useState, useEffect } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { CreditCard, Plus, Check, Trash2, X, Shield, AlertCircle } from 'lucide-react';
import { stripePromise } from '../../lib/stripe-config';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Stripe card element options
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

// Add payment method form component with Stripe integration
const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [holderName, setHolderName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is not ready. Please try again.');
      return;
    }

    if (!holderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    // Create payment method with Stripe
    stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: holderName.trim(),
      },
    })
    .then(({ error, paymentMethod }) => {
      if (error) {
        throw new Error(error.message);
      }

      // Create new payment method object for UI
      const newPaymentMethod = {
        id: paymentMethod.id,
        type: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expiryMonth: paymentMethod.card.exp_month,
        expiryYear: paymentMethod.card.exp_year,
        holderName: holderName.trim(),
        isDefault: false,
        stripePaymentMethodId: paymentMethod.id
      };

      console.log('✅ Payment method created successfully:', paymentMethod);
      onSuccess(newPaymentMethod);
    })
    .catch(err => {
      console.error('❌ Error creating payment method:', err);
      setError(err.message || 'Failed to add payment method');
    })
    .finally(() => {
      setProcessing(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-slate-300 font-medium mb-2 text-sm">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-slate-300 font-medium mb-2 text-sm">
          Card Information *
        </label>
        <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
        <div className="mt-2 text-xs text-slate-400">
          <p>💳 Test cards: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (decline)</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          ⚠️
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            processing || !stripe
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
          }`}
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              Adding Card...
            </>
          ) : (
            <>
              💳
              Add Payment Method
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Main payment methods component content
const PaymentMethodsContent = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load payment methods from API
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = () => {
    setLoading(true);
    
    // In a real app, fetch from your API
    // const response = await fetch('/api/payments/methods');
    // const methods = await response.json();
    
    // Start with empty payment methods (removed John Doe sample)
    const mockMethods = [];
    
    setPaymentMethods(mockMethods);
    setLoading(false);
  };

  const handleAddSuccess = (newMethod) => {
    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddForm(false);
  };

  const handleDeleteMethod = (methodId) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      // In a real app, delete from your API
      // await fetch(`/api/payments/methods/${methodId}`, { method: 'DELETE' });
      
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
    }
  };

  const handleSetDefault = (methodId) => {
    // In a real app, update via your API
    // await fetch(`/api/payments/methods/${methodId}/set-default`, { method: 'POST' });
    
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
  };

  const getCardIcon = (type) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      unknown: '💳'
    };
    return icons[type] || icons.unknown;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading payment methods...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Payment Methods</h2>
          <p className="text-slate-400 text-sm">Manage your payment methods for purchasing WrestleCoins</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-all duration-300 w-full md:w-auto"
        >
          ➕
          Add Payment Method
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          🛡️
          <h3 className="text-blue-400 font-semibold text-sm md:text-base">Secure Payment Processing</h3>
        </div>
        <p className="text-slate-300 text-xs md:text-sm">
          All payment information is processed securely through Stripe. We never store your card details on our servers.
        </p>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-2xl">{getCardIcon(method.type)}</div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1">
                    <span className="text-white font-medium">
                      •••• •••• •••• {method.last4}
                    </span>
                    <span className="text-slate-400 text-sm uppercase">
                      {method.type}
                    </span>
                    {method.isDefault && (
                      <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium w-fit">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {method.holderName} • Expires {method.expiryMonth}/{method.expiryYear}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="text-slate-400 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-slate-600/50"
                    title="Set as default"
                  >
                    ✅
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-600/50"
                  title="Delete payment method"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <div className="text-slate-400 mb-2">No payment methods added</div>
          <div className="text-slate-500 text-sm">Add a payment method to purchase WrestleCoins</div>
        </div>
      )}

      {/* Add Payment Method Form */}
      {showAddForm && (
        <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Add New Payment Method</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          <AddPaymentMethodForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
    </div>
  );
};

// Main wrapper component with Stripe Elements provider
const EnhancedPaymentMethods = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server side
  if (!isClient) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Loading payment methods...</p>
      </div>
    );
  }

  // Handle case where Stripe is not properly configured
  if (!stripePromise) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>⚠️ Payment system configuration error</p>
        <p className="text-sm mt-2">Stripe not properly initialized</p>
        <p className="text-xs mt-1">Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ appearance: { theme: 'night' } }}>
      <PaymentMethodsContent />
    </Elements>
  );
};

export default EnhancedPaymentMethods;
