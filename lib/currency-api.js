// lib/currency-api.js
// API functions for WrestleCoins currency integration with database

import { supabase } from './supabase';

/**
 * Get user's current WrestleCoin balance from database
 * @param {string} userId - User ID
 * @returns {Promise<{balance: number, error?: string}>}
 */
export async function getUserBalance(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('wrestlecoin_balance')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { balance: data.wrestlecoin_balance || 1000 };
  } catch (error) {
    console.error('Error fetching user balance:', error);
    return { balance: 1000, error: error.message };
  }
}

/**
 * Update user's WrestleCoin balance in database
 * @param {string} userId - User ID
 * @param {number} newBalance - New balance amount
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateUserBalance(userId, newBalance) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ wrestlecoin_balance: newBalance })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating user balance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Record a WrestleCoin transaction in the database
 * @param {Object} transaction - Transaction details
 * @param {string} transaction.userId - User ID
 * @param {string} transaction.type - 'credit' or 'debit'
 * @param {string} transaction.category - 'bet', 'win', 'daily_bonus', etc.
 * @param {number} transaction.amount - Amount in WrestleCoins
 * @param {number} transaction.balanceBefore - Balance before transaction
 * @param {number} transaction.balanceAfter - Balance after transaction
 * @param {string} transaction.description - Transaction description
 * @param {string} [transaction.relatedBetId] - Related bet ID if applicable
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function recordTransaction(transaction) {
  try {
    const { error } = await supabase
      .from('wrestlecoin_transactions')
      .insert({
        user_id: transaction.userId,
        transaction_type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        balance_before: transaction.balanceBefore,
        balance_after: transaction.balanceAfter,
        description: transaction.description,
        related_bet_id: transaction.relatedBetId || null
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error recording transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's transaction history from database
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Number of transactions to fetch
 * @returns {Promise<{transactions: Array, error?: string}>}
 */
export async function getUserTransactions(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('wrestlecoin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { transactions: data || [] };
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return { transactions: [], error: error.message };
  }
}

/**
 * Place a bet using WrestleCoins
 * @param {Object} bet - Bet details
 * @param {string} bet.userId - User ID
 * @param {string} bet.matchId - Match ID
 * @param {string} bet.wrestlerChoice - Chosen wrestler
 * @param {number} bet.amount - Bet amount in WrestleCoins
 * @param {number} bet.odds - Odds for the bet
 * @returns {Promise<{success: boolean, betId?: string, error?: string}>}
 */
