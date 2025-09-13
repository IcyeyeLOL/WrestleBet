import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hpkxmotzidywoilooqpx.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3htb3R6aWR5d29pbG9vcXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODg2MzcsImV4cCI6MjA2OTg2NDYzN30.KbbrGQPzXcO3SBRvXk2ySdCzprNiUXCnQZdiQRgCuNc'

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required')
  throw new Error('supabaseUrl is required')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  throw new Error('supabaseAnonKey is required')
}

console.log('✅ Supabase configuration loaded:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
})

// Create Supabase client with real credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
