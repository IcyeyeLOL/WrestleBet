-- QUICK DATABASE DIAGNOSTIC
-- Run this to see what's currently in your database

-- Check if matches table exists and what columns it has
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;

-- Check if users table exists and what columns it has
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if bets table exists and what columns it has
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bets' 
ORDER BY ordinal_position;

-- Check if functions exist
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('create_user_if_not_exists', 'update_match_pools');

-- Check if triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name = 'update_pools_after_bet';



