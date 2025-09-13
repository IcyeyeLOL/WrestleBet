-- CLEAN FIX FOR UUID ERROR - HANDLES EXISTING POLICIES
-- This script will fix the UUID issue while handling existing policies

-- Step 1: Drop existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.tablename || ';';
        RAISE NOTICE 'Dropped policy: % on table %', r.policyname, r.tablename;
    END LOOP;
END
$$;

-- Step 2: Drop and recreate users table with TEXT id
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  wrestlecoin_balance INTEGER DEFAULT 1000 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Drop and recreate bets table with TEXT user_id
DROP TABLE IF EXISTS bets CASCADE;

CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice TEXT NOT NULL CHECK (wrestler_choice IN ('wrestler1', 'wrestler2')),
  bet_amount INTEGER NOT NULL CHECK (bet_amount > 0),
  odds DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Step 4: Drop and recreate wrestlecoin_transactions table with TEXT user_id
DROP TABLE IF EXISTS wrestlecoin_transactions CASCADE;

CREATE TABLE wrestlecoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('bet', 'win', 'refund', 'admin_adjustment')),
  description TEXT,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrestlecoin_transactions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create basic RLS policies (with unique names)
CREATE POLICY "Users can read all matches v2" ON matches FOR SELECT USING (true);
CREATE POLICY "Users can read own data v2" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can read own bets v2" ON bets FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own bets v2" ON bets FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can read own transactions v2" ON wrestlecoin_transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own transactions v2" ON wrestlecoin_transactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Step 7: Drop existing function first, then create user creation function
DROP FUNCTION IF EXISTS create_user_if_not_exists(TEXT);

CREATE FUNCTION create_user_if_not_exists(p_clerk_user_id TEXT)
RETURNS TABLE(id TEXT, wrestlecoin_balance INTEGER) AS $$
BEGIN
  INSERT INTO users (id, wrestlecoin_balance)
  VALUES (p_clerk_user_id, 1000)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN QUERY
  SELECT u.id, u.wrestlecoin_balance
  FROM users u
  WHERE u.id = p_clerk_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Drop existing function first, then create match pool update function
DROP FUNCTION IF EXISTS update_match_pools();

CREATE FUNCTION update_match_pools()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches SET
    wrestler1_pool = (
      SELECT COALESCE(SUM(bet_amount), 0)
      FROM bets
      WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler1'
    ),
    wrestler2_pool = (
      SELECT COALESCE(SUM(bet_amount), 0)
      FROM bets
      WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler2'
    ),
    wrestler1_odds = CASE
      WHEN (
        SELECT COALESCE(SUM(bet_amount), 0)
        FROM bets
        WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler2'
      ) = 0 THEN 1.0
      ELSE ROUND(
        (
          SELECT COALESCE(SUM(bet_amount), 0)
          FROM bets
          WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler2'
        )::DECIMAL / GREATEST(
          (
            SELECT COALESCE(SUM(bet_amount), 0)
            FROM bets
            WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler1'
          ), 1
        ) + 1.0, 2
      )
    END,
    wrestler2_odds = CASE
      WHEN (
        SELECT COALESCE(SUM(bet_amount), 0)
        FROM bets
        WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler1'
      ) = 0 THEN 1.0
      ELSE ROUND(
        (
          SELECT COALESCE(SUM(bet_amount), 0)
          FROM bets
          WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler1'
        )::DECIMAL / GREATEST(
          (
            SELECT COALESCE(SUM(bet_amount), 0)
            FROM bets
            WHERE match_id = NEW.match_id AND wrestler_choice = 'wrestler2'
          ), 1
        ) + 1.0, 2
      )
    END
  WHERE id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger
DROP TRIGGER IF EXISTS update_pools_after_bet ON bets;
CREATE TRIGGER update_pools_after_bet
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_match_pools();

SELECT 'UUID error fixed! Database schema updated with TEXT user_id columns and policies cleaned up.' as message;
