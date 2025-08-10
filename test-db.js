// Test script to check Supabase connection
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection with new schema
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Database error:', error)
      return
    }
    
    console.log('✅ Database connection successful!')
    console.log('Sample match data:', data)
    
    // Test currency settings
    const { data: settings, error: settingsError } = await supabase
      .from('currency_settings')
      .select('*')
      .limit(3)
    
    if (!settingsError) {
      console.log('✅ Currency settings loaded:', settings)
    }
    
  } catch (err) {
    console.error('Connection error:', err)
  }
}

testConnection()
