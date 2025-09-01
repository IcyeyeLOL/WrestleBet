-- CREATE BETS TABLE AND PERMISSIONS
-- Run this in Supabase SQL Editor

-- Create bets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    wrestler_choice TEXT NOT NULL CHECK (wrestler_choice IN ('wrestler1', 'wrestler2')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    odds DECIMAL(10,2) NOT NULL CHECK (odds >= 1.1),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON public.bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON public.bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);

-- Enable Row Level Security
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access (since we're using anonymous users)
DROP POLICY IF EXISTS "Allow all operations on bets" ON public.bets;
CREATE POLICY "Allow all operations on bets" ON public.bets
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.bets TO anon;
GRANT ALL ON public.bets TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to automatically update match odds when bets change
CREATE OR REPLACE FUNCTION public.update_match_odds()
RETURNS TRIGGER AS $$
DECLARE
    match_record RECORD;
    wrestler1_total DECIMAL := 0;
    wrestler2_total DECIMAL := 0;
    total_pool DECIMAL := 0;
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
    
    total_pool := wrestler1_total + wrestler2_total;
    
    -- Calculate odds (minimum 1.10)
    IF wrestler1_total > 0 THEN
        new_odds1 := GREATEST(1.10, total_pool / wrestler1_total);
    END IF;
    
    IF wrestler2_total > 0 THEN
        new_odds2 := GREATEST(1.10, total_pool / wrestler2_total);
    END IF;
    
    -- Update the match table
    UPDATE public.matches 
    SET 
        total_pool = total_pool,
        odds_wrestler1 = ROUND(new_odds1, 2),
        odds_wrestler2 = ROUND(new_odds2, 2),
        updated_at = NOW()
    WHERE id = match_record.match_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update match odds
DROP TRIGGER IF EXISTS trigger_update_match_odds ON public.bets;
CREATE TRIGGER trigger_update_match_odds
    AFTER INSERT OR UPDATE OR DELETE ON public.bets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_match_odds();

-- Create function for manual odds calculation (used by API)
CREATE OR REPLACE FUNCTION public.calculate_match_odds(match_id UUID)
RETURNS TABLE(
    wrestler1_total DECIMAL,
    wrestler2_total DECIMAL,
    total_pool DECIMAL,
    odds_wrestler1 DECIMAL,
    odds_wrestler2 DECIMAL
) AS $$
DECLARE
    w1_total DECIMAL := 0;
    w2_total DECIMAL := 0;
    t_pool DECIMAL := 0;
    odds1 DECIMAL := 1.10;
    odds2 DECIMAL := 1.10;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler1' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN wrestler_choice = 'wrestler2' THEN amount ELSE 0 END), 0)
    INTO w1_total, w2_total
    FROM public.bets 
    WHERE bets.match_id = calculate_match_odds.match_id 
    AND status = 'pending';
    
    t_pool := w1_total + w2_total;
    
    -- Calculate odds
    IF w1_total > 0 THEN
        odds1 := GREATEST(1.10, t_pool / w1_total);
    END IF;
    
    IF w2_total > 0 THEN
        odds2 := GREATEST(1.10, t_pool / w2_total);
    END IF;
    
    -- Return results
    wrestler1_total := w1_total;
    wrestler2_total := w2_total;
    total_pool := t_pool;
    odds_wrestler1 := ROUND(odds1, 2);
    odds_wrestler2 := ROUND(odds2, 2);
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Test the setup
SELECT 'Bets table and functions created successfully!' as status;
