import { createClient } from '@supabase/supabase-js';

// Polyfill seguro de WebSocket para entornos de compilación SSR / prerendering (Node.js < 22 en Cloudflare Pages)
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
  class PrerenderWebSocket {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    readyState = 3;
    bufferedAmount = 0;
    extensions = '';
    protocol = '';
    binaryType = 'blob';
    url = '';
    onopen = null;
    onclose = null;
    onerror = null;
    onmessage = null;
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return false; }
    send() {}
    close() {}
  }
  (globalThis as any).WebSocket = PrerenderWebSocket;
}

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

/**
 * Cliente de Supabase específico para servidor (SSR / Middleware / Endpoints)
 * Sin almacenamiento local ni auto-refresco para evitar deadlocks en Node.js y Cloudflare Workers
 */
export function getServerSupabase(accessToken?: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

