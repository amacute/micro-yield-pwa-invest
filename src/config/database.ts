import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Database configuration
const databaseConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  pooling: {
    enabled: true,
    maxConnections: 95, // PgBouncer default max is 100, leave some room
    minConnections: 1,
    idleTimeoutMs: 120000 // 2 minutes
  }
};

// Validate configuration
if (!databaseConfig.supabaseUrl || !databaseConfig.supabaseAnonKey) {
  throw new Error('Missing required database configuration. Please check your environment variables.');
}

// Create Supabase client with pooling configuration
export const supabase = createClient<Database>(
  databaseConfig.supabaseUrl,
  databaseConfig.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'micro-yield-pwa-invest'
      }
    }
  }
); 