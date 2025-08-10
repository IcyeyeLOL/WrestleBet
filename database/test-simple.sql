-- SIMPLE VERSION: Run this first to create just the matches table and test

CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler1 VARCHAR(100) NOT NULL,
  wrestler2 VARCHAR(100) NOT NULL,
  event_name VARCHAR(200),
  match_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'upcoming',
  winner VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test insert
INSERT INTO matches (wrestler1, wrestler2, event_name, match_date) VALUES
('John Cena', 'Roman Reigns', 'WWE Championship Match', NOW() + INTERVAL '7 days');
