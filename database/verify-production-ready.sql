-- VERIFY CLEAN DATABASE FOR PRODUCTION
-- This script checks that the database is clean and ready for production

-- Check for any test/demo matches
SELECT 
  'Test Matches Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEAN - No test matches found'
    ELSE '❌ DIRTY - Test matches found: ' || string_agg(wrestler1 || ' vs ' || wrestler2, ', ')
  END as status
FROM matches 
WHERE 
  wrestler1 ILIKE '%test%' OR 
  wrestler2 ILIKE '%test%' OR 
  wrestler1 ILIKE '%demo%' OR 
  wrestler2 ILIKE '%demo%' OR
  wrestler1 ILIKE '%john smith%' OR 
  wrestler2 ILIKE '%john smith%' OR
  wrestler1 ILIKE '%mike johnson%' OR 
  wrestler2 ILIKE '%mike johnson%' OR
  event_name ILIKE '%test%' OR
  event_name ILIKE '%demo%' OR
  id::text ILIKE '%test%' OR
  id::text ILIKE '%demo%';

-- Check for orphaned bets (bets without valid matches)
SELECT 
  'Orphaned Bets Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEAN - No orphaned bets found'
    ELSE '❌ DIRTY - Orphaned bets found'
  END as status
FROM bets b
LEFT JOIN matches m ON b.match_id = m.id
WHERE m.id IS NULL;

-- Check for orphaned transactions (transactions without valid bets)
SELECT 
  'Orphaned Transactions Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEAN - No orphaned transactions found'
    ELSE '❌ DIRTY - Orphaned transactions found'
  END as status
FROM wrestlecoin_transactions t
LEFT JOIN bets b ON t.bet_id = b.id
WHERE t.bet_id IS NOT NULL AND b.id IS NULL;

-- Check for users with invalid balances
SELECT 
  'Invalid Balances Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEAN - All user balances are valid'
    ELSE '❌ DIRTY - Users with invalid balances found'
  END as status
FROM users 
WHERE wrestlecoin_balance < 0 OR wrestlecoin_balance > 100000;

-- Summary of all data
SELECT 
  'Database Summary' as summary_type,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM matches) as total_matches,
  (SELECT COUNT(*) FROM bets) as total_bets,
  (SELECT COUNT(*) FROM wrestlecoin_transactions) as total_transactions,
  (SELECT COUNT(*) FROM matches WHERE status = 'upcoming') as upcoming_matches,
  (SELECT COUNT(*) FROM matches WHERE status = 'active') as active_matches,
  (SELECT COUNT(*) FROM matches WHERE status = 'completed') as completed_matches;

-- Check if all required tables exist
SELECT 
  'Schema Check' as check_type,
  COUNT(*) as table_count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ COMPLETE - All required tables exist'
    ELSE '❌ INCOMPLETE - Missing tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'matches', 'bets', 'wrestlecoin_transactions');

-- Check if RLS is enabled
SELECT 
  'RLS Check' as check_type,
  COUNT(*) as tables_with_rls,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ SECURE - RLS enabled on all tables'
    ELSE '❌ INSECURE - RLS not enabled on all tables'
  END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('users', 'matches', 'bets', 'wrestlecoin_transactions')
  AND c.relrowsecurity = true;

-- Final production readiness assessment
SELECT 
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM matches WHERE wrestler1 ILIKE '%test%' OR wrestler2 ILIKE '%test%' OR wrestler1 ILIKE '%demo%' OR wrestler2 ILIKE '%demo%') = 0
      AND (SELECT COUNT(*) FROM bets b LEFT JOIN matches m ON b.match_id = m.id WHERE m.id IS NULL) = 0
      AND (SELECT COUNT(*) FROM users WHERE wrestlecoin_balance < 0 OR wrestlecoin_balance > 100000) = 0
      AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'matches', 'bets', 'wrestlecoin_transactions')) = 4
    ) THEN '🚀 PRODUCTION READY - Database is clean and secure!'
    ELSE '⚠️ NOT READY - Database needs cleanup before production'
  END as production_status;
