// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// For client-side usage (in components) - recommended approach
export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Alternative simple client
export const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database type definitions for Supabase
export type { Database };