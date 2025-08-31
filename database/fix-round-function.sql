-- Quick Fix for ROUND Function Type Casting Issue
-- Run this in Supabase SQL editor to fix the ROUND function error

-- Drop the existing view that has the problematic ROUND function
DROP VIEW IF EXISTS user_stats;

-- Recreate the view with correct type casting
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.wrestlecoin_balance,
    u.total_winnings,
    u.total_spent,
    COUNT(b.id) as total_bets,
    COUNT(CASE WHEN b.status = 'won' THEN 1 END) as won_bets,
    COUNT(CASE WHEN b.status = 'lost' THEN 1 END) as lost_bets,
    CASE 
        WHEN COUNT(b.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN b.status = 'won' THEN 1 END)::numeric / COUNT(b.id)::numeric) * 100, 2)
        ELSE 0 
    END as win_percentage
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id, u.username, u.wrestlecoin_balance, u.total_winnings, u.total_spent;

-- Verify the fix
SELECT 'ROUND function fix completed successfully!' as status;
