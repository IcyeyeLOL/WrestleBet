import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Fetch users for admin management
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    let query = supabase
      .from('users')
      .select(`
        *,
        wrestlecoin_transactions (
          amount,
          category,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Apply search filter
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Calculate user statistics
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const { data: bets } = await supabase
        .from('bets')
        .select('amount, wrestler_choice')
        .eq('user_id', user.id);

      const { data: wins } = await supabase
        .from('bets')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'won');

      return {
        ...user,
        totalBets: bets?.length || 0,
        totalWins: wins?.length || 0,
        winRate: bets?.length > 0 ? ((wins?.length || 0) / bets.length * 100) : 0,
        recentActivity: user.wrestlecoin_transactions?.slice(0, 5) || []
      };
    }));

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      total: count,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user (admin actions)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id,
      wrestlecoinBalance,
      action, // 'add_balance', 'remove_balance', 'reset_balance', 'suspend', 'unsuspend'
      amount,
      reason,
      adminUserId 
    } = body;

    if (!id || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and action are required' 
      }, { status: 400 });
    }

    let updateData = {};
    let transactionData = null;

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    switch (action) {
      case 'add_balance':
        if (!amount || amount <= 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'Valid amount required' 
          }, { status: 400 });
        }
        updateData.wrestlecoin_balance = currentUser.wrestlecoin_balance + amount;
        transactionData = {
          user_id: id,
          transaction_type: 'credit',
          category: 'admin_adjustment',
          amount: amount,
          balance_before: currentUser.wrestlecoin_balance,
          balance_after: currentUser.wrestlecoin_balance + amount,
          description: reason || `Admin added ${amount} WC`
        };
        break;

      case 'remove_balance':
        if (!amount || amount <= 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'Valid amount required' 
          }, { status: 400 });
        }
        updateData.wrestlecoin_balance = Math.max(0, currentUser.wrestlecoin_balance - amount);
        transactionData = {
          user_id: id,
          transaction_type: 'debit',
          category: 'admin_adjustment',
          amount: -amount,
          balance_before: currentUser.wrestlecoin_balance,
          balance_after: Math.max(0, currentUser.wrestlecoin_balance - amount),
          description: reason || `Admin removed ${amount} WC`
        };
        break;

      case 'reset_balance':
        updateData.wrestlecoin_balance = 1000; // Default starting balance
        transactionData = {
          user_id: id,
          transaction_type: 'credit',
          category: 'reset',
          amount: 1000 - currentUser.wrestlecoin_balance,
          balance_before: currentUser.wrestlecoin_balance,
          balance_after: 1000,
          description: reason || 'Admin reset balance to 1000 WC'
        };
        break;

      case 'set_balance':
        if (wrestlecoinBalance === undefined) {
          return NextResponse.json({ 
            success: false, 
            error: 'Balance amount required' 
          }, { status: 400 });
        }
        updateData.wrestlecoin_balance = wrestlecoinBalance;
        transactionData = {
          user_id: id,
          transaction_type: wrestlecoinBalance > currentUser.wrestlecoin_balance ? 'credit' : 'debit',
          category: 'admin_adjustment',
          amount: wrestlecoinBalance - currentUser.wrestlecoin_balance,
          balance_before: currentUser.wrestlecoin_balance,
          balance_after: wrestlecoinBalance,
          description: reason || `Admin set balance to ${wrestlecoinBalance} WC`
        };
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Create transaction record
    if (transactionData) {
      await supabase
        .from('wrestlecoin_transactions')
        .insert(transactionData);
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'user_updated',
          resource_type: 'user',
          resource_id: id,
          details: { action, amount, reason, oldBalance: currentUser.wrestlecoin_balance, newBalance: updateData.wrestlecoin_balance }
        });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${action.replace('_', ' ')} completed successfully`
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete user (careful operation)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminUserId = searchParams.get('adminUserId');
    const confirm = searchParams.get('confirm') === 'true';

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    if (!confirm) {
      return NextResponse.json({ 
        success: false, 
        error: 'Confirmation required for user deletion' 
      }, { status: 400 });
    }

    // Check if user has active bets
    const { data: activeBets } = await supabase
      .from('bets')
      .select('id')
      .eq('user_id', id)
      .in('status', ['active', 'pending']);

    if (activeBets && activeBets.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete user with active bets' 
      }, { status: 400 });
    }

    // Get user data before deletion for logging
    const { data: userData } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', id)
      .single();

    // Delete user (cascading will handle related records)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'user_deleted',
          resource_type: 'user',
          resource_id: id,
          details: { username: userData?.username, email: userData?.email }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin user deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
