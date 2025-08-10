import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - Fetch analytics data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview'; // overview, betting, users, revenue

    const now = new Date();
    let startDate = new Date();

    // Set date range based on period
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    let analyticsData = {};

    if (type === 'overview' || type === 'all') {
      // Overall platform metrics
      const [
        { count: totalUsers },
        { count: totalMatches },
        { count: totalBets },
        { data: recentTransactions }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('bets').select('*', { count: 'exact', head: true }),
        supabase
          .from('wrestlecoin_transactions')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      // Calculate totals from transactions
      const totalVolume = recentTransactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;
      const totalWinnings = recentTransactions?.filter(tx => tx.category === 'win').reduce((sum, tx) => sum + tx.amount, 0) || 0;

      analyticsData.overview = {
        totalUsers: totalUsers || 0,
        totalMatches: totalMatches || 0,
        totalBets: totalBets || 0,
        totalVolume,
        totalWinnings,
        period
      };
    }

    if (type === 'betting' || type === 'all') {
      // Betting specific analytics
      const { data: bettingData } = await supabase
        .from('bets')
        .select(`
          *,
          matches (wrestler1, wrestler2, status, event_name)
        `)
        .gte('created_at', startDate.toISOString());

      // Group by match
      const matchStats = {};
      bettingData?.forEach(bet => {
        const matchId = bet.match_id;
        if (!matchStats[matchId]) {
          matchStats[matchId] = {
            match: bet.matches,
            totalBets: 0,
            totalVolume: 0,
            wrestler1Bets: 0,
            wrestler2Bets: 0,
            avgBetAmount: 0
          };
        }
        
        matchStats[matchId].totalBets++;
        matchStats[matchId].totalVolume += bet.amount;
        
        if (bet.wrestler_choice === bet.matches.wrestler1) {
          matchStats[matchId].wrestler1Bets++;
        } else {
          matchStats[matchId].wrestler2Bets++;
        }
      });

      // Calculate averages
      Object.keys(matchStats).forEach(matchId => {
        const stats = matchStats[matchId];
        stats.avgBetAmount = stats.totalVolume / stats.totalBets;
      });

      analyticsData.betting = {
        matchStats: Object.values(matchStats).slice(0, 10), // Top 10 matches
        totalMatches: Object.keys(matchStats).length,
        period
      };
    }

    if (type === 'users' || type === 'all') {
      // User analytics
      const [
        { data: activeUsers },
        { data: topBettors },
        { data: userGrowth }
      ] = await Promise.all([
        supabase
          .from('user_analytics')
          .select('user_id')
          .eq('metric_type', 'bet_placed')
          .gte('recorded_at', startDate.toISOString()),
        supabase
          .from('users')
          .select('id, username, email, wrestlecoin_balance, total_winnings, total_spent')
          .order('total_spent', { ascending: false })
          .limit(10),
        supabase
          .from('users')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })
      ]);

      // Count unique active users
      const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;

      // Group user growth by day
      const growthByDay = {};
      userGrowth?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        growthByDay[date] = (growthByDay[date] || 0) + 1;
      });

      analyticsData.users = {
        activeUsers: uniqueActiveUsers,
        topBettors: topBettors || [],
        userGrowth: growthByDay,
        newUsersCount: userGrowth?.length || 0,
        period
      };
    }

    if (type === 'revenue' || type === 'all') {
      // Revenue analytics (house edge from completed bets)
      const { data: completedMatches } = await supabase
        .from('matches')
        .select(`
          id,
          winner,
          bets (amount, wrestler_choice, user_id)
        `)
        .eq('status', 'completed')
        .gte('updated_at', startDate.toISOString());

      let totalRevenue = 0;
      let totalPayouts = 0;

      completedMatches?.forEach(match => {
        const totalPool = match.bets?.reduce((sum, bet) => sum + bet.amount, 0) || 0;
        const winningBets = match.bets?.filter(bet => bet.wrestler_choice === match.winner) || [];
        const winningPool = winningBets.reduce((sum, bet) => sum + bet.amount, 0);
        
        // Simplified house edge calculation (5%)
        const houseEdge = totalPool * 0.05;
        const payoutAmount = totalPool - houseEdge;
        
        totalRevenue += houseEdge;
        totalPayouts += payoutAmount;
      });

      analyticsData.revenue = {
        totalRevenue,
        totalPayouts,
        completedMatches: completedMatches?.length || 0,
        period
      };
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period,
      type
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
