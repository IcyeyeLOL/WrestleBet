-- COMPREHENSIVE FORCE MATCHES REMOVAL SCRIPT
-- This script removes ALL hardcoded/test matches from the database
-- Run this in your Supabase SQL Editor

BEGIN;

-- First, let's see what force matches exist
SELECT 
  'FORCE MATCHES TO BE DELETED:' as action,
  COUNT(*) as total_matches,
  STRING_AGG(wrestler1 || ' vs ' || wrestler2, ', ') as match_list
FROM matches 
WHERE 
  LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
  OR LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
  OR LOWER(wrestler1) LIKE '%test%' 
  OR LOWER(wrestler2) LIKE '%test%' 
  OR LOWER(wrestler1) LIKE '%demo%' 
  OR LOWER(wrestler2) LIKE '%demo%'
  OR LOWER(event_name) LIKE '%test%'
  OR LOWER(event_name) LIKE '%demo%'
  OR id::text LIKE '%test%'
  OR id::text LIKE '%demo%';

-- Step 1: Delete all bets associated with force matches
DELETE FROM bets 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE 
    LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler1) LIKE '%test%' 
    OR LOWER(wrestler2) LIKE '%test%' 
    OR LOWER(wrestler1) LIKE '%demo%' 
    OR LOWER(wrestler2) LIKE '%demo%'
    OR LOWER(event_name) LIKE '%test%'
    OR LOWER(event_name) LIKE '%demo%'
    OR id::text LIKE '%test%'
    OR id::text LIKE '%demo%'
);

-- Step 2: Delete all votes associated with force matches  
DELETE FROM votes 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE 
    LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler1) LIKE '%test%' 
    OR LOWER(wrestler2) LIKE '%test%' 
    OR LOWER(wrestler1) LIKE '%demo%' 
    OR LOWER(wrestler2) LIKE '%demo%'
    OR LOWER(event_name) LIKE '%test%'
    OR LOWER(event_name) LIKE '%demo%'
    OR id::text LIKE '%test%'
    OR id::text LIKE '%demo%'
);

-- Step 3: Delete all wrestlecoin transactions associated with force matches
DELETE FROM wrestlecoin_transactions 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE 
    LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
    OR LOWER(wrestler1) LIKE '%test%' 
    OR LOWER(wrestler2) LIKE '%test%' 
    OR LOWER(wrestler1) LIKE '%demo%' 
    OR LOWER(wrestler2) LIKE '%demo%'
    OR LOWER(event_name) LIKE '%test%'
    OR LOWER(event_name) LIKE '%demo%'
    OR id::text LIKE '%test%'
    OR id::text LIKE '%demo%'
);

-- Step 4: Delete the force matches themselves
DELETE FROM matches 
WHERE 
  LOWER(wrestler1) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
  OR LOWER(wrestler2) IN ('david taylor', 'hassan yazdani', 'kyle dake', 'bajrang punia', 'gable steveson', 'geno petriashvili', 'frank chamizo', 'yuki takahashi', 'sarah wilson', 'emma davis', 'alex thompson', 'chris brown', 'john smith', 'mike johnson')
  OR LOWER(wrestler1) LIKE '%test%' 
  OR LOWER(wrestler2) LIKE '%test%' 
  OR LOWER(wrestler1) LIKE '%demo%' 
  OR LOWER(wrestler2) LIKE '%demo%'
  OR LOWER(event_name) LIKE '%test%'
  OR LOWER(event_name) LIKE '%demo%'
  OR id::text LIKE '%test%'
  OR id::text LIKE '%demo%';

COMMIT;

-- Verification queries
SELECT 
  'CLEANUP COMPLETE' as status,
  COUNT(*) as remaining_matches,
  COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_matches,
  COUNT(CASE WHEN status = 'live' THEN 1 END) as live_matches,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches
FROM matches;

SELECT COUNT(*) as remaining_bets FROM bets;
SELECT COUNT(*) as remaining_users FROM users;

-- Show remaining matches (if any)
SELECT 
  wrestler1, 
  wrestler2, 
  event_name, 
  status,
  created_at
FROM matches 
ORDER BY created_at DESC;

-- Success message
SELECT 
  '✅ ALL FORCE MATCHES REMOVED SUCCESSFULLY!' as message,
  'Database is now clean of hardcoded/test matches.' as status;
