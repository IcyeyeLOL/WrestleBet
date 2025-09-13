"use client";

import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencyTestPanel = () => {
  const { 
    balance, 
    addToBalance, 
    subtractFromBalance, 
    getFormattedBalance,
    transactions 
  } = useCurrency();
  
  const [testAmount, setTestAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBalance = async () => {
    setIsLoading(true);
    try {
      await addToBalance(testAmount);
      console.log(`Added ${testAmount} to balance`);
    } catch (error) {
      console.error('Error adding balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubtractBalance = async () => {
    setIsLoading(true);
    try {
      await subtractFromBalance(testAmount);
      console.log(`Subtracted ${testAmount} from balance`);
    } catch (error) {
      console.error('Error subtracting balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
      <h3 className="text-lg font-semibold text-white mb-4">💰 Currency Test Panel</h3>
      
      <div className="space-y-4">
        <div className="bg-slate-700 rounded p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Current Balance</h4>
          <p className="text-2xl font-bold text-white">{getFormattedBalance()}</p>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Test Amount</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              min="1"
              max="10000"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleAddBalance}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              {isLoading ? 'Adding...' : `+${testAmount}`}
            </button>
            
            <button
              onClick={handleSubtractBalance}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              {isLoading ? 'Subtracting...' : `-${testAmount}`}
            </button>
          </div>
        </div>
        
        {transactions && transactions.length > 0 && (
          <div className="bg-slate-700 rounded p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">Recent Transactions</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {transactions.slice(-5).map((transaction, index) => (
                <div key={index} className="text-sm text-slate-300 flex justify-between">
                  <span>{transaction.type}</span>
                  <span className={transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyTestPanel;
