import { siteConfig } from '../config/site';
import type { CartItem } from '../stores/cartStore';
import { getCartSubtotal } from '../stores/cartStore';

/**
 * Genera el enlace directo a WhatsApp para la consulta individual de una prenda
 * Tono sobrio, estético y sin emojis de acuerdo al manual de marca de Zairen Lab.
 * Formato unificado para tarjeta del catálogo y ficha de detalle de producto.
 */
export function generateWhatsAppProductUrl(params: {
  nombre: string;
  talla?: string;
  url: string;
}): string {
  const { nombre, talla, url } = params;
  let message = `Hola Zairen Lab, me interesa consultar sobre *${nombre}*`;
  if (talla && talla.trim()) {
    message += ` (Talla: *${talla.trim()}*)`;
  }
  message += `.\nEnlace: ${url}\n¿Está disponible?`;

  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace directo a WhatsApp con el mensaje estructurado de consulta de disponibilidad.
 * Muestra el nombre de la prenda en lugar del SKU, talla y cantidad, sin enlaces individuales.
 * Tono sobrio, estético y sin emojis de acuerdo al manual de marca de Zairen Lab.
 */
export function generateWhatsAppInquiryUrl(
  items: CartItem[],
  clientNotes?: string,
  requiresDelivery: boolean = false
): string {
  if (items.length === 0) return '';

  const subtotal = getCartSubtotal(items);

  // Extraer número de consulta para trazabilidad en panel administrativo
  const orderMatch = clientNotes?.match(/\[(?:Consulta|Orden)\s+(#[A-Z0-9_-]+)\]/i);
  const orderTag = orderMatch ? ` // ${orderMatch[1]}` : '';
  const cleanNotes = clientNotes
    ? clientNotes
        .replace(/\[(?:Consulta|Orden)\s+#[A-Z0-9_-]+\]/gi, '')
        .trim()
        .replace(/^•\s*|\s*•$/g, '')
        .trim()
    : '';

  const itemsList = items
    .map(
      (item) =>
        `• *${item.nombre}* (Talla: *${item.talla}*) x ${item.cantidad} — Bs ${(item.precio * item.cantidad).toFixed(2)}`
    )
    .join('\n');

  let message = `*CONSULTA DE DISPONIBILIDAD${orderTag} // ${siteConfig.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `¡Hola Zairen Lab! Quiero consultar la disponibilidad de las siguientes prendas:\n\n`;
  message += `${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Total estimado:* Bs ${subtotal.toFixed(2)}\n`;

  if (requiresDelivery) {
    message += `*Entrega:* A coordinar envío a domicilio\n`;
  } else {
    message += `*Modalidad:* Recojo / Sin envío\n`;
  }

  if (cleanNotes && cleanNotes !== '') {
    message += `*Detalles / Referencia:* ${cleanNotes}\n`;
  }

  message += `\n¿Tienen stock disponible de estas prendas para coordinar la entrega? ¡Muchas gracias!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;
}

/**
 * Alias de compatibilidad hacia generateWhatsAppInquiryUrl
 */
export const generateWhatsAppOrderUrl = generateWhatsAppInquiryUrl;
