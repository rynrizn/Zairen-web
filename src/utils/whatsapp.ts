import { siteConfig } from '../config/site';
import type { CartItem } from '../stores/cartStore';
import { getCartSubtotal, getCartShippingCost, getCartTotal } from '../stores/cartStore';

/**
 * Genera el enlace directo a WhatsApp con el mensaje estructurado de confirmación de pedido
 */
export function generateWhatsAppOrderUrl(items: CartItem[], clientNotes?: string): string {
  if (items.length === 0) return '';

  const subtotal = getCartSubtotal(items);
  const shipping = getCartShippingCost(items);
  const total = getCartTotal(items);

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
        `▪️ *${item.nombre}*\n   📏 Talla: *${item.talla}*${item.sku ? ` | SKU: \`${item.sku}\`` : ''} | Cant: ${item.cantidad} | Bs ${item.precio * item.cantidad}`
    )
    .join('\n\n');

  const shippingText = shipping === 0 ? '¡GRATIS! (Supera Bs 250)' : `Bs ${shipping.toFixed(2)}`;

  let message = `⛩️ *NUEVO PEDIDO${orderTag} // ${siteConfig.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👕 *DETALLE DE PRENDAS:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Subtotal:* Bs ${subtotal.toFixed(2)}\n`;
  message += `🚚 *Envío Express:* ${shippingText}\n`;
  message += `🔥 *TOTAL A PAGAR: Bs ${total.toFixed(2)}*\n\n`;

  if (cleanNotes && cleanNotes !== '') {
    message += `📝 *Nota del cliente:* ${cleanNotes}\n\n`;
  }

  message += `📍 Por favor indíquenme disponibilidad y datos para el pago (QR Simple / Transferencia).`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;
}
