-- MIGRATION SCRIPT: Add WrestleCoins Currency System to Existing Database
-- Run this if you already have the basic schema and want to add currency features

-- Step 1: Add currency columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wrestlecoin_balance INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS total_winnings DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Create WrestleCoin Transactions table
CREATE TABLE IF NOT EXISTS wrestlecoin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
  category VARCHAR(30) NOT NULL, -- 'bet', 'win', 'daily_bonus', 'achievement', 'reset'
  amount INTEGER NOT NULL, -- Amount in WrestleCoins
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  related_bet_id UUID NULL, -- Reference to bets table if applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Update existing matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS weight_class VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_bet_pool INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Update existing bets table for WrestleCoins
ALTER TABLE bets 
DROP COLUMN IF EXISTS amount CASCADE,
DROP COLUMN IF EXISTS potential_payout CASCADE,
ADD COLUMN amount INTEGER NOT NULL DEFAULT 0, -- Amount in WrestleCoins
ADD COLUMN potential_payout INTEGER NOT NULL DEFAULT 0, -- Potential WrestleCoins payout
ADD COLUMN IF NOT EXISTS actual_payout INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS settled_at TIMESTAMP WITH TIME ZONE NULL;

-- Step 5: Add user_ip column to votes table for anonymous voting
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS user_ip VARCHAR(45),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 6: Create Currency Settings table
CREATE TABLE IF NOT EXISTS currency_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Insert default currency settings
INSERT INTO currency_settings (setting_name, setting_value, description) VALUES
('starting_balance', '1000', 'Default WrestleCoins balance for new users'),
('daily_bonus_amount', '50', 'Daily login bonus in WrestleCoins'),
('max_bet_amount', '500', 'Maximum bet amount in WrestleCoins'),
('min_bet_amount', '5', 'Minimum bet amount in WrestleCoins'),
('currency_name', 'WrestleCoins', 'Name of the virtual currency'),
('currency_symbol', 'WC', 'Symbol for the virtual currency')
ON CONFLICT (setting_name) DO NOTHING;

-- Step 8: Create new indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON wrestlecoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON wrestlecoin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON wrestlecoin_transactions(category);
CREATE INDEX IF NOT EXISTS idx_votes_user_ip ON votes(user_ip);

-- Step 9: Update existing users to have starting balance
UPDATE users 
SET wrestlecoin_balance = 1000 
WHERE wrestlecoin_balance IS NULL;

-- Step 10: Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
DROP TRIGGER IF EXISTS update_votes_updated_at ON votes;

-- Create new triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currency_settings_updated_at BEFORE UPDATE ON currency_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Create user stats view
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
            ROUND((COUNT(CASE WHEN b.status = 'won' THEN 1 END)::float / COUNT(b.id)::float) * 100, 2)
        ELSE 0 
    END as win_percentage
FROM users u
LEFT JOIN bets b ON u.id = b.user_id
GROUP BY u.id, u.username, u.wrestlecoin_balance, u.total_winnings, u.total_spent;

-- Step 12: Verify the migration
SELECT 'Migration completed successfully!' as status;
