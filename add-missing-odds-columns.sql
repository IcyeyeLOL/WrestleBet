-- ADD MISSING ODDS COLUMNS TO MATCHES TABLE
-- This will add the missing columns that are causing the betting to fail

-- Add the missing odds columns to the matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS wrestler1_odds DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS wrestler2_odds DECIMAL(5,2) DEFAULT 1.0;

-- Add the missing pool columns if they don't exist
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS wrestler1_pool INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrestler2_pool INTEGER DEFAULT 0;

-- Update existing matches to have default odds
UPDATE matches 
SET wrestler1_odds = 1.0, wrestler2_odds = 1.0 
WHERE wrestler1_odds IS NULL OR wrestler2_odds IS NULL;

-- Show the updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;

SELECT 'Odds columns added successfully to matches table!' as message;
