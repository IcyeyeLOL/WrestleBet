-- DYNAMIC BETTING SYSTEM SCHEMA
-- This creates a real-time dynamic betting system with live odds and settlement bars

BEGIN;

-- ============================================================================
-- STEP 1: DROP ALL EXISTING POLICIES FIRST
-- ============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all existing policies
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
                     r.policyname, r.schemaname, r.tablename);
      RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not drop policy % on %.%: %', r.policyname, r.schemaname, r.tablename, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 2: DROP AND RECREATE TABLES WITH DYNAMIC BETTING SCHEMA
-- ============================================================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS wrestlecoin_transactions CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (TEXT id for Clerk compatibility)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  wrestlecoin_balance INTEGER DEFAULT 1000,
  total_winnings DECIMAL(10, 2) DEFAULT 0.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table (UUID id for proper database compatibility)
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler1 VARCHAR(100) NOT NULL,
  wrestler2 VARCHAR(100) NOT NULL,
  event_name VARCHAR(200),
  weight_class VARCHAR(50),
  match_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  winner VARCHAR(100),
  -- Dynamic betting columns
  wrestler1_pool INTEGER DEFAULT 0,
  wrestler2_pool INTEGER DEFAULT 0,
  total_pool INTEGER DEFAULT 0,
  wrestler1_percentage INTEGER DEFAULT 50,
  wrestler2_percentage INTEGER DEFAULT 50,
  odds_wrestler1 DECIMAL(5,2) DEFAULT 2.0,
  odds_wrestler2 DECIMAL(5,2) DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table (FIXED - only bet_amount field)
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice VARCHAR(20) NOT NULL CHECK (wrestler_choice IN ('wrestler1', 'wrestler2')),
  bet_amount INTEGER NOT NULL CHECK (bet_amount > 0),
  odds DECIMAL(5,2) NOT NULL CHECK (odds >= 1.0),
  potential_payout DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id, wrestler_choice)
);

-- WrestleCoin Transactions table
CREATE TABLE wrestlecoin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('bet', 'win', 'refund', 'purchase', 'bonus')),
  amount INTEGER NOT NULL,
  description TEXT,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: CREATE DYNAMIC ODDS CALCULATION FUNCTIONS
-- ============================================================================

-- Function to create user if not exists (for Clerk integration)
CREATE OR REPLACE FUNCTION create_user_if_not_exists(p_clerk_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  user_exists BOOLEAN;
  new_user_id TEXT;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_clerk_user_id) INTO user_exists;
  
  IF user_exists THEN
    RETURN json_build_object('success', true, 'message', 'User already exists', 'user_id', p_clerk_user_id);
  ELSE
    -- Create new user
    INSERT INTO users (id, email, created_at, updated_at)
    VALUES (p_clerk_user_id, p_clerk_user_id || '@temp.com', NOW(), NOW())
    RETURNING id INTO new_user_id;
    
    RETURN json_build_object('success', true, 'message', 'User created', 'user_id', new_user_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate dynamic odds based on betting pools
CREATE OR REPLACE FUNCTION calculate_dynamic_odds(p_match_id UUID)
RETURNS TABLE(
  wrestler1_odds DECIMAL(5,2),
  wrestler2_odds DECIMAL(5,2),
  wrestler1_pool INTEGER,
  wrestler2_pool INTEGER,
  total_pool INTEGER,
  wrestler1_percentage INTEGER,
  wrestler2_percentage INTEGER
) AS $$
DECLARE
  v_wrestler1_pool INTEGER := 0;
  v_wrestler2_pool INTEGER := 0;
  v_total_pool INTEGER := 0;
  v_wrestler1_odds DECIMAL(5,2) := 2.0;
  v_wrestler2_odds DECIMAL(5,2) := 2.0;
  v_wrestler1_percentage INTEGER := 50;
  v_wrestler2_percentage INTEGER := 50;
BEGIN
  -- Calculate pools from active bets
  SELECT 
    COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler1' THEN bet_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler2' THEN bet_amount ELSE 0 END), 0),
    COALESCE(SUM(bet_amount), 0)
  INTO v_wrestler1_pool, v_wrestler2_pool, v_total_pool
  FROM bets 
  WHERE match_id = p_match_id AND status = 'active';
  
  -- Calculate percentages
  IF v_total_pool > 0 THEN
    v_wrestler1_percentage := ROUND((v_wrestler1_pool::DECIMAL / v_total_pool) * 100);
    v_wrestler2_percentage := 100 - v_wrestler1_percentage;
  END IF;
  
  -- Calculate dynamic odds (higher pool = lower odds)
  -- Formula: odds = (total_pool / wrestler_pool) * house_edge_factor
  -- House edge factor of 0.9 means 10% house edge
  IF v_wrestler1_pool > 0 THEN
    v_wrestler1_odds := ROUND((v_total_pool::DECIMAL / v_wrestler1_pool) * 0.9, 2);
    -- Ensure minimum odds of 1.10
    v_wrestler1_odds := GREATEST(v_wrestler1_odds, 1.10);
  ELSE
    v_wrestler1_odds := 10.0; -- High odds if no bets
  END IF;
  
  IF v_wrestler2_pool > 0 THEN
    v_wrestler2_odds := ROUND((v_total_pool::DECIMAL / v_wrestler2_pool) * 0.9, 2);
    -- Ensure minimum odds of 1.10
    v_wrestler2_odds := GREATEST(v_wrestler2_odds, 1.10);
  ELSE
    v_wrestler2_odds := 10.0; -- High odds if no bets
  END IF;
  
  RETURN QUERY SELECT 
    v_wrestler1_odds,
    v_wrestler2_odds,
    v_wrestler1_pool,
    v_wrestler2_pool,
    v_total_pool,
    v_wrestler1_percentage,
    v_wrestler2_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update match pools and odds dynamically
