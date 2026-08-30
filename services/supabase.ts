import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '@/types/database';

const targetSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://thldfqdcesaajigjgquv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const proxyUrl = process.env.EXPO_PUBLIC_SUPABASE_PROXY_URL;

if (!targetSupabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

const effectiveUrl = proxyUrl ? proxyUrl : targetSupabaseUrl;

const customFetch: typeof fetch = (input, init) => {
  if (proxyUrl) {
    let urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;
    if (urlStr.includes(targetSupabaseUrl)) {
      urlStr = urlStr.replace(targetSupabaseUrl, proxyUrl);
    }
    return fetch(urlStr, init);
  }
  return fetch(input, init);
};

export const supabase = createClient<Database>(effectiveUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});
