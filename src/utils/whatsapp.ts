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
 * Genera el enlace directo a WhatsApp con el mensaje estructurado de confirmación de pedido
 * Tono sobrio, estético y sin emojis de acuerdo al manual de marca de Zairen Lab.
 */
export function generateWhatsAppOrderUrl(
  items: CartItem[],
  clientNotes?: string,
  requiresDelivery: boolean = false
): string {
  if (items.length === 0) return '';

  const subtotal = getCartSubtotal(items);

  // Extraer número de orden para trazabilidad en panel administrativo
  const orderMatch = clientNotes?.match(/\[Orden\s+(#[A-Z0-9_-]+)\]/i);
  const orderTag = orderMatch ? ` // ${orderMatch[1]}` : '';
  const cleanNotes = clientNotes
    ? clientNotes
        .replace(/\[Orden\s+#[A-Z0-9_-]+\]/gi, '')
        .trim()
        .replace(/^•\s*|\s*•$/g, '')
        .trim()
    : '';

  const itemsList = items
    .map(
      (item) =>
        `— *${item.nombre}*\n   Talla: *${item.talla}* | Cant: ${item.cantidad} | Bs ${(item.precio * item.cantidad).toFixed(2)}`
    )
    .join('\n\n');

  let message = `*NUEVO PEDIDO${orderTag} // ${siteConfig.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `*DETALLE DE PRENDAS:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Subtotal Prendas:* Bs ${subtotal.toFixed(2)}\n`;

  if (requiresDelivery) {
    message += `*Envío:* A coordinar precio\n`;
    message += `*TOTAL PRENDAS: Bs ${subtotal.toFixed(2)}*\n\n`;
  } else {
    message += `*Modalidad:* Recojo / Sin envío\n`;
    message += `*TOTAL: Bs ${subtotal.toFixed(2)}*\n\n`;
  }

  if (cleanNotes && cleanNotes !== '') {
    message += `*Detalles / Referencia:* ${cleanNotes}\n\n`;
  }

  message += `Por favor indíquenme disponibilidad y datos para el pago (QR Simple / Transferencia).`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;
}