CREATE OR REPLACE FUNCTION update_match_pools()
RETURNS TRIGGER AS $$
DECLARE
  v_odds_data RECORD;
BEGIN
  -- Calculate dynamic odds and pools
  SELECT * INTO v_odds_data
  FROM calculate_dynamic_odds(NEW.match_id);
  
  -- Update match with new dynamic data
  UPDATE matches 
  SET 
    wrestler1_pool = v_odds_data.wrestler1_pool,
    wrestler2_pool = v_odds_data.wrestler2_pool,
    total_pool = v_odds_data.total_pool,
    wrestler1_percentage = v_odds_data.wrestler1_percentage,
    wrestler2_percentage = v_odds_data.wrestler2_percentage,
    odds_wrestler1 = v_odds_data.wrestler1_odds,
    odds_wrestler2 = v_odds_data.wrestler2_odds,
    updated_at = NOW()
  WHERE id = NEW.match_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: CREATE TRIGGERS FOR REAL-TIME UPDATES
-- ============================================================================

-- Trigger for dynamic pool updates (fires on bet insert/update/delete)
CREATE TRIGGER update_match_pools_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_match_pools();

-- ============================================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlecoin_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- Users policies
CREATE POLICY "Users can read their own data v5" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data v5" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Matches policies
CREATE POLICY "Users can read all matches v5" ON matches
  FOR SELECT USING (true);

-- Bets policies
CREATE POLICY "Users can read their own bets v5" ON bets
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own bets v5" ON bets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Transactions policies
CREATE POLICY "Users can read their own transactions v5" ON wrestlecoin_transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own transactions v5" ON wrestlecoin_transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Service role policies (for admin operations)
CREATE POLICY "Service role full access users table v5" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access matches table v5" ON matches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bets table v5" ON bets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions table v5" ON wrestlecoin_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- STEP 7: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wrestlecoin_transactions(user_id);

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================
GRANT ALL ON users TO anon;
GRANT ALL ON matches TO anon;
GRANT ALL ON bets TO anon;
GRANT ALL ON wrestlecoin_transactions TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON matches TO authenticated;
GRANT ALL ON bets TO authenticated;
GRANT ALL ON wrestlecoin_transactions TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT 'Dynamic Betting System Deployed Successfully!' as message,
       'Real-time odds calculation and settlement bars are now active.' as status;
