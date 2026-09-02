import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Database } from '@/types/database';

const targetSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://thldfqdcesaajigjgquv.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobGRmcWRjZXNhYWppZ2pncXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzg5MjQsImV4cCI6MjA5ODc1NDkyNH0.dOeelmoEECCWXwkaVtx008goIjVauspe6Vn6tA6TZ-s';
const proxyUrl = process.env.EXPO_PUBLIC_SUPABASE_PROXY_URL;

if (!targetSupabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env for EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
}

const effectiveUrl = proxyUrl && proxyUrl.trim() !== '' ? proxyUrl : targetSupabaseUrl;

export const supabase = createClient<Database>(effectiveUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});


