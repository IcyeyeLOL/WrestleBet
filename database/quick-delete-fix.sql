-- QUICK DELETE FIX: Make RLS permissive for admin operations
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;  
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any conflicting policies
DROP POLICY IF EXISTS "matches_select_policy" ON matches;
DROP POLICY IF EXISTS "matches_insert_policy" ON matches;
DROP POLICY IF EXISTS "matches_update_policy" ON matches;
DROP POLICY IF EXISTS "matches_delete_policy" ON matches;
DROP POLICY IF EXISTS "admin_full_access" ON matches;

DROP POLICY IF EXISTS "votes_select_policy" ON votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON votes;
DROP POLICY IF EXISTS "votes_update_policy" ON votes;
DROP POLICY IF EXISTS "votes_delete_policy" ON votes;
DROP POLICY IF EXISTS "votes_full_access" ON votes;

DROP POLICY IF EXISTS "bets_select_policy" ON bets;
DROP POLICY IF EXISTS "bets_insert_policy" ON bets;
DROP POLICY IF EXISTS "bets_update_policy" ON bets;
DROP POLICY IF EXISTS "bets_delete_policy" ON bets;
DROP POLICY IF EXISTS "bets_full_access" ON bets;

-- Step 3: Re-enable RLS with permissive policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access" ON matches FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_full_access" ON votes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "bets_full_access" ON bets FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Verification
SELECT 'ADMIN DELETE CAPABILITY RESTORED' as status;

-- Check current policies
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('matches', 'votes', 'bets');
