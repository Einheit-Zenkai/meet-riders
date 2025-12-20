import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { getEnvVar } from './env';

type MaybeClient = ReturnType<typeof createClient> | null;

const supabaseUrl = getEnvVar('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY');

let cachedClient: MaybeClient = null;

const createSupabaseClient = (): MaybeClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing; falling back to mocked auth.');
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
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
