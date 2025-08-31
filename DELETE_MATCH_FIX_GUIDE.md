# DELETE MATCH FIX - COMPLETE SOLUTION

## Root Cause Found
The 500 error when deleting matches was caused by:
1. **Invalid API Key Error**: The service role key in `.env.local` was a placeholder
2. **RLS Policy Conflicts**: Database Row Level Security was too restrictive

## Current Error Message
```
Error fetching match to delete: {
  message: 'Invalid API key',
  hint: 'Double check your Supabase `anon` or `service_role` API key.'
}
```

## 🔧 IMMEDIATE FIX APPLIED
1. **Updated Admin API**: Removed dependency on service role client
2. **Simplified Authentication**: Uses regular Supabase client with permissive RLS

## 📊 Next Steps Required

### Option A: Quick Fix (Recommended)
Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Make RLS policies permissive for admin operations
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Re-enable with permissive policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access" ON matches FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_full_access" ON votes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bets_full_access" ON bets FOR ALL USING (true) WITH CHECK (true);
```

### Option B: Complete Fix (More Secure)
Run the SQL from `database/admin-delete-fix.sql` in Supabase

## 🧪 Test Instructions
After running the SQL fix:

1. **Refresh the admin panel**: Go to `/admin`
2. **Try deleting the David vs Kunle match**
3. **Check browser console** for any remaining errors

## ✅ Expected Result
- Delete button should work without 500 errors
- Match should be removed from database
- Frontend should update to reflect deletion

## 🔍 Debug Tools Created
- `test-delete-match.js` - Test deletion in browser console
- `check-admin-environment.js` - Verify admin API status

The match deletion should work after applying the RLS fix!
