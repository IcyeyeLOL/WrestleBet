-- FIX USER_ID TYPE IN BETS TABLE
-- Run this in Supabase SQL Editor to fix the user_id type issue

-- Check current bets table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bets' AND table_schema = 'public';

-- If user_id is UUID type, we need to change it to TEXT
-- This will allow both UUIDs and simple strings as user IDs

-- First, drop the existing table if it exists (this will remove any test data)
DROP TABLE IF EXISTS public.bets CASCADE;

-- Create bets table with TEXT user_id (not UUID)
CREATE TABLE public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,  -- Changed from UUID to TEXT to allow string IDs
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    wrestler_choice TEXT NOT NULL CHECK (wrestler_choice IN ('wrestler1', 'wrestler2')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    odds DECIMAL(10,2) NOT NULL CHECK (odds >= 1.1),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bets_match_id ON public.bets(match_id);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_status ON public.bets(status);

-- Enable Row Level Security
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access
CREATE POLICY "Allow all operations on bets" ON public.bets
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.bets TO anon;
GRANT ALL ON public.bets TO authenticated;

-- Ensure matches table has the required columns for betting
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS total_pool DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrestler1_pool DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrestler2_pool DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS odds_wrestler1 DECIMAL(10,2) DEFAULT 1.10,
ADD COLUMN IF NOT EXISTS odds_wrestler2 DECIMAL(10,2) DEFAULT 1.10;

-- Recreate the trigger function (in case it was dropped)
CREATE OR REPLACE FUNCTION public.update_match_odds()
RETURNS TRIGGER AS $$
DECLARE
    match_record RECORD;
    wrestler1_total DECIMAL := 0;
    wrestler2_total DECIMAL := 0;
    new_total_pool DECIMAL := 0;  -- Renamed to avoid ambiguity
    new_odds1 DECIMAL := 1.10;
    new_odds2 DECIMAL := 1.10;
BEGIN
    -- Get the match_id from the inserted/updated/deleted bet
    IF TG_OP = 'DELETE' THEN
        match_record := OLD;
    ELSE
        match_record := NEW;
    END IF;
    
    -- Calculate totals for each wrestler
    SELECT 
        COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler1' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler2' THEN amount ELSE 0 END), 0)
    INTO wrestler1_total, wrestler2_total
    FROM public.bets 
    WHERE match_id = match_record.match_id 
    AND status = 'pending';
    
    new_total_pool := wrestler1_total + wrestler2_total;
    
    -- Calculate odds (minimum 1.10)
    IF wrestler1_total > 0 THEN
        new_odds1 := GREATEST(1.10, new_total_pool / wrestler1_total);
    END IF;
    
    IF wrestler2_total > 0 THEN
        new_odds2 := GREATEST(1.10, new_total_pool / wrestler2_total);
    END IF;
    
    -- Update the match table with new calculations
    UPDATE public.matches 
    SET 
        total_pool = new_total_pool,
        wrestler1_pool = wrestler1_total,
        wrestler2_pool = wrestler2_total,
        odds_wrestler1 = ROUND(new_odds1, 2),
        odds_wrestler2 = ROUND(new_odds2, 2),
        updated_at = NOW()
    WHERE id = match_record.match_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update match odds
CREATE TRIGGER trigger_update_match_odds
    AFTER INSERT OR UPDATE OR DELETE ON public.bets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_match_odds();

-- Test query
SELECT 'Bets table recreated with TEXT user_id successfully!' as status;
