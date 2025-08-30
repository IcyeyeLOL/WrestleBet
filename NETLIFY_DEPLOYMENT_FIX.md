# Netlify Deployment Fix - Environment Variables Issue

## Problem
The Netlify build is failing with the error:
```
Error: supabaseUrl is required.
```

This occurs because the Supabase environment variables are not properly configured in Netlify.

## Root Cause
The build log shows that Netlify is using incorrect environment variable names:
- `sb_publishable_TKqDR4L6p6aEfGPh1lQpbQ_GFQCdl1_` (should be `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `sb_secret_2V1k_yK4BjWb8nOWySCYpA_3cCjpHyd` (should be `SUPABASE_SERVICE_ROLE_KEY`)

But the critical missing variable is `NEXT_PUBLIC_SUPABASE_URL`.

## Solution

### Option 1: Fix in Netlify Dashboard (Recommended)

1. Go to your Netlify dashboard
2. Navigate to **Site settings** > **Environment variables**
3. **Remove** the incorrectly named variables:
   - `sb_publishable_TKqDR4L6p6aEfGPh1lQpbQ_GFQCdl1_`
   - `sb_secret_2V1k_yK4BjWb8nOWySCYpA_3cCjpHyd`
4. **Add** the correct environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://hpkxmotzidywoilooqpx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg2MzcsImV4cCI6MjA2OTg2NDYzN30.KbbrGQPzXcO3SBRvXk2ySdCzprNiUXCnQZdiQRgCuNc
SUPABASE_SERVICE_ROLE_KEY = 2V1k_yK4BjWb8nOWySCYpA_3cCjpHyd
```

### Option 2: Use netlify.toml Configuration (Already Applied)

The `netlify.toml` file has been updated to include the critical Supabase environment variables directly in the configuration. This should resolve the build issue.

## Complete Environment Variables List

Make sure these variables are set in your Netlify dashboard:

```
# Node.js Version (CRITICAL)
NODE_VERSION = 20

# Build Environment
NODE_ENV = production

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_bG9naWNhbC1ncmFja2xlLTUuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY = [your_clerk_secret_key]

# Supabase Database (CRITICAL FOR BUILD)
NEXT_PUBLIC_SUPABASE_URL = https://hpkxmotzidywoilooqpx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg2MzcsImV4cCI6MjA2OTg2NDYzN30.KbbrGQPzXcO3SBRvXk2ySdCzprNiUXCnQZdiQRgCuNc
SUPABASE_SERVICE_ROLE_KEY = 2V1k_yK4BjWb8nOWySCYpA_3cCjpHyd

# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [your_stripe_publishable_key]
STRIPE_SECRET_KEY = [your_stripe_secret_key]
```

## Verification Steps

1. After updating the environment variables, trigger a new deployment
2. Check the build logs to ensure no Supabase URL errors
3. Verify that the `/api/admin/settings` route builds successfully
4. Test the application functionality after deployment

## Additional Notes

- The `NEXT_PUBLIC_` prefix is required for client-side access to these variables
- The Supabase URL and anon key are safe to expose publicly
- The service role key should be kept secret and only used server-side
- Node.js version 20 is required for compatibility with Supabase

## Troubleshooting

If the build still fails:
1. Clear the Netlify cache and redeploy
2. Check that all environment variables are properly set
3. Verify the Supabase project URL and keys are correct
4. Ensure Node.js version 20 is specified
