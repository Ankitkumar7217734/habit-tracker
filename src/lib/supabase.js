import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web the reset-password link lands with #access_token=...&type=recovery
    // in the URL hash — Supabase must parse it. On native, URL detection is
    // handled by deep links, not the browser, so it must stay off.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
