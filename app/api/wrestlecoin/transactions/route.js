import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Get user's WC balance and transaction history
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Get user's WC balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wrestlecoin_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get recent transactions
    const { data: transactions, error: transError } = await supabase
      .from('wrestlecoin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (transError) throw transError;

    return NextResponse.json({
      success: true,
      balance: userData?.wrestlecoin_balance || 0,
      transactions: transactions || []
    });
  } catch (error) {
    console.error('Error loading WC data:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Create new WC transaction
export async function POST(request) {
  try {
    const { 
      userId, 
      transaction_type, 
      category, 
      amount, 
      description, 
      reference_id 
    } = await request.json();

    if (!userId || !transaction_type || !category || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Start transaction
    const { data: transaction, error: transError } = await supabase
      .from('wrestlecoin_transactions')
      .insert([{
        user_id: userId,
        transaction_type,
        category,
        amount: parseFloat(amount),
        description: description || '',
        reference_id
      }])
      .select()
      .single();

    if (transError) throw transError;

    // Update user balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wrestlecoin_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const currentBalance = userData?.wrestlecoin_balance || 0;
    const newBalance = transaction_type === 'credit' 
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    const { error: balanceError } = await supabase
      .from('users')
      .update({ wrestlecoin_balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    return NextResponse.json({
      success: true,
      transaction,
      newBalance
    });
  } catch (error) {
    console.error('Error creating WC transaction:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT - Update user WC balance
export async function PUT(request) {
  try {
    const { userId, newBalance } = await request.json();

    if (!userId || newBalance === undefined) {
      return NextResponse.json({
        success: false,
        error: 'User ID and new balance are required'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ wrestlecoin_balance: parseFloat(newBalance) })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error('Error updating WC balance:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
