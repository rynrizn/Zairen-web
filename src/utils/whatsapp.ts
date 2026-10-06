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

  const itemsList = items
    .map(
      (item) =>
        `▪️ *${item.nombre}*\n   📏 Talla: *${item.talla}* | Cant: ${item.cantidad} | Bs ${item.precio * item.cantidad}`
    )
    .join('\n\n');

  const shippingText = shipping === 0 ? '¡GRATIS! (Supera Bs 250)' : `Bs ${shipping.toFixed(2)}`;

  let message = `⛩️ *NUEVO PEDIDO // ${siteConfig.name}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `👕 *DETALLE DE PRENDAS:*\n${itemsList}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *Subtotal:* Bs ${subtotal.toFixed(2)}\n`;
  message += `🚚 *Envío Express:* ${shippingText}\n`;
  message += `🔥 *TOTAL A PAGAR: Bs ${total.toFixed(2)}*\n\n`;

  if (clientNotes && clientNotes.trim() !== '') {
    message += `📝 *Nota del cliente:* ${clientNotes.trim()}\n\n`;
  }

  message += `📍 Por favor indíquenme disponibilidad y datos para el pago (QR Simple / Transferencia).`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodedMessage}`;
}
