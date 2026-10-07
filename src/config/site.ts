/**
 * =====================================================================
 * ⛩️ CONFIGURACIÓN CENTRAL DE LA MARCA // ZAIREN LAB
 * =====================================================================
 * Este es el archivo donde configuras los datos de tu marca,
 * número de WhatsApp, políticas de envío y redes sociales dinámicas.
 * 
 * 👉 Los valores aquí definidos tienen prioridad y usan variables .env como respaldo.
 * =====================================================================
 */

export interface SocialNetwork {
  id: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'youtube' | string;
  name: string;
  url: string;
  enabled: boolean;
  icon?: string; // Nombre del icono lucide
}

export type EstadoComercial = 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'ninguno';

export interface SiteConfig {
  name: string;
  slogan: string;
  tagline: string;
  origin: string;
  description: string;
  url: string;
  cloudflareDomain: string;
  seo: {
    defaultImage: string;
    twitterHandle: string;
  };
  whatsapp: {
    number: string; // Formato internacional sin +, ej: 59174522654
    displayNumber: string; // Formato legible para el cliente, ej: +591 74522654
    messageTemplate: string;
  };
  currency: {
    code: string; // BOB, USD, CLP, etc.
    symbol: string; // Bs, $, etc.
  };
  shipping: {
    freeShippingThreshold: number; // Monto mínimo para envío gratis (en Bs)
    expressShippingCost: number; // Costo de envío regular
    deliveryTimeExpress: string; // ej: "24 a 48 hrs"
  };
  socialNetworks: SocialNetwork[];
  catalog: {
    itemsPerPage: number;
    showSoldOutBadge: boolean;
  };
}

export const siteConfig: SiteConfig = {
  // 1. IDENTIDAD DE LA MARCA (BRAND BOOK 2026)
  name: import.meta.env.PUBLIC_BRAND_NAME || 'ZAIREN LAB',
  slogan: 'Evolución constante, identidad propia',
  tagline: 'Menos ruido, más identidad',
  origin: 'Tarija, Bolivia',
  description: 'ZAIREN LAB // Indumentaria experimental streetwear fusionando minimalismo japonés, cortes oversized pesados y siluetas de identidad en reposo.',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://zairenlab.com',
  cloudflareDomain: import.meta.env.PUBLIC_CLOUDFLARE_DOMAIN || 'https://zairen-web.pages.dev',

  // SEO & Open Graph
  seo: {
    defaultImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop',
    twitterHandle: '@zairenlab',
  },

  // 2. WHATSAPP & CHECKOUT (Aquí defines el número donde llegarán los pedidos)
  whatsapp: {
    number: import.meta.env.PUBLIC_WHATSAPP_NUMBER || '59170000000',
    displayNumber: import.meta.env.PUBLIC_WHATSAPP_DISPLAY || '+591 70000000',
    messageTemplate: 'Hola Zairen Lab, deseo confirmar mi pedido:\n\n{items}\n\n*Total a pagar: {moneda} {total}*\n\n¿Tienen disponibilidad para despacho inmediato?',
  },

  // 3. MONEDA
  currency: {
    code: import.meta.env.PUBLIC_CURRENCY_CODE || 'BOB',
    symbol: import.meta.env.PUBLIC_CURRENCY_SYMBOL || 'Bs',
  },

  // 4. POLÍTICAS DE ENVÍO
  shipping: {
    freeShippingThreshold: Number(import.meta.env.PUBLIC_FREE_SHIPPING_THRESHOLD) || 250,
    expressShippingCost: Number(import.meta.env.PUBLIC_EXPRESS_SHIPPING_COST) || 15,
    deliveryTimeExpress: '24 a 48 hrs (La Paz / Cochabamba / Santa Cruz)',
  },

  /**
   * 5. REDES SOCIALES DINÁMICAS
   * 👉 AGREGA O QUITA REDES A VOLUNTAD:
   * - Si solo quieres Instagram: deja url en Instagram y pon enabled: false (o borra) las demás.
   * - Si tienes Instagram y TikTok: coloca las URLs y enabled: true en ambas.
   * - Toda la web (Header, Footer, Drawer) solo mostrará las redes activas con URL no vacía.
   */
  socialNetworks: [
    {
      id: 'instagram',
      name: 'Instagram',
      url: import.meta.env.PUBLIC_INSTAGRAM_URL || 'https://instagram.com/zairenlab',
      enabled: true,
      icon: 'Instagram',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: import.meta.env.PUBLIC_TIKTOK_URL || '',
      enabled: false, // Actívalo a true cuando tengas tu cuenta lista
      icon: 'Video',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: import.meta.env.PUBLIC_FACEBOOK_URL || '',
      enabled: false,
      icon: 'Facebook',
    },
  ],

  // 6. CATÁLOGO
  catalog: {
    itemsPerPage: 12,
    showSoldOutBadge: true,
  },
};

/**
 * Función utilitaria para obtener ÚNICAMENTE las redes sociales que están activas y tienen URL.
 * Así si solo tienes Instagram, la interfaz solo renderiza Instagram de forma limpia.
 */
export function getActiveSocialNetworks(): SocialNetwork[] {
  return siteConfig.socialNetworks.filter(
    (network) => network.enabled && network.url && network.url.trim() !== ''
  );
}

/**
 * Formateador de moneda uniforme para toda la aplicación
 */
export function formatCurrency(amount: number): string {
  return `${siteConfig.currency.symbol} ${amount.toFixed(2)}`;
}
