-- Create the database tables for the wrestling betting app
-- Run each section separately in Supabase SQL editor

-- STEP 1: Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Create Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler1 VARCHAR(100) NOT NULL,
  wrestler2 VARCHAR(100) NOT NULL,
  event_name VARCHAR(200),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, live, completed
  winner VARCHAR(100), -- wrestler1 or wrestler2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice VARCHAR(100) NOT NULL, -- wrestler1 or wrestler2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id) -- One vote per user per match
);

-- STEP 4: Create Bets table
CREATE TABLE IF NOT EXISTS bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_choice VARCHAR(100) NOT NULL, -- wrestler1 or wrestler2
  amount DECIMAL(10, 2) NOT NULL,
  odds DECIMAL(5, 2) NOT NULL, -- Odds at time of bet
  potential_payout DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, won, lost
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Insert sample data (run this AFTER creating all tables)
INSERT INTO matches (wrestler1, wrestler2, event_name, match_date) VALUES
('John Cena', 'Roman Reigns', 'WWE Championship Match', NOW() + INTERVAL '7 days'),
('CM Punk', 'Drew McIntyre', 'Special Event', NOW() + INTERVAL '14 days'),
('Cody Rhodes', 'Seth Rollins', 'Main Event', NOW() + INTERVAL '21 days');

-- STEP 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_match_id ON votes(match_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- STEP 7: Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create RLS Policies
-- Allow all users to read matches
CREATE POLICY "Allow read access to matches" ON matches FOR SELECT USING (true);

-- Allow users to read all votes (for poll display)
CREATE POLICY "Allow read access to votes" ON votes FOR SELECT USING (true);

-- Allow users to insert their own votes
CREATE POLICY "Allow insert own votes" ON votes FOR INSERT WITH CHECK (true);

-- Allow users to update their own votes
CREATE POLICY "Allow update own votes" ON votes FOR UPDATE USING (true);

-- Allow users to read all bets (for odds calculation)
CREATE POLICY "Allow read access to bets" ON bets FOR SELECT USING (true);

-- Allow users to insert their own bets
CREATE POLICY "Allow insert own bets" ON bets FOR INSERT WITH CHECK (true);

-- Allow users to read their own user data
CREATE POLICY "Allow users to read own data" ON users FOR SELECT USING (true);

-- Allow users to insert their own user data
CREATE POLICY "Allow users to insert own data" ON users FOR INSERT WITH CHECK (true);
