import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cart,
  $isDrawerOpen,
  closeDrawer,
  removeItem,
  updateQuantity,
  clearCart,
  getCartSubtotal,
  getCartShippingCost,
  getCartTotal,
  isFreeShippingEligible,
  validarYLimpiarCarrito,
} from '../../stores/cartStore';
import { siteConfig, formatCurrency } from '../../config/site';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';
import { supabase } from '../../lib/supabase';
import { TurnstileWidget } from '../common/TurnstileWidget';
import { toast } from 'sonner';

export function CarritoDrawer() {
  const cart = useStore($cart);
  const isOpen = useStore($isDrawerOpen);
  const [clientNotes, setClientNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [turnstileVerified, setTurnstileVerified] = useState<boolean>(false);
  const [honeypotValue, setHoneypotValue] = useState<string>('');
  const [mostrarPromoEnvio, setMostrarPromoEnvio] = useState<boolean>(false);
  const [, setCurrencyTick] = useState<number>(0);
  const lastOrderAttemptRef = React.useRef<number>(0);

  // Leer preferencia de promoción opcional (desactivada por defecto)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zairen_cart_promo_enabled');
      setMostrarPromoEnvio(saved === 'true');

      const handleStorageChange = () => {
        const updated = localStorage.getItem('zairen_cart_promo_enabled');
        setMostrarPromoEnvio(updated === 'true');
        setCurrencyTick((t) => t + 1);
      };
      const handleCurrencyChange = () => {
        setCurrencyTick((t) => t + 1);
      };

      const handleTurnstileVerified = () => {
        setTurnstileVerified(true);
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('zairen-currency-changed', handleCurrencyChange);
      document.addEventListener('turnstile:verified', handleTurnstileVerified);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('zairen-currency-changed', handleCurrencyChange);
        document.removeEventListener('turnstile:verified', handleTurnstileVerified);
      };
    }
  }, []);

  // Validar y depurar items del carrito al abrir el drawer o al montar
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      validarYLimpiarCarrito();
    }
  }, [isOpen]);

  useEffect(() => {
    if (cart.length > 0) {
      validarYLimpiarCarrito();
    }
  }, []);

  const subtotal = getCartSubtotal(cart);
  const shipping = getCartShippingCost(cart);
  const total = getCartTotal(cart);
  const isFree = isFreeShippingEligible(cart);
  const amountToFreeShipping = Math.max(0, siteConfig.shipping.freeShippingThreshold - subtotal);

  // Progreso hacia el envío gratis (0 a 100%)
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / siteConfig.shipping.freeShippingThreshold) * 100)
  );

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0) return;

    // 1. Detección de Bot mediante Honeypot
    if (honeypotValue.trim() !== '') {
      toast.error('Detección de bot: Envío bloqueado.');
      return;
    }

    // 2. Limitador de Frecuencia (Rate Limit: 15s)
    const now = Date.now();
    if (now - lastOrderAttemptRef.current < 15000) {
      toast.warning('Por favor espera 15 segundos antes de generar otro pedido.');
      return;
    }
    lastOrderAttemptRef.current = now;

    setIsSubmitting(true);
    const toastLoading = toast.loading('Revalidando stock disponible y preparando orden...');

    try {
      const validateRes = await fetch('/api/checkout-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal,
          shipping,
          total,
          notes: clientNotes,
        }),
      });

      const validateData = await validateRes.json().catch(() => ({}));

      if (!validateRes.ok || !validateData.success) {
        toast.dismiss(toastLoading);
        // Depurar items eliminados o no disponibles de inmediato
        await validarYLimpiarCarrito();
        if (validateData.error === 'STOCK_INSUFICIENTE') {
          toast.error(validateData.message || 'Una de las prendas seleccionadas se ha agotado.', {
            duration: 8000,
          });
        } else {
          toast.error(validateData.error || 'No se pudo validar el inventario en el servidor.');
        }
        return;
      }

      toast.dismiss(toastLoading);
      const orderNote = validateData.orderNumber
        ? `${clientNotes ? `${clientNotes} • ` : ''}[Orden #${validateData.orderNumber}]`
        : clientNotes;

      // Generar URL y abrir WhatsApp
      const whatsappUrl = generateWhatsAppOrderUrl(cart, orderNote);
      window.open(whatsappUrl, '_blank');
      toast.success('Pedido registrado como PENDIENTE. Abriendo WhatsApp...');
    } catch (e: any) {
      toast.dismiss(toastLoading);
      const whatsappUrl = generateWhatsAppOrderUrl(cart, clientNotes);
      window.open(whatsappUrl, '_blank');
      toast.info('Abriendo WhatsApp...');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bloquear scroll de la página cuando el Drawer esté abierto
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bolsa de Compras"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop con desenfoque zen minimalista */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel Lateral Orthogonal */}
      <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-[#201f1f] flex flex-col h-full shadow-2xl z-10 transition-transform duration-300 ease-out">
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-[#201f1f] bg-[#141416]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#dc143c]" />
            <h2 className="font-display text-base font-bold uppercase tracking-tight text-[#FAF9F6]">
              Bolsa de Compras
            </h2>
            <span className="text-xs font-mono text-[#ac8888]">
              ({cart.reduce((sum, item) => sum + item.cantidad, 0)})
            </span>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar bolsa"
            className="w-8 h-8 rounded-none flex items-center justify-center text-[#ac8888] hover:text-[#FAF9F6] hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-[#201f1f]"
          >
            ✕
          </button>
        </div>

        {/* Barra de Progreso de Envío Gratis Opcional (Controlada desde Admin) */}
        {mostrarPromoEnvio && (
          <div className="p-3 bg-[#141416]/50 border-b border-[#201f1f] text-xs font-mono">
            {isFree ? (
              <p className="text-[#a7f3d0] font-bold flex items-center gap-1.5">
                <span>✓</span> ¡Calificas para ENVÍO GRATIS a toda Bolivia!
              </p>
            ) : (
              <div>
                <p className="text-[#ac8888] mb-1.5">
                  Agrega{' '}
                  <span className="text-[#FAF9F6] font-bold">
                    {formatCurrency(amountToFreeShipping)}
                  </span>{' '}
                  más para envío gratuito
                </p>
                <div className="w-full h-1 bg-[#201f1f] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#dc143c] to-[#ff4d6d] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 border border-dashed border-[#201f1f] flex items-center justify-center text-2xl text-[#ac8888]">
                ⛩️
              </div>
              <div>
                <p className="font-display text-sm font-bold uppercase text-[#FAF9F6] tracking-tight">
                  Tu bolsa está vacía
                </p>
                <p className="text-xs font-body text-[#ac8888] mt-1">
                  Explora las piezas disponibles en el catálogo de Zairen Lab.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-2 px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A] bg-[#FAF9F6] hover:bg-[#dc143c] hover:text-white transition-colors cursor-pointer"
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.id}-${item.talla}`}
                className="flex gap-3 p-3 bg-[#141416] border border-[#201f1f] relative group"
              >
                {/* Imagen Cuadrada Orthogonal */}
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-20 h-20 object-cover bg-[#0A0A0A] border border-[#201f1f] shrink-0"
                />

                {/* Detalles de la prenda */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-xs md:text-sm font-bold text-[#FAF9F6] uppercase tracking-tight truncate">
                        {item.nombre}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.talla)}
                        className="text-[#ac8888] hover:text-[#dc143c] text-xs p-0.5 cursor-pointer"
                        title="Eliminar de la bolsa"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#201f1f] text-[#FAF9F6] font-bold">
                        TALLA: {item.talla}
                      </span>
                      {item.sku && (
                        <span className="text-[9px] font-mono text-[#ac8888] truncate">
                          {item.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#201f1f]/60">
                    {/* Control de Cantidad */}
                    <div className="flex items-center border border-[#201f1f] bg-[#0A0A0A]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-[#ac8888] hover:text-white cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-[#FAF9F6]">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad + 1)}
                        disabled={item.stockDisponible !== undefined && item.cantidad >= item.stockDisponible}
                        className={`w-6 h-6 flex items-center justify-center text-xs ${
                          item.stockDisponible !== undefined && item.cantidad >= item.stockDisponible
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-[#ac8888] hover:text-white cursor-pointer'
                        }`}
                      >
                        +
                      </button>
                    </div>

                    {/* Precio Unitario / Subtotal */}
                    <div className="text-right">
                      <span className="font-mono text-xs md:text-sm font-bold text-[#FAF9F6]">
                        {formatCurrency(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pie de Pedido y Checkout */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#141416] border-t border-[#201f1f] space-y-3">
            {/* Notas del Cliente para el Pedido */}
            <div>
              <label htmlFor="order-notes" className="block text-[10px] font-mono text-[#ac8888] uppercase tracking-wider mb-1">
                Instrucciones o Referencia de Entrega (Opcional):
              </label>
              <textarea
                id="order-notes"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Ej: Enviar a nombre de Juan Pérez, zona central..."
                rows={2}
                maxLength={200}
                className="w-full bg-[#0A0A0A] border border-[#201f1f] text-xs font-body text-[#FAF9F6] p-2 focus:border-[#dc143c] focus:outline-none resize-none"
              />
            </div>

            {/* Desglose Económico */}
            <div className="space-y-1.5 pt-2 border-t border-[#201f1f] text-xs font-mono">
              <div className="flex justify-between text-[#ac8888]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#ac8888]">
                <span>Envío (Nacional)</span>
                <span>{isFree ? 'GRATIS' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-[#FAF9F6] font-bold text-sm pt-1 border-t border-[#201f1f]">
                <span>TOTAL APROX.</span>
                <span className="text-[#dc143c]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Cloudflare Turnstile Invisible / Interactivo para Protección de Pedidos */}
            <div className="pt-1">
              <TurnstileWidget action="checkout_order" />
            </div>

            {/* Honeypot Anti-Bot (Oculto) */}
            <input
              type="text"
              name="company_tax_id_ref"
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="absolute opacity-0 pointer-events-none -left-[9999px]"
            />

            {/* Botón de Checkout Directo hacia WhatsApp */}
            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isSubmitting
                  ? 'bg-[#1c1b1b] text-[#8F8F8C] cursor-not-allowed border border-[#201f1f]'
                  : 'bg-[#dc143c] hover:bg-[#b01030] text-white border border-[#dc143c]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Revalidando existencias...</span>
                </>
              ) : (
                <>
                  <span>Completar Pedido vía WhatsApp</span>
                  <span>→</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#ac8888]">
              <button
                type="button"
                onClick={clearCart}
                className="hover:text-[#dc143c] transition-colors underline cursor-pointer"
              >
                Vaciar bolsa
              </button>
              <span>Atención 1 a 1 sin intermediarios</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
