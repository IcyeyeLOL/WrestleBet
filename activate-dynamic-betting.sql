-- ACTIVATE DYNAMIC BETTING SYSTEM - ADD MISSING COLUMNS
-- Run this in your Supabase SQL editor to activate full functionality

-- Add all missing dynamic betting columns
DO $$ 
BEGIN
    -- Add odds columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'odds_wrestler1') THEN
        ALTER TABLE matches ADD COLUMN odds_wrestler1 DECIMAL(10,2) DEFAULT 1.0;
        RAISE NOTICE 'Added odds_wrestler1 column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'odds_wrestler2') THEN
        ALTER TABLE matches ADD COLUMN odds_wrestler2 DECIMAL(10,2) DEFAULT 1.0;
        RAISE NOTICE 'Added odds_wrestler2 column';
    END IF;
    
    -- Add pool columns if missing  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'wrestler1_pool') THEN
        ALTER TABLE matches ADD COLUMN wrestler1_pool DECIMAL(10,2) DEFAULT 0.0;
        RAISE NOTICE 'Added wrestler1_pool column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'wrestler2_pool') THEN
        ALTER TABLE matches ADD COLUMN wrestler2_pool DECIMAL(10,2) DEFAULT 0.0;
        RAISE NOTICE 'Added wrestler2_pool column';
    END IF;
    
    -- Add percentage columns if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'wrestler1_percentage') THEN
        ALTER TABLE matches ADD COLUMN wrestler1_percentage INTEGER DEFAULT 50;
        RAISE NOTICE 'Added wrestler1_percentage column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'wrestler2_percentage') THEN
        ALTER TABLE matches ADD COLUMN wrestler2_percentage INTEGER DEFAULT 50;
        RAISE NOTICE 'Added wrestler2_percentage column';
    END IF;
    
    RAISE NOTICE 'All dynamic betting columns added successfully!';
    RAISE NOTICE 'Your betting bars and odds should now update dynamically!';
END $$;

-- Show final table structure to verify
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;
