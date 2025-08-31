-- UPDATED DATABASE SCHEMA FOR WRESTLEBET WITH WRESTLECOINS CURRENCY SYSTEM (FIXED VERSION)
-- Run this entire script in Supabase SQL editor

-- STEP 0: Clean up existing constraints that might conflict
DO $$ 
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_votes_user') THEN
        ALTER TABLE votes DROP CONSTRAINT fk_votes_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_votes_match') THEN
        ALTER TABLE votes DROP CONSTRAINT fk_votes_match;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bets_user') THEN
        ALTER TABLE bets DROP CONSTRAINT fk_bets_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_bets_match') THEN
        ALTER TABLE bets DROP CONSTRAINT fk_bets_match;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transactions_user') THEN
        ALTER TABLE wrestlecoin_transactions DROP CONSTRAINT fk_transactions_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_transactions_bet') THEN
        ALTER TABLE wrestlecoin_transactions DROP CONSTRAINT fk_transactions_bet;
    END IF;
END $$;

-- STEP 1: Create Users table (Enhanced)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  wrestlecoin_balance INTEGER DEFAULT 1000, -- Starting balance: 1000 WC
  total_winnings DECIMAL(10, 2) DEFAULT 0.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create Matches table (Enhanced) - MOVED UP to fix foreign key reference
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler1 VARCHAR(100) NOT NULL,
  wrestler2 VARCHAR(100) NOT NULL,
  event_name VARCHAR(200),
  weight_class VARCHAR(20), -- e.g., "86kg", "125kg"
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, live, completed, cancelled
  winner VARCHAR(100), -- wrestler1 or wrestler2
  total_bet_pool INTEGER DEFAULT 0, -- Total WrestleCoins bet on this match
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create WrestleCoin Transactions table
CREATE TABLE IF NOT EXISTS wrestlecoin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
  category VARCHAR(30) NOT NULL, -- 'bet', 'win', 'daily_bonus', 'achievement', 'reset'
  amount INTEGER NOT NULL, -- Amount in WrestleCoins
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_bet_id UUID NULL, -- Reference to bets table (UUID type to match bets.id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint separately
DO $$ 
BEGIN
    -- Only add constraint if both table and column exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wrestlecoin_transactions' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE wrestlecoin_transactions ADD CONSTRAINT fk_transactions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- STEP 4: Create Votes table (Now matches table exists)
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL, -- Made nullable for anonymous voting
  match_id UUID NOT NULL, -- Reference to matches table
  wrestler_choice VARCHAR(100) NOT NULL, -- wrestler1 or wrestler2
  user_ip VARCHAR(45), -- For anonymous voting support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints separately to avoid dependency issues
DO $$ 
BEGIN
    -- Add votes -> users foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'votes' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE votes ADD CONSTRAINT fk_votes_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add votes -> matches foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'votes' AND column_name = 'match_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id') THEN
        ALTER TABLE votes ADD CONSTRAINT fk_votes_match 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
    END IF;
END $$;

-- STEP 5: Create Bets table (Now both users and matches tables exist)
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id UUID NOT NULL,
  wrestler_choice VARCHAR(100) NOT NULL, -- wrestler1 or wrestler2
  amount INTEGER NOT NULL, -- Amount in WrestleCoins
  odds DECIMAL(4, 2) DEFAULT 1.0, -- Odds when bet was placed
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost, cancelled
  potential_payout INTEGER, -- Calculated potential payout
  actual_payout INTEGER, -- Actual payout if won
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints separately
DO $$ 
BEGIN
    -- Add bets -> users foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE bets ADD CONSTRAINT fk_bets_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add bets -> matches foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'match_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id') THEN
        ALTER TABLE bets ADD CONSTRAINT fk_bets_match 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
    END IF;
    
    -- Add transactions -> bets foreign key
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wrestlecoin_transactions' AND column_name = 'related_bet_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'id') THEN
        ALTER TABLE wrestlecoin_transactions ADD CONSTRAINT fk_transactions_bet 
        FOREIGN KEY (related_bet_id) REFERENCES bets(id) ON DELETE SET NULL;
    END IF;
END $$;

-- STEP 6: Create Currency Settings table
CREATE TABLE IF NOT EXISTS currency_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: Insert default currency settings (FIXED - uses ON CONFLICT to handle duplicates)
INSERT INTO currency_settings (setting_name, setting_value, description) VALUES
('starting_balance', '1000', 'Default WrestleCoins balance for new users'),
('daily_bonus_amount', '50', 'Daily login bonus in WrestleCoins'),
('max_bet_amount', '500', 'Maximum bet amount in WrestleCoins'),
('min_bet_amount', '5', 'Minimum bet amount in WrestleCoins'),
('currency_name', 'WrestleCoins', 'Name of the virtual currency'),
('currency_symbol', 'WC', 'Symbol for the virtual currency')
ON CONFLICT (setting_name) DO UPDATE
  SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- STEP 8: Sample matches removed - Use admin panel to create matches
-- Hardcoded matches eliminated for fully dynamic system

-- STEP 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wrestlecoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON wrestlecoin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON wrestlecoin_transactions(category);
CREATE INDEX IF NOT EXISTS idx_votes_match_id ON votes(match_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_ip ON votes(user_ip);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date);

-- STEP 10: Create update triggers for timestamp fields (FIXED - handles existing triggers)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_votes_updated_at ON votes;
CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_currency_settings_updated_at ON currency_settings;
CREATE TRIGGER update_currency_settings_updated_at BEFORE UPDATE ON currency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Create helpful views
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

-- STEP 12: Diagnostic information and validation
DO $$ 
DECLARE
    transactions_related_bet_type text;
    bets_id_type text;
    invalid_refs_count integer;
BEGIN
    -- Check data types
    SELECT data_type INTO transactions_related_bet_type 
    FROM information_schema.columns 
    WHERE table_name = 'wrestlecoin_transactions' AND column_name = 'related_bet_id';
    
    SELECT data_type INTO bets_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'bets' AND column_name = 'id';
    
    RAISE NOTICE 'wrestlecoin_transactions.related_bet_id type: %', transactions_related_bet_type;
    RAISE NOTICE 'bets.id type: %', bets_id_type;
    
    -- Check for invalid references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wrestlecoin_transactions') THEN
        SELECT COUNT(*) INTO invalid_refs_count
        FROM wrestlecoin_transactions 
        WHERE related_bet_id IS NOT NULL 
        AND related_bet_id NOT IN (SELECT id FROM bets WHERE id IS NOT NULL);
        
        RAISE NOTICE 'Invalid bet references found: %', invalid_refs_count;
    END IF;
    
    RAISE NOTICE 'Schema setup completed successfully!';
END $$;
