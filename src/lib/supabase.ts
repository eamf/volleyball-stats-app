// src/lib/supabase.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a singleton Supabase client
let supabaseInstance: any = null;

export function createClient() {
  // If we already have an instance, return it
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    throw new Error('Missing Supabase environment variables');
  }

  // Create and store the instance
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey);
  
  // Log successful creation
  console.log('Supabase client created successfully');
  
  return supabaseInstance;
}

// Database type definitions for Supabase
// export type { Database }; // Commented out until types are generated
