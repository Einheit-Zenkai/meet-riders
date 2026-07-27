import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type AnySupabaseClient = SupabaseClient<any, 'public', any>;
type MaybeClient = AnySupabaseClient | null;

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

try {
  supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
} catch {
  // process may not exist in some web environments
}

let cachedClient: MaybeClient = null;

const createSupabaseClient = (): MaybeClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing; falling back to mocked auth.');
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<any>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return cachedClient;
};

export const getSupabaseClient = (): MaybeClient => createSupabaseClient();
