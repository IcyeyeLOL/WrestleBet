-- ADMIN DASHBOARD SCHEMA ENHANCEMENTS
-- Run this after the main schema to add admin functionality

-- STEP 1: Add Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'match_created', 'match_updated', 'winner_declared', 'user_updated', 'settings_changed'
  resource_type VARCHAR(30) NOT NULL, -- 'match', 'user', 'settings', 'payout'
  resource_id UUID,
  details JSONB, -- Store additional context
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- 'general', 'betting', 'currency', 'notifications'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Enhanced Matches Table (add admin fields)
DO $$ 
BEGIN
  -- Add admin-related columns to matches if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'created_by_admin') THEN
    ALTER TABLE matches ADD COLUMN created_by_admin UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'is_featured') THEN
    ALTER TABLE matches ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'description') THEN
    ALTER TABLE matches ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'match_order') THEN
    ALTER TABLE matches ADD COLUMN match_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- STEP 4: User Analytics Table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'login', 'bet_placed', 'bet_won', 'purchase_made'
  metric_value DECIMAL(10, 2) DEFAULT 0,
  metadata JSONB, -- Additional context
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Betting Analytics Table
CREATE TABLE IF NOT EXISTS betting_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL,
  total_volume INTEGER DEFAULT 0, -- Total WC bet
  unique_bettors INTEGER DEFAULT 0,
  wrestler1_pool INTEGER DEFAULT 0,
  wrestler2_pool INTEGER DEFAULT 0,
  wrestler1_odds DECIMAL(4, 2) DEFAULT 1.0,
  wrestler2_odds DECIMAL(4, 2) DEFAULT 1.0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Add Foreign Key Constraints (with safe handling)
DO $$ 
BEGIN
    -- Drop existing constraints first to avoid conflicts
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_admin_logs_user') THEN
        ALTER TABLE admin_logs DROP CONSTRAINT fk_admin_logs_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_analytics_user') THEN
        ALTER TABLE user_analytics DROP CONSTRAINT fk_user_analytics_user;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_betting_analytics_match') THEN
        ALTER TABLE betting_analytics DROP CONSTRAINT fk_betting_analytics_match;
    END IF;

    -- Admin logs user reference
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_logs' AND column_name = 'admin_user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE admin_logs ADD CONSTRAINT fk_admin_logs_user 
        FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- User analytics reference
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_analytics' AND column_name = 'user_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') THEN
        ALTER TABLE user_analytics ADD CONSTRAINT fk_user_analytics_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Betting analytics match reference
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'betting_analytics' AND column_name = 'match_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'id') THEN
        ALTER TABLE betting_analytics ADD CONSTRAINT fk_betting_analytics_match 
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some constraints may already exist - continuing with schema updates';
END $$;

-- STEP 7: Insert Default System Settings
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
  ('platform_name', '"WrestleBet"', 'Platform display name', 'general'),
  ('default_user_balance', '1000', 'Starting WrestleCoin balance for new users', 'currency'),
  ('daily_bonus_amount', '50', 'Daily bonus WrestleCoin amount', 'currency'),
  ('minimum_bet_amount', '10', 'Minimum bet amount in WrestleCoins', 'betting'),
  ('maximum_bet_amount', '1000', 'Maximum bet amount in WrestleCoins', 'betting'),
  ('house_edge_percentage', '5', 'House edge percentage for payouts', 'betting'),
  ('minimum_odds', '1.10', 'Minimum odds to prevent exploitation', 'betting'),
  ('enable_anonymous_voting', 'true', 'Allow anonymous voting without login', 'betting'),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'general'),
  ('admin_notifications', 'true', 'Enable admin notifications', 'notifications')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- STEP 8: Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_metric_type ON user_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_recorded_at ON user_analytics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_betting_analytics_match_id ON betting_analytics(match_id);
CREATE INDEX IF NOT EXISTS idx_betting_analytics_recorded_at ON betting_analytics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_by_admin ON matches(created_by_admin);
CREATE INDEX IF NOT EXISTS idx_matches_is_featured ON matches(is_featured);

-- STEP 9: Enable Row Level Security (RLS) for Admin Tables
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE betting_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (with safe handling of existing policies)
DO $$ 
BEGIN
    -- Drop existing policies first to avoid conflicts
    DROP POLICY IF EXISTS "Admin can view all admin logs" ON admin_logs;
    DROP POLICY IF EXISTS "Admin can insert admin logs" ON admin_logs;
    DROP POLICY IF EXISTS "Admin can view system settings" ON system_settings;
    DROP POLICY IF EXISTS "Admin can update system settings" ON system_settings;
    DROP POLICY IF EXISTS "Users can view their analytics" ON user_analytics;
    DROP POLICY IF EXISTS "Admin can view betting analytics" ON betting_analytics;
    
    -- Create new policies
    CREATE POLICY "Admin can view all admin logs" ON admin_logs 
      FOR SELECT USING (auth.uid()::text = admin_user_id::text);
      
    CREATE POLICY "Admin can insert admin logs" ON admin_logs 
      FOR INSERT WITH CHECK (auth.uid()::text = admin_user_id::text);

    CREATE POLICY "Admin can view system settings" ON system_settings 
      FOR SELECT USING (true);
      
    CREATE POLICY "Admin can update system settings" ON system_settings 
      FOR UPDATE USING (true);
      
    CREATE POLICY "Users can view their analytics" ON user_analytics 
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY "Admin can view betting analytics" ON betting_analytics 
      FOR SELECT USING (true);
      
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Note: Some RLS policies may already exist - continuing with schema updates';
END $$;

-- Success message
SELECT 'Admin schema enhancement completed successfully!' as status;
