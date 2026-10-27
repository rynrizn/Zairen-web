import { supabase } from './supabase';
import { siteConfig, type SocialNetwork } from '../config/site';
import type { ContactChannel } from './contactChannels';

export interface AppConfig {
  id: number;
  marca: string;
  slogan: string;
  logo_url: string;
  moneda_codigo: string;
  moneda_simbolo: string;
  whatsapp_numero: string;
  whatsapp_display: string;
  whatsapp_mensaje_template: string;
  canales_ordenados?: ContactChannel[];
  canales_contacto?: Record<string, any>;
  redes_sociales: Array<{
    id: string;
    nombre: string;
    url: string;
    activo: boolean;
  }>;
  politicas_envio: {
    envio_gratis_minimo: number;
    costo_envio_express: number;
    envio_gratis_habilitado?: boolean;
    tiempo_entrega?: string;
  };
  apariencia: {
    color_acento?: string;
    blur_intensidad?: string;
    saludo_personalizado?: string;
    tasa_cambio?: number;
    moneda_activa?: 'BOB' | 'USD';
  };
}

let cachedConfig: AppConfig | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30000; // 30 segundos en memoria

export async function fetchStoreConfig(): Promise<AppConfig | null> {
  const now = Date.now();
  if (cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    cachedConfig = data as unknown as AppConfig;
    lastFetchTime = now;
    return cachedConfig;
  } catch (err) {
    console.warn('Error al obtener configuracion desde Supabase:', err);
    return null;
  }
}

export function clearStoreConfigCache() {
  cachedConfig = null;
  lastFetchTime = 0;
}
