-- Delete all test match cards from database
-- Run this script in your Supabase SQL Editor

BEGIN;

-- First, delete all bets (to avoid foreign key constraints)
DELETE FROM bets;

-- Then delete all matches (this removes all test cards)
DELETE FROM matches;

-- Verify the cleanup
SELECT 
  'Matches remaining:' as status, 
  COUNT(*) as count 
FROM matches
UNION ALL
SELECT 
  'Bets remaining:', 
  COUNT(*) 
FROM bets;

COMMIT;

-- Success message
SELECT 
  'All test match cards deleted successfully!' as message,
  'Database is now clean and ready for production matches.' as status;
