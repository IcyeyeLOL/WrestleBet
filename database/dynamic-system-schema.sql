-- Dynamic System Database Schema Updates
-- This will enable real WC integration, dynamic odds, and global sync

-- Add missing columns to matches table for dynamic odds and real pools
ALTER TABLE matches ADD COLUMN IF NOT EXISTS odds_wrestler1 DECIMAL(10,2) DEFAULT 1.0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS odds_wrestler2 DECIMAL(10,2) DEFAULT 1.0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS total_pool DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS winner VARCHAR(255);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS total_payout DECIMAL(10,2);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Add user_devices table for global sync across devices
CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  last_seen TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add wrestlecoin_transactions table for real WC tracking
CREATE TABLE IF NOT EXISTS wrestlecoin_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_type VARCHAR(20) NOT NULL, -- 'credit' or 'debit'
  category VARCHAR(50) NOT NULL, -- 'betting', 'winnings', 'purchase', 'bonus'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID, -- Reference to bet, match, or other entity
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add wrestlecoin_balance column to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS wrestlecoin_balance DECIMAL(10,2) DEFAULT 100.0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_wrestlecoin_transactions_user_id ON wrestlecoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);

-- Enable Row Level Security (RLS) for security
ALTER TABLE wrestlecoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own transactions" ON wrestlecoin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON wrestlecoin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own devices" ON user_devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" ON user_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to calculate odds based on betting pool
CREATE OR REPLACE FUNCTION calculate_match_odds(match_id UUID)
RETURNS TABLE (
  odds_wrestler1 DECIMAL(10,2),
  odds_wrestler2 DECIMAL(10,2),
  total_pool DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH pool_data AS (
    SELECT 
      COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler1' THEN amount ELSE 0 END), 0) as wrestler1_pool,
      COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler2' THEN amount ELSE 0 END), 0) as wrestler2_pool,
      COALESCE(SUM(amount), 0) as total_pool
    FROM bets 
    WHERE match_id = $1 AND status = 'active'
  )
  SELECT 
    CASE 
      WHEN wrestler1_pool > 0 THEN (total_pool / wrestler1_pool)::DECIMAL(10,2)
      ELSE 1.0
    END as odds_wrestler1,
    CASE 
      WHEN wrestler2_pool > 0 THEN (total_pool / wrestler2_pool)::DECIMAL(10,2)
      ELSE 1.0
    END as odds_wrestler2,
    total_pool
  FROM pool_data;
END;
$$ LANGUAGE plpgsql;

-- Function to update match odds automatically
CREATE OR REPLACE FUNCTION update_match_odds()
RETURNS TRIGGER AS $$
BEGIN
  -- Update match odds when bets change
  UPDATE matches 
  SET 
    odds_wrestler1 = odds.odds_wrestler1,
    odds_wrestler2 = odds.odds_wrestler2,
    total_pool = odds.total_pool
  FROM calculate_match_odds(NEW.match_id) as odds
  WHERE matches.id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update odds when bets change
DROP TRIGGER IF EXISTS trigger_update_odds ON bets;
CREATE TRIGGER trigger_update_odds
  AFTER INSERT OR UPDATE OR DELETE ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_match_odds();

-- Insert sample data for testing (remove hardcoded matches)
DELETE FROM matches WHERE wrestler1 = 'David' OR wrestler1 = 'Daviud' OR wrestler2 = 'hasan' OR wrestler2 = 'dd';

-- Insert real dynamic matches
INSERT INTO matches (wrestler1, wrestler2, event_name, weight_class, status, created_at) VALUES
('John Smith', 'Mike Johnson', 'Championship Night', '86kg', 'active', NOW()),
('Sarah Wilson', 'Emma Davis', 'Rising Stars', '72kg', 'active', NOW()),
('Alex Thompson', 'Chris Brown', 'Elite Showdown', '95kg', 'active', NOW())
ON CONFLICT DO NOTHING;






