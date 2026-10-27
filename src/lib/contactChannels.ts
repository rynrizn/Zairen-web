/**
 * =====================================================================
 * CANALES DE CONTACTO DINÁMICOS // ZAIREN LAB
 * =====================================================================
 * Módulo para gestionar, validar y construir enlaces de canales de contacto
 * configurables (WhatsApp, Instagram, TikTok, Facebook y personalizados).
 */

import { siteConfig } from '../config/site';

export type ChannelType = 'whatsapp' | 'instagram' | 'tiktok' | 'facebook' | 'custom';

export interface ContactChannel {
  id: string;
  name: string;
  type: ChannelType;
  value: string;
  enabled: boolean;
  order: number;
  messageTemplate?: string;
}

export const DEFAULT_CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Directo',
    type: 'whatsapp',
    value: siteConfig.whatsapp.number || '59170000000',
    enabled: true,
    order: 0,
    messageTemplate: 'Hola Zairen Lab, me interesa consultar sobre *{prenda}* ({moneda} {precio}):\n{url}',
  },
  {
    id: 'instagram',
    name: 'Instagram Oficial',
    type: 'instagram',
    value: 'https://instagram.com/zairenlab',
    enabled: true,
    order: 1,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'tiktok',
    value: 'https://tiktok.com/@zairenlab',
    enabled: true,
    order: 2,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'facebook',
    value: '',
    enabled: false,
    order: 3,
  },
];

/**
 * Validador de formato de número de WhatsApp / teléfono internacional
 * Acepta entre 8 y 16 dígitos, con o sin '+' al inicio.
 */
export function validatePhone(phone: string): { valid: boolean; formatted: string; error?: string } {
  const clean = phone.replace(/[^\d+]/g, '');
  const digitsOnly = clean.replace(/\+/g, '');
  if (!digitsOnly) {
    return { valid: false, formatted: '', error: 'El número no puede estar vacío' };
  }
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return { valid: false, formatted: digitsOnly, error: 'Debe contener entre 8 y 15 dígitos' };
  }
  return { valid: true, formatted: digitsOnly };
}

/**
 * Validador de usuario o URL de redes sociales
 */
export function validateSocialHandleOrUrl(
  type: ChannelType,
  input: string
): { valid: boolean; url: string; error?: string } {
  const clean = input.trim();
  if (!clean) {
    return { valid: false, url: '', error: 'El valor no puede estar vacío' };
  }

  if (type === 'instagram') {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return { valid: true, url: clean };
    }
    const handle = clean.replace(/^@/, '');
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
      return { valid: false, url: '', error: 'Usuario de Instagram inválido' };
    }
    return { valid: true, url: `https://instagram.com/${handle}` };
  }

  if (type === 'tiktok') {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return { valid: true, url: clean };
    }
    const handle = clean.replace(/^@/, '');
    if (!/^[a-zA-Z0-9._]{1,24}$/.test(handle)) {
      return { valid: false, url: '', error: 'Usuario de TikTok inválido' };
    }
    return { valid: true, url: `https://tiktok.com/@${handle}` };
  }

  if (type === 'facebook') {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return { valid: true, url: clean };
    }
    const handle = clean.replace(/^\//, '');
    return { valid: true, url: `https://facebook.com/${handle}` };
  }

  // URL genérica
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return { valid: true, url: clean };
  }

  return { valid: true, url: `https://${clean}` };
}

/**
 * Retorna la lista de canales activos ordenados por prioridad
 */
export function getActiveChannels(channels: ContactChannel[]): ContactChannel[] {
  if (!Array.isArray(channels)) return [];
  return channels
    .filter((c) => c.enabled && Boolean(c.value && c.value.trim()))
    .sort((a, b) => a.order - b.order);
}

/**
 * Retorna únicamente el primer canal activo según prioridad (para la tarjeta del catálogo)
 */
export function getFirstActiveChannel(channels: ContactChannel[]): ContactChannel | null {
  const active = getActiveChannels(channels);
  return active.length > 0 ? active[0] : null;
}

/**
 * Construye el enlace accionable para el cliente
 */
export function buildChannelActionUrl(
  channel: ContactChannel,
  productInfo?: {
    nombre: string;
    precio: number;
    moneda?: string;
    url?: string;
  }
): string {
  if (!channel || !channel.value) return '#';

  if (channel.type === 'whatsapp') {
    const { formatted } = validatePhone(channel.value);
    const phone = formatted || channel.value.replace(/\D/g, '');
    let msg = channel.messageTemplate || 'Hola Zairen Lab, me interesa consultar sobre sus prendas.';

    if (productInfo) {
      msg = msg
        .replace('{prenda}', productInfo.nombre)
        .replace('{precio}', productInfo.precio.toFixed(2))
        .replace('{moneda}', productInfo.moneda || 'Bs')
        .replace('{url}', productInfo.url || '');
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg.trim())}`;
  }

  const { url } = validateSocialHandleOrUrl(channel.type, channel.value);
  return url || channel.value;
}
