"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../../lib/supabase';

const DynamicBettingCard = ({ match, onBetPlaced }) => {
  const { isSignedIn, user } = useUser();
  const [bettingAmount, setBettingAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [bettingError, setBettingError] = useState(null);
  const [dynamicData, setDynamicData] = useState({
    wrestler1_pool: 0,
    wrestler2_pool: 0,
    total_pool: 0,
    odds_wrestler1: 2.0,
    odds_wrestler2: 2.0,
    wrestler1_percentage: 50,
    wrestler2_percentage: 50
  });

  // Real-time updates for dynamic data
  useEffect(() => {
    if (!match?.id) return;

    // Initial load - wrap async call properly
    const loadData = async () => {
      try {
        await loadDynamicData();
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      }
    };
    
    loadData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`match_${match.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${match.id}`
      }, (payload) => {
        console.log('🔄 Real-time match update:', payload);
        if (payload.new) {
          setDynamicData({
            wrestler1_pool: payload.new.wrestler1_pool || 0,
            wrestler2_pool: payload.new.wrestler2_pool || 0,
            total_pool: payload.new.total_pool || 0,
            odds_wrestler1: payload.new.odds_wrestler1 || 2.0,
            odds_wrestler2: payload.new.odds_wrestler2 || 2.0,
            wrestler1_percentage: payload.new.wrestler1_percentage || 50,
            wrestler2_percentage: payload.new.wrestler2_percentage || 50
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [match?.id]);

  const loadDynamicData = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('wrestler1_pool, wrestler2_pool, total_pool, odds_wrestler1, odds_wrestler2, wrestler1_percentage, wrestler2_percentage')
        .eq('id', match.id)
        .single();

      if (error) throw error;

      setDynamicData({
        wrestler1_pool: data.wrestler1_pool || 0,
        wrestler2_pool: data.wrestler2_pool || 0,
        total_pool: data.total_pool || 0,
        odds_wrestler1: data.odds_wrestler1 || 2.0,
        odds_wrestler2: data.odds_wrestler2 || 2.0,
        wrestler1_percentage: data.wrestler1_percentage || 50,
        wrestler2_percentage: data.wrestler2_percentage || 50
      });
    } catch (error) {
      console.error('Error loading dynamic data:', error);
    }
  };

  const placeBet = async (wrestlerChoice) => {
    if (!isSignedIn) {
      setBettingError('Please sign in to place bets');
      return;
    }

    setIsPlacingBet(true);
    setBettingError(null);

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          matchId: match.id,
          wrestlerChoice,
          betAmount: bettingAmount,
          odds: wrestlerChoice === 'wrestler1' ? dynamicData.odds_wrestler1 : dynamicData.odds_wrestler2
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Bet placed successfully:', result);
        
        // Update dynamic data with the response
        if (result.dynamicData) {
          setDynamicData(result.dynamicData);
        }
        
        // Notify parent component
        if (onBetPlaced) {
          onBetPlaced(result);
        }
        
        // Show success message
        setBettingError(null);
      } else {
        setBettingError(result.error || 'Failed to place bet');
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      setBettingError('Network error. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const formatWC = (amount) => {
    return `${amount} WC`;
  };

  const formatOdds = (odds) => {
    return `${odds.toFixed(1)}x`;
  };

  return (
    <div className="dynamic-betting-card">
      {/* Match Header */}
      <div className="match-header">
        <h3 className="match-title">{match.wrestler1} vs {match.wrestler2}</h3>
        <div className="match-badges">
          <span className="badge champ">champ</span>
          <span className="badge weight">{match.weight_class || '74KG'}</span>
          <span className="badge live">
            <span className="live-dot"></span>
            LIVE BETTING
          </span>
        </div>
        <div className="total-pool">
          <div className="pool-label">Total Pool</div>
          <div className="pool-amount">{formatWC(dynamicData.total_pool)}</div>
          <div className="pool-status">Live betting active</div>
        </div>
      </div>

      {/* Wrestlers Section */}
      <div className="wrestlers-section">
        {/* Wrestler 1 */}
        <div className="wrestler-card wrestler1">
          <div className="wrestler-icon" style={{ backgroundColor: '#ff6b35' }}>
            {match.wrestler1.charAt(0).toUpperCase()}
          </div>
          <div className="wrestler-info">
            <h4 className="wrestler-name">{match.wrestler1}</h4>
            <div className="pool-info">
              {dynamicData.wrestler1_percentage}% • {formatWC(dynamicData.wrestler1_pool)} Pool
            </div>
          </div>
          <div className="betting-controls">
            <div className="odds-display">
              {formatOdds(dynamicData.odds_wrestler1)} Odds
            </div>
            <button 
              className="bet-button wrestler1"
              onClick={() => placeBet('wrestler1')}
              disabled={isPlacingBet}
            >
              {isPlacingBet ? 'Placing...' : `Bet ${bettingAmount} WC`}
            </button>
          </div>
        </div>

        <div className="vs-divider">VS</div>

        {/* Wrestler 2 */}
        <div className="wrestler-card wrestler2">
          <div className="wrestler-icon" style={{ backgroundColor: '#e74c3c' }}>
            {match.wrestler2.charAt(0).toUpperCase()}
          </div>
          <div className="wrestler-info">
            <h4 className="wrestler-name">{match.wrestler2}</h4>
            <div className="pool-info">
              {dynamicData.wrestler2_percentage}% • {formatWC(dynamicData.wrestler2_pool)} Pool
            </div>
          </div>
          <div className="betting-controls">
            <div className="odds-display">
              {formatOdds(dynamicData.odds_wrestler2)} Odds
            </div>
            <button 
              className="bet-button wrestler2"
              onClick={() => placeBet('wrestler2')}
              disabled={isPlacingBet}
            >
              {isPlacingBet ? 'Placing...' : `Bet ${bettingAmount} WC`}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Settlement Bar */}
      <div className="settlement-bar-container">
        <div className="settlement-bar">
          <div 
            className="settlement-segment wrestler1"
            style={{ 
              width: `${dynamicData.wrestler1_percentage}%`,
              backgroundColor: '#ff6b35'
            }}
          >
            <span className="percentage-text">{dynamicData.wrestler1_percentage}%</span>
          </div>
          <div 
            className="settlement-segment wrestler2"
            style={{ 
              width: `${dynamicData.wrestler2_percentage}%`,
              backgroundColor: '#e74c3c'
            }}
          >
            <span className="percentage-text">{dynamicData.wrestler2_percentage}%</span>
          </div>
        </div>
        <div className="settlement-labels">
          <span className="wrestler-label wrestler1">{match.wrestler1}</span>
          <span className="wrestler-label wrestler2">{match.wrestler2}</span>
        </div>
      </div>

      {/* Betting Amount Selector */}
      <div className="betting-amount-selector">
        <label>Bet Amount:</label>
        <div className="amount-buttons">
          {[10, 25, 50, 100, 250].map(amount => (
            <button
              key={amount}
              className={`amount-button ${bettingAmount === amount ? 'active' : ''}`}
              onClick={() => setBettingAmount(amount)}
            >
              {amount} WC
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {bettingError && (
        <div className="betting-error">
          {bettingError}
        </div>
      )}

      {/* Real-time Status */}
      <div className="realtime-status">
        <span className="status-indicator live"></span>
        Live odds updating in real-time
      </div>

      <style jsx>{`
        .dynamic-betting-card {
          background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);
          border-radius: 16px;
          padding: 24px;
          margin: 16px 0;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 107, 53, 0.2);
        }

        .match-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .match-title {
          color: #ffd700;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .match-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.champ {
          background: rgba(255, 107, 53, 0.2);
          color: #ff6b35;
        }

        .badge.weight {
          background: rgba(255, 215, 0, 0.2);
          color: #ffd700;
        }

        .badge.live {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #2ecc71;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .total-pool {
          text-align: right;
        }

        .pool-label {
          color: #ffffff;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .pool-amount {
          color: #ffd700;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .pool-status {
          color: #888;
          font-size: 12px;
        }

        .wrestlers-section {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 24px;
        }

        .wrestler-card {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .wrestler-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          font-weight: bold;
        }

        .wrestler-info {
          flex: 1;
        }

        .wrestler-name {
          color: #ffffff;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 4px 0;
        }

        .pool-info {
          color: #888;
          font-size: 14px;
        }

        .betting-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .odds-display {
          background: rgba(0, 0, 0, 0.3);
          color: #ffd700;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .bet-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .bet-button.wrestler1 {
          background: #ff6b35;
          color: white;
        }

        .bet-button.wrestler1:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .bet-button.wrestler2 {
          background: #e74c3c;
          color: white;
        }

        .bet-button.wrestler2:hover:not(:disabled) {
          background: #c0392b;
          transform: translateY(-2px);
        }

        .bet-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vs-divider {
          color: #888;
          font-size: 18px;
          font-weight: bold;
        }

        .settlement-bar-container {
          margin-bottom: 24px;
        }

        .settlement-bar {
          height: 40px;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          background: rgba(0, 0, 0, 0.3);
          margin-bottom: 8px;
          position: relative;
        }

        .settlement-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: width 0.5s ease;
          position: relative;
        }

        .percentage-text {
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .settlement-labels {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 600;
        }

        .wrestler-label.wrestler1 {
          color: #ff6b35;
        }

        .wrestler-label.wrestler2 {
          color: #e74c3c;
        }

        .betting-amount-selector {
          margin-bottom: 16px;
        }

        .betting-amount-selector label {
          color: #ffffff;
          font-size: 14px;
          margin-bottom: 8px;
          display: block;
        }

        .amount-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .amount-button {
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .amount-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .amount-button.active {
          background: #ff6b35;
          border-color: #ff6b35;
        }

        .betting-error {
          background: rgba(231, 76, 60, 0.2);
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .realtime-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2ecc71;
          font-size: 12px;
          font-weight: 600;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2ecc71;
          animation: pulse 2s infinite;
        }

        @media (max-width: 768px) {
          .wrestlers-section {
            flex-direction: column;
            gap: 16px;
          }

          .vs-divider {
            order: -1;
          }

          .match-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .total-pool {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicBettingCard;