export async function placeBet(bet) {
  try {
    // First, check if user has sufficient balance
    const { balance, error: balanceError } = await getUserBalance(bet.userId);
    if (balanceError) throw new Error(balanceError);
    
    if (balance < bet.amount) {
      throw new Error('Insufficient WrestleCoins balance');
    }

    // Calculate potential payout
    const potentialPayout = Math.floor(bet.amount * bet.odds);

    // Start a transaction
    const { data: betData, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: bet.userId,
        match_id: bet.matchId,
        wrestler_choice: bet.wrestlerChoice,
        amount: bet.amount,
        odds: bet.odds,
        potential_payout: potentialPayout,
        status: 'pending'
      })
      .select()
      .single();

    if (betError) throw betError;

    // Deduct balance
    const newBalance = balance - bet.amount;
    const updateResult = await updateUserBalance(bet.userId, newBalance);
    if (!updateResult.success) throw new Error(updateResult.error);

    // Record transaction
    const transactionResult = await recordTransaction({
      userId: bet.userId,
      type: 'debit',
      category: 'bet',
      amount: bet.amount,
      balanceBefore: balance,
      balanceAfter: newBalance,
      description: `Bet placed on ${bet.wrestlerChoice}`,
      relatedBetId: betData.id
    });

    if (!transactionResult.success) {
      console.error('Transaction recording failed:', transactionResult.error);
    }

    return { success: true, betId: betData.id };
  } catch (error) {
    console.error('Error placing bet:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's betting history from database
 * @param {string} userId - User ID
 * @param {number} [limit=20] - Number of bets to fetch
 * @returns {Promise<{bets: Array, error?: string}>}
 */
export async function getUserBets(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('bets')
      .select(`
        *,
        matches (
          wrestler1,
          wrestler2,
          event_name,
          weight_class,
          match_date,
          status as match_status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { bets: data || [] };
  } catch (error) {
    console.error('Error fetching user bets:', error);
    return { bets: [], error: error.message };
  }
}

/**
 * Get currency system settings
 * @returns {Promise<{settings: Object, error?: string}>}
 */
export async function getCurrencySettings() {
  try {
    const { data, error } = await supabase
      .from('currency_settings')
      .select('setting_name, setting_value, description');

    if (error) throw error;

    // Convert array to object for easier access
    const settings = {};
    data.forEach(setting => {
      settings[setting.setting_name] = {
        value: setting.setting_value,
        description: setting.description
      };
    });

    return { settings };
  } catch (error) {
    console.error('Error fetching currency settings:', error);
    return { settings: {}, error: error.message };
  }
}

/**
 * Claim daily bonus for user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, newBalance?: number, error?: string}>}
 */
export async function claimDailyBonus(userId) {
  try {
    const DAILY_BONUS_AMOUNT = 50;
    
    // Check when user last claimed bonus
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wrestlecoin_balance, last_daily_bonus')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Check if 24 hours have passed since last bonus
    if (userData.last_daily_bonus) {
      const lastBonus = new Date(userData.last_daily_bonus);
      const now = new Date();
      const timeDiff = now.getTime() - lastBonus.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff < twentyFourHours) {
        const hoursLeft = Math.ceil((twentyFourHours - timeDiff) / (1000 * 60 * 60));
        throw new Error(`Daily bonus not available yet. Try again in ${hoursLeft} hours.`);
      }
    }

    // Add bonus to balance
    const newBalance = (userData.wrestlecoin_balance || 1000) + DAILY_BONUS_AMOUNT;
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        wrestlecoin_balance: newBalance,
        last_daily_bonus: now 
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record transaction
    const transactionResult = await recordTransaction({
      userId,
      type: 'credit',
      category: 'daily_bonus',
      amount: DAILY_BONUS_AMOUNT,
      balanceBefore: userData.wrestlecoin_balance || 1000,
      balanceAfter: newBalance,
      description: 'Daily bonus reward'
    });

    if (!transactionResult.success) {
      console.error('Transaction recording failed:', transactionResult.error);
    }

    return { 
      success: true, 
      newBalance,
      amount: DAILY_BONUS_AMOUNT 
    };
  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if daily bonus is available for user
 * @param {string} userId - User ID
 * @returns {Promise<{available: boolean, timeUntilNext?: number, error?: string}>}
 */
export async function checkDailyBonusAvailability(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('last_daily_bonus')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!data.last_daily_bonus) {
      return { available: true };
    }

    const lastBonus = new Date(data.last_daily_bonus);
    const now = new Date();
    const timeDiff = now.getTime() - lastBonus.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (timeDiff >= twentyFourHours) {
      return { available: true };
    } else {
      return { 
        available: false, 
        timeUntilNext: twentyFourHours - timeDiff 
      };
    }
  } catch (error) {
    console.error('Error checking daily bonus availability:', error);
    return { available: false, error: error.message };
  }
}

/**
 * Process WrestleCoin purchase
 * @param {Object} purchase - Purchase details
 * @param {string} purchase.userId - User ID
 * @param {string} purchase.packageId - Package ID (starter, basic, premium, etc.)
 * @param {number} purchase.wcAmount - WrestleCoins amount
 * @param {number} purchase.bonusAmount - Bonus WrestleCoins
 * @param {number} purchase.price - Price in USD
 * @param {string} purchase.paymentMethod - Payment method used
 * @param {string} purchase.transactionId - Payment processor transaction ID
 * @returns {Promise<{success: boolean, newBalance?: number, error?: string}>}
 */
export async function processPurchase(purchase) {
  try {
    // Get current user balance
    const { balance, error: balanceError } = await getUserBalance(purchase.userId);
    if (balanceError) throw new Error(balanceError);

    // Calculate total WC (base + bonus)
    const totalWC = purchase.wcAmount + purchase.bonusAmount;
    const newBalance = balance + totalWC;

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ wrestlecoin_balance: newBalance })
      .eq('id', purchase.userId);

    if (updateError) throw updateError;

    // Record purchase transaction
    const transactionResult = await recordTransaction({
      userId: purchase.userId,
      type: 'credit',
      category: 'purchase',
      amount: totalWC,
      balanceBefore: balance,
      balanceAfter: newBalance,
      description: `Purchased ${purchase.wcAmount} WC + ${purchase.bonusAmount} bonus`
    });

    if (!transactionResult.success) {
      console.error('Transaction recording failed:', transactionResult.error);
    }

    // Record purchase in purchases table
    const { error: purchaseError } = await supabase
      .from('wrestlecoin_purchases')
      .insert({
        user_id: purchase.userId,
        package_id: purchase.packageId,
        wc_amount: purchase.wcAmount,
        bonus_amount: purchase.bonusAmount,
        total_wc: totalWC,
        price_usd: purchase.price,
        payment_method: purchase.paymentMethod,
        transaction_id: purchase.transactionId,
        status: 'completed'
      });

    if (purchaseError) {
      console.error('Purchase record failed:', purchaseError);
      // Don't fail the purchase if recording fails
    }

    return { 
      success: true, 
      newBalance,
      totalWC 
    };
  } catch (error) {
    console.error('Error processing purchase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get available WrestleCoin packages
 * @returns {Promise<{packages: Array, error?: string}>}
 */
export async function getWCPackages() {
  try {
    const { data, error } = await supabase
      .from('wc_packages')
      .select('*')
      .eq('active', true)
      .order('price_usd', { ascending: true });

    if (error) throw error;

    // Fallback to default packages if database is empty
    const defaultPackages = [
      {
        id: 'starter',
        name: 'Starter Pack',
        wc_amount: 100,
        bonus_amount: 0,
        price_usd: 0.99,
        popular: false,
        description: 'Perfect for trying out betting'
      },
      {
        id: 'basic',
        name: 'Basic Pack',
        wc_amount: 500,
        bonus_amount: 50,
        price_usd: 4.99,
        popular: false,
        description: 'Great value for casual bettors'
      },
      {
        id: 'premium',
        name: 'Premium Pack',
        wc_amount: 1000,
        bonus_amount: 200,
        price_usd: 9.99,
        popular: true,
        description: 'Most popular choice'
      },
      {
        id: 'pro',
        name: 'Pro Pack',
        wc_amount: 2500,
        bonus_amount: 500,
        price_usd: 19.99,
        popular: false,
        description: 'For serious bettors'
      },
      {
        id: 'ultimate',
        name: 'Ultimate Pack',
        wc_amount: 5000,
        bonus_amount: 1500,
        price_usd: 39.99,
        popular: false,
        description: 'Maximum value package'
      }
    ];

    return { packages: data.length > 0 ? data : defaultPackages };
  } catch (error) {
    console.error('Error fetching WC packages:', error);
    return { packages: [], error: error.message };
  }
}
