import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('tu-proyecto') &&
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('dummy');

/**
 * Cliente público de Supabase para consultas client-side y SSR con RLS
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Cliente con Service Role Key (Solo para uso en endpoints de servidor / admin privilegiado)
 */
export function getServiceSupabase() {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY no definida, usando cliente estándar.');
    return supabase;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
