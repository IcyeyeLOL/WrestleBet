"use client";

import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const BettingModal = ({ isOpen, onClose, matchId, wrestler, odds, onPlaceBet, onConfirmBet }) => {
  const { balance, getFormattedBalance, canAffordBet } = useCurrency();
  const [betAmount, setBetAmount] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setBetAmount(value);
    setError('');

    const amount = parseFloat(value);
    if (value && (isNaN(amount) || amount <= 0)) {
      setError('Please enter a valid positive number');
    } else if (amount && amount < 10) {
      setError('Minimum bet amount is 10 WC');
    } else if (amount && !canAffordBet(amount)) {
      setError(`Insufficient balance. You have ${getFormattedBalance()}`);
    }
  };

  const handleSubmit = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount < 10 || !canAffordBet(amount)) {
      return;
    }

    const submitHandler = onPlaceBet || onConfirmBet;
    if (typeof submitHandler === 'function') {
      submitHandler(amount);
    }
    setBetAmount('');
    setError('');
    onClose();
  };

  const handleQuickBet = (amount) => {
    if (canAffordBet(amount)) {
      setBetAmount(amount.toString());
      setError('');
    }
  };

  const potentialPayout = betAmount ? Math.floor(parseFloat(betAmount) * parseFloat(odds)) : 0;
  const canSubmit = betAmount && !error && canAffordBet(parseFloat(betAmount)) && parseFloat(betAmount) >= 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-4 md:p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-yellow-400 mb-2">Place Your Bet</h3>
          <p className="text-white">
            <span className="font-semibold">{wrestler}</span>
          </p>
          <p className="text-gray-400 text-sm">Odds: {odds}</p>
        </div>

        {/* Balance Display */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Balance:</span>
            <span className="text-yellow-400 font-bold">{getFormattedBalance()}</span>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">Quick Bet:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => handleQuickBet(amount)}
                disabled={!canAffordBet(amount)}
                className={`py-3 md:py-2 px-3 rounded text-sm font-semibold transition-all touch-manipulation min-h-[44px] ${
                  canAffordBet(amount)
                    ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/50 active:bg-yellow-400/40'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">
            Custom Amount (WrestleCoins):
          </label>
          <input
            type="number"
            value={betAmount}
            onChange={handleAmountChange}
            placeholder="Enter amount..."
            min="10"
            max={balance}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          />
          {error && (
            <p className="text-red-400 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Potential Payout */}
        {betAmount && !error && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Potential Payout:</span>
              <span className="text-green-400 font-bold">{potentialPayout} WC</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors touch-manipulation min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors touch-manipulation min-h-[44px] ${
              canSubmit
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 active:bg-yellow-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Place Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default BettingModal;
