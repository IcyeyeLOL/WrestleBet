-- CLEAN WRESTLEBET SCHEMA WITH CONSISTENT UUID TYPES
-- This version ensures all primary keys use UUID consistently

-- STEP 0: Clean slate (OPTIONAL - only if you want to start completely fresh)
-- DROP TABLE IF EXISTS bets CASCADE;
-- DROP TABLE IF EXISTS votes CASCADE; 
-- DROP TABLE IF EXISTS wrestlecoin_transactions CASCADE;
-- DROP TABLE IF EXISTS matches CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS currency_settings CASCADE;
-- DROP VIEW IF EXISTS user_stats CASCADE;

-- STEP 1: Create Users table with UUID
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  wrestlecoin_balance INTEGER DEFAULT 1000,
  total_winnings DECIMAL(10, 2) DEFAULT 0.00,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create Matches table with UUID
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler1 VARCHAR(100) NOT NULL,
  wrestler2 VARCHAR(100) NOT NULL,
  event_name VARCHAR(200),
  weight_class VARCHAR(20),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'upcoming',
  winner VARCHAR(100),
  total_bet_pool INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Bets table with UUID
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL,
  odds DECIMAL(5, 2) NOT NULL,
  potential_payout INTEGER NOT NULL,
  actual_payout INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  settled_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create Transactions table with proper UUID foreign key
CREATE TABLE IF NOT EXISTS wrestlecoin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL,
  category VARCHAR(30) NOT NULL,
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create Votes table with UUID
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice VARCHAR(100) NOT NULL,
  user_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- STEP 6: Create Currency Settings table
CREATE TABLE IF NOT EXISTS currency_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 7: Insert default settings
INSERT INTO currency_settings (setting_name, setting_value, description) VALUES
('starting_balance', '1000', 'Default WrestleCoins balance for new users'),
('daily_bonus_amount', '50', 'Daily login bonus in WrestleCoins'),
('max_bet_amount', '500', 'Maximum bet amount in WrestleCoins'),
('min_bet_amount', '5', 'Minimum bet amount in WrestleCoins'),
('currency_name', 'WrestleCoins', 'Name of the virtual currency'),
('currency_symbol', 'WC', 'Symbol for the virtual currency')
ON CONFLICT (setting_name) DO NOTHING;

-- STEP 8: Insert sample matches
INSERT INTO matches (wrestler1, wrestler2, event_name, weight_class, match_date) VALUES
('David Taylor', 'Hassan Yazdani', 'World Wrestling Championships 2025', '86kg', NOW() + INTERVAL '7 days'),
('Kyle Dake', 'Bajrang Punia', 'European Championships', '65kg', NOW() + INTERVAL '14 days'),
('Gable Steveson', 'Geno Petriashvili', 'Pan American Championships', '125kg', NOW() + INTERVAL '21 days'),
('Frank Chamizo', 'Yuki Takahashi', 'Asian Championships', '74kg', NOW() + INTERVAL '28 days')
ON CONFLICT DO NOTHING;

-- STEP 9: Create indexes
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

-- STEP 10: Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
DROP TRIGGER IF EXISTS update_votes_updated_at ON votes;
DROP TRIGGER IF EXISTS update_currency_settings_updated_at ON currency_settings;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currency_settings_updated_at BEFORE UPDATE ON currency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 11: Create user stats view
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
            CAST((COUNT(CASE WHEN b.status = 'won' THEN 1 END)::float / COUNT(b.id)::float) * 100 AS DECIMAL(5,2))
        ELSE 0 
    END as win_percentage
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id, u.username, u.wrestlecoin_balance, u.total_winnings, u.total_spent;

-- STEP 12: Test query to verify everything works
SELECT 'Schema created successfully! All tables use UUID consistently.' as status;
