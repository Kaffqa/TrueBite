import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to prevent blank screen crash during initial setup/demo without .env
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
  // Dummy values just to allow the client to instantiate and UI to render (will fail on actual DB calls)
  supabaseUrl = 'https://dummy.supabase.co';
  supabaseAnonKey = 'dummy-key';
}

/**
 * Typed Supabase client singleton.
 * Uses the Database type for full type-safety on all queries.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
