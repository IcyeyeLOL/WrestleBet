import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const RealWrestleCoinSystem = () => {
  const [userBalance, setUserBalance] = useState(0);
  const [bettingPools, setBettingPools] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load real user balance
  useEffect(() => {
    loadUserBalance();
    loadBettingPools();
    loadTransactions();
  }, []);

  // Load actual user WrestleCoin balance
  const loadUserBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('wrestlecoin_balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserBalance(data.wrestlecoin_balance || 0);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  // Load real betting pools for all matches
  const loadBettingPools = async () => {
    try {
      // Get all active matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, wrestler1, wrestler2')
        .eq('status', 'active');

      if (matchesError) throw matchesError;

      // Calculate real betting pools for each match
      const pools = {};
      for (const match of matches) {
        const { data: bets, error: betsError } = await supabase
          .from('bets')
          .select('amount, wrestler_choice')
          .eq('match_id', match.id);

        if (betsError) continue;

        const totalPool = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const wrestler1Pool = bets
          .filter(bet => bet.wrestler_choice === 'wrestler1')
          .reduce((sum, bet) => sum + bet.amount, 0);
        const wrestler2Pool = bets
          .filter(bet => bet.wrestler_choice === 'wrestler2')
          .reduce((sum, bet) => sum + bet.amount, 0);

        pools[match.id] = {
          total: totalPool,
          wrestler1: wrestler1Pool,
          wrestler2: wrestler2Pool,
          odds1: totalPool > 0 ? (totalPool / wrestler1Pool).toFixed(1) : 1.0,
          odds2: totalPool > 0 ? (totalPool / wrestler2Pool).toFixed(1) : 1.0
        };
      }

      setBettingPools(pools);
    } catch (err) {
      console.error('Failed to load betting pools:', err);
    }
  };

  // Load transaction history
  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wrestlecoin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  // Place real bet with actual WC deduction
  const placeBet = async (matchId, wrestlerChoice, amount) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has enough balance
      if (userBalance < amount) {
        throw new Error('Insufficient WrestleCoin balance');
      }

      // Start transaction
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert([{
          user_id: user.id,
          match_id: matchId,
          wrestler_choice: wrestlerChoice,
          amount: amount,
          status: 'active'
        }])
        .select()
        .single();

      if (betError) throw betError;

      // Deduct WC from user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ 
          wrestlecoin_balance: userBalance - amount 
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('wrestlecoin_transactions')
        .insert([{
          user_id: user.id,
          transaction_type: 'debit',
          category: 'betting',
          amount: -amount,
          description: `Bet on ${wrestlerChoice} in match ${matchId}`,
          reference_id: bet.id
        }]);

      if (transactionError) throw transactionError;

      // Refresh data
      await loadUserBalance();
      await loadBettingPools();
      await loadTransactions();

      return bet;
    } catch (err) {
      console.error('Failed to place bet:', err);
      throw err;
    }
  };

  // Calculate winnings and distribute WC
  const calculateWinnings = async (matchId, winner) => {
    try {
      // Get all bets for this match
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('match_id', matchId);

      if (betsError) throw betsError;

      const totalPool = bets.reduce((sum, bet) => sum + bet.amount, 0);
      const winningBets = bets.filter(bet => bet.wrestler_choice === winner);
      const winningPool = winningBets.reduce((sum, bet) => sum + bet.amount, 0);

      // Distribute winnings to winners
      for (const bet of winningBets) {
        const winnings = (bet.amount / winningPool) * totalPool;
        
        // Add winnings to user balance
        const { error: balanceError } = await supabase
          .from('users')
          .update({ 
            wrestlecoin_balance: bet.user.wrestlecoin_balance + winnings 
          })
          .eq('id', bet.user_id);

        if (balanceError) throw balanceError;

        // Record winning transaction
        const { error: transactionError } = await supabase
          .from('wrestlecoin_transactions')
          .insert([{
            user_id: bet.user_id,
            transaction_type: 'credit',
            category: 'winnings',
            amount: winnings,
            description: `Won bet on ${winner} in match ${matchId}`,
            reference_id: bet.id
          }]);

        if (transactionError) throw transactionError;
      }

      // Mark match as completed
      const { error: matchError } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          winner: winner,
          total_payout: totalPool
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

    } catch (err) {
      console.error('Failed to calculate winnings:', err);
    }
  };

  return (
    <div className="real-wrestlecoin-system">
      <div className="balance-section">
        <h3>Your WrestleCoin Balance</h3>
        <div className="balance-display">
          <span className="balance-amount">{userBalance.toFixed(2)} WC</span>
        </div>
      </div>

      <div className="betting-pools">
        <h3>Real Betting Pools</h3>
        {Object.entries(bettingPools).map(([matchId, pool]) => (
          <div key={matchId} className="pool-card">
            <h4>Match {matchId}</h4>
            <p>Total Pool: {pool.total} WC</p>
            <p>Wrestler 1: {pool.wrestler1} WC (Odds: {pool.odds1})</p>
            <p>Wrestler 2: {pool.wrestler2} WC (Odds: {pool.odds2})</p>
          </div>
        ))}
      </div>

      <div className="transactions">
        <h3>Recent Transactions</h3>
        {transactions.map(tx => (
          <div key={tx.id} className="transaction-item">
            <span className={`amount ${tx.amount > 0 ? 'credit' : 'debit'}`}>
              {tx.amount > 0 ? '+' : ''}{tx.amount} WC
            </span>
            <span className="description">{tx.description}</span>
            <span className="date">{new Date(tx.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealWrestleCoinSystem;
