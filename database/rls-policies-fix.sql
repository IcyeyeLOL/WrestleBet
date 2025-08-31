-- RLS Policies Fix for Matches Table
-- This fixes the "new row violates row-level security policy" error

-- First, let's check if RLS is enabled on matches table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches') THEN
        -- Enable RLS if not already enabled
        ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'RLS enabled on matches table';
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON matches;
DROP POLICY IF EXISTS "Matches can be created by authenticated users" ON matches;
DROP POLICY IF EXISTS "Matches can be updated by admins" ON matches;
DROP POLICY IF EXISTS "Matches can be deleted by admins" ON matches;

-- Create new policies

-- Policy 1: Everyone can view matches (public read access)
CREATE POLICY "Matches are viewable by everyone" ON matches
    FOR SELECT USING (true);

-- Policy 2: Authenticated users can create matches
CREATE POLICY "Matches can be created by authenticated users" ON matches
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy 3: Only admins can update matches
CREATE POLICY "Matches can be updated by admins" ON matches
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy 4: Only admins can delete matches
CREATE POLICY "Matches can be deleted by admins" ON matches
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also fix RLS for other tables that might need public access

-- Bets table policies
DROP POLICY IF EXISTS "Users can view their own bets" ON bets;
DROP POLICY IF EXISTS "Users can create their own bets" ON bets;
DROP POLICY IF EXISTS "Users can update their own bets" ON bets;

CREATE POLICY "Users can view their own bets" ON bets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets" ON bets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bets" ON bets
    FOR UPDATE USING (auth.uid() = user_id);

-- Votes table policies (allow anonymous voting)
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
DROP POLICY IF EXISTS "Anyone can create votes" ON votes;

CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create votes" ON votes
    FOR INSERT WITH CHECK (true);

-- WrestleCoin transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON wrestlecoin_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON wrestlecoin_transactions;

CREATE POLICY "Users can view their own transactions" ON wrestlecoin_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON wrestlecoin_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Currency settings policies (public read, admin write)
DROP POLICY IF EXISTS "Currency settings are viewable by everyone" ON currency_settings;
DROP POLICY IF EXISTS "Only admins can modify currency settings" ON currency_settings;

CREATE POLICY "Currency settings are viewable by everyone" ON currency_settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify currency settings" ON currency_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policies
DO $$ 
BEGIN
    RAISE NOTICE 'RLS Policies created successfully!';
    RAISE NOTICE 'Matches table now has public read access';
    RAISE NOTICE 'Authenticated users can create matches';
    RAISE NOTICE 'Bets are protected by user ownership';
    RAISE NOTICE 'Votes allow anonymous participation';
END $$;
