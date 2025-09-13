-- SIMPLE SCHEMA FIX - Handle existing policies
-- Run this if you get policy already exists errors

-- Drop ALL existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Now create the policies fresh
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can read all matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Users can read their own bets" ON bets
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own bets" ON bets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read their own transactions" ON wrestlecoin_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own transactions" ON wrestlecoin_transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Service role policies
CREATE POLICY "Service role full access users table" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access matches table" ON matches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bets table" ON bets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions table" ON wrestlecoin_transactions
  FOR ALL USING (auth.role() = 'service_role');

SELECT 'All policies recreated successfully!' as message;
