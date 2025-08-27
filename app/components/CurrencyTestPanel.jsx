"use client";

import React, { useState, useEffect } from 'react';
// Temporarily using Unicode icons instead of lucide-react
// import { Plus } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import BalanceDisplay from './BalanceDisplay';
import PurchaseWCModal from './PurchaseWCModal';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe-config';

const CurrencyTestPanel = () => {
  const { balance, transactions } = useCurrency();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderPurchaseModal = () => {
    if (!isClient || !stripePromise) {
      return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 w-full max-w-md text-center">
            <p className="text-red-400">⚠️ Payment system not available</p>
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <Elements stripe={stripePromise}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <PurchaseWCModal
              isOpen={showPurchaseModal}
              onClose={() => setShowPurchaseModal(false)}
              embedded={true}
            />
          </div>
        </div>
      </Elements>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">Wallet Management</h3>
      
      {/* Balance Display */}
      <div className="mb-6">
        <BalanceDisplay showDetails={true} size="large" />
      </div>

      {/* Add WC Button */}
      <div className="mb-6">
        <button 
          onClick={() => setShowPurchaseModal(true)}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          ➕
          Add WrestleCoins
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h4 className="text-white font-semibold mb-3">Recent Transactions</h4>
        <div className="bg-slate-700/30 rounded-lg p-4 max-h-48 overflow-y-auto border border-slate-600">
          {(!transactions || transactions.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(-5).reverse().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600">
                  <div>
                    <span className="text-gray-300 text-sm">{transaction.description}</span>
                    <p className="text-gray-500 text-xs">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} WC
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && renderPurchaseModal()}
    </div>
  );
};

export default CurrencyTestPanel;
