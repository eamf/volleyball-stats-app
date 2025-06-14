#!/usr/bin/env node

// 🔍 Supabase Connection Verification Script
// Run this script to verify your Supabase connection locally

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifySupabaseConnection() {
  console.log('🏐 Volleyball Stats - Supabase Connection Verification');
  console.log('=====================================================\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ SET' : '❌ NOT SET'}`);
  
  if (supabaseUrl) {
    console.log(`   URL: ${supabaseUrl}`);
  }
  if (supabaseKey) {
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  }
  console.log('');

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!');
    console.log('');
    console.log('To fix this:');
    console.log('1. Create/update .env.local file with:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.log('2. Get these values from Supabase Dashboard → Settings → API');
    return;
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  console.log('🔗 Testing Supabase Connection:');
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      
      if (error.message.includes('relation "clubs" does not exist')) {
        console.log('   💡 Tables don\'t exist - run the database schema script');
      } else if (error.message.includes('Invalid API key')) {
        console.log('   💡 Check your API key in Supabase Dashboard → Settings → API');
      } else if (error.message.includes('permission denied')) {
        console.log('   💡 Check RLS policies or use service_role key for admin operations');
      }
    } else {
      console.log('   ✅ Connection successful!');
    }
  } catch (err) {
    console.log(`   ❌ Connection error: ${err.message}`);
  }
  console.log('');

  // Test authentication
  console.log('🔐 Testing Authentication:');
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log(`   ❌ Auth error: ${authError.message}`);
    } else {
      console.log(`   ✅ Auth working - User: ${authData.user ? 'Logged in' : 'Not logged in'}`);
    }
  } catch (err) {
    console.log(`   ❌ Auth error: ${err.message}`);
  }
  console.log('');

  // Test table access
  console.log('📊 Testing Table Access:');
  const tables = ['clubs', 'teams', 'players', 'championships', 'games', 'play_types'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: Accessible (${data.length} records)`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
  console.log('');

  // Test specific schema
  console.log('🔧 Testing Schema (is_active column):');
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('is_active')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ is_active column missing: ${error.message}`);
      console.log('   💡 Run the database schema fix script');
    } else {
      console.log('   ✅ is_active column exists');
    }
  } catch (err) {
    console.log(`   ❌ Schema error: ${err.message}`);
  }
  console.log('');

  // Summary
  console.log('📋 Summary:');
  console.log('If you see ❌ errors above:');
  console.log('1. Missing env vars → Add to .env.local and Vercel');
  console.log('2. Connection failed → Check Supabase URL and API key');
  console.log('3. Tables missing → Run complete_database_schema.sql');
  console.log('4. Permission denied → Check RLS policies');
  console.log('5. is_active missing → Run database_schema_fix.sql');
  console.log('');
  console.log('For Vercel deployment:');
  console.log('1. Add environment variables in Vercel Dashboard');
  console.log('2. Redeploy after adding variables');
  console.log('3. Test at: /debug page in your deployed app');
}

// Run verification
verifySupabaseConnection().catch(console.error);
