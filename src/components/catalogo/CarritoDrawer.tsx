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

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('zairen-currency-changed', handleCurrencyChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('zairen-currency-changed', handleCurrencyChange);
      };
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

    // 2. Verificación Humana Requerida
    if (!turnstileVerified) {
      toast.error('Por favor completa la verificación de seguridad antes de continuar');
      return;
    }

    // 3. Limitador de Frecuencia (Rate Limit: 15s)
    const now = Date.now();
    if (now - lastOrderAttemptRef.current < 15000) {
      toast.warning('Por favor espera 15 segundos antes de generar otro pedido.');
      return;
    }
    lastOrderAttemptRef.current = now;

    setIsSubmitting(true);
    try {
      // Registrar intento de pedido en Supabase en segundo plano si la tabla está disponible
      supabase
        .from('pedido')
        .insert({
          origen: 'CATALOGO_WEB',
          estado: 'PENDIENTE',
          subtotal,
          envio: shipping,
          total,
          observacion: clientNotes || 'Checkout desde Drawer Web',
        })
        .then(
          () => {},
          () => {}
        );

      // Generar URL y abrir WhatsApp
      const whatsappUrl = generateWhatsAppOrderUrl(cart, clientNotes);
      window.open(whatsappUrl, '_blank');
      toast.success('Abriendo WhatsApp para confirmar tu pedido...');
    } catch (e) {
      const whatsappUrl = generateWhatsAppOrderUrl(cart, clientNotes);
      window.open(whatsappUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop translúcido con desenfoque progresivo */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel Deslizante Drawer con Spring Easing */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[450px] bg-[#141416] border-l border-white/[0.1] shadow-[-20px_0_60px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabecera del Drawer */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#141416]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#201f1f] text-[#dc143c] flex items-center justify-center border border-white/[0.06]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[#FAF9F6]">
                Bolsa de Compras
              </h2>
              <span className="font-mono text-[10px] text-[#ac8888] tracking-widest uppercase">
                ZAIREN // {cart.length} {cart.length === 1 ? 'PRENDA' : 'PRENDAS'}
              </span>
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar bolsa"
            className="w-8 h-8 rounded-none bg-[#1c1b1b] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#201f1f]"
          >
            ✕
          </button>
        </div>

        {/* Barra de Progreso de Envío Gratis (OPCIONAL: sólo se muestra si está activada en Admin) */}
        {mostrarPromoEnvio && (
          <div className="px-6 py-3 bg-[#0a0a0a] border-b border-white/[0.06] animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span className="text-[#ac8888]">
                {isFree
                  ? '🎉 ¡CALIFICAS PARA ENVÍO GRATIS!'
                  : `Faltan ${formatCurrency(amountToFreeShipping)} para Envío Gratis`}
              </span>
              <span className="text-[#ffb3b3] font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1 bg-[#201f1f] rounded-none overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#dc143c] to-[#ff2d55] transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Lista de Items en Carrito */}
        <div className="flex-1 overflow-y-auto p-6 divide-y divide-white/[0.06]">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={`${item.id}-${item.talla}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                {/* Miniatura Ortogonal */}
                <div className="w-16 h-20 rounded-none overflow-hidden bg-[#0a0a0a] shrink-0 border border-[#201f1f]">
                  <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover rounded-none" />
                </div>

                {/* Datos y Cantidad */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-xs font-bold uppercase text-[#FAF9F6] line-clamp-1">
                        {item.nombre}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.talla)}
                        className="text-[#ac8888] hover:text-[#ff5449] text-xs transition-colors p-1 cursor-pointer"
                        title="Eliminar prenda"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-none bg-[#1c1b1b] text-[10px] font-mono text-[#ffb3b3] border border-[#201f1f]">
                        TALLA: {item.talla}
                      </span>
                      {item.sku && (
                        <span className="text-[10px] font-mono text-[#ac8888]">
                          {item.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Precios y Stepper Ortogonal */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {formatCurrency(item.precio * item.cantidad)}
                    </span>

                    {/* Stepper - / + Ortogonal */}
                    <div className="flex items-center border border-[#201f1f] rounded-none bg-[#0a0a0a]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-[#ac8888] hover:text-white transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono text-xs text-[#FAF9F6] font-bold">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-[#ac8888] hover:text-white transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-none bg-[#1c1b1b] text-[#dc143c] flex items-center justify-center mb-3 border border-[#201f1f]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="font-display text-sm font-bold uppercase text-[#FAF9F6]">
                Tu bolsa está vacía
              </p>
              <p className="font-body text-xs text-[#ac8888] max-w-xs mt-1">
                Explora el catálogo y añade tus prendas seleccionadas por talla.
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-4 px-6 py-2 rounded-none bg-[#1c1b1b] hover:bg-[#201f1f] text-xs font-mono text-white uppercase tracking-wider border border-[#201f1f] hover:border-[#dc143c] transition-colors cursor-pointer"
              >
                Ver Catálogo
              </button>
            </div>
          )}
        </div>

        {/* Footer / Resumen, Anti-Bot y Botón WhatsApp */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/[0.08] bg-[#141416]/95 backdrop-blur-md space-y-4">
            {/* Honeypot invisible para atrapar bots */}
            <div className="sr-only" aria-hidden="true" style={{ display: 'none' }}>
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypotValue}
                onChange={(e) => setHoneypotValue(e.target.value)}
              />
            </div>

            {/* Nota opcional */}
            <div>
              <label htmlFor="order-notes" className="block text-[10px] font-mono text-[#ac8888] uppercase tracking-wider mb-1">
                Instrucciones / Ciudad de Envío (Opcional)
              </label>
              <input
                id="order-notes"
                type="text"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Ej: Envío a domicilio, pago con QR..."
                className="w-full bg-[#0a0a0a] border border-[#201f1f] rounded-none px-3 py-2 text-xs font-mono text-[#FAF9F6] placeholder:text-[#ac8888]/60 focus:outline-none focus:border-[#dc143c]"
              />
            </div>

            {/* Desglose de Precios */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#ac8888]">
                <span>Subtotal ({cart.length} prendas)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#ac8888]">
                <span>Envío Express</span>
                <span className={isFree && mostrarPromoEnvio ? 'text-emerald-400 font-bold' : ''}>
                  {isFree && mostrarPromoEnvio ? '¡GRATIS!' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex justify-between items-baseline">
                <div>
                  <span className="font-display text-sm font-bold text-[#FAF9F6] uppercase block">
                    Total a Confirmar
                  </span>
                  <span className="text-[10px] text-[#ac8888]">
                    Coordinación directa por WhatsApp
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-[#dc143c] tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Widget de Verificación Cloudflare Turnstile Anti-Bot */}
            <TurnstileWidget onVerify={() => setTurnstileVerified(true)} />

            {/* Botón Primario WhatsApp Checkout Ortogonal */}
            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              disabled={isSubmitting || !turnstileVerified}
              className="w-full py-4 px-6 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_24px_rgba(220,20,60,0.45)] hover:shadow-[0_6px_30px_rgba(222,5,65,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border border-[#dc143c]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.37C9.37 7.37 9.1 7.43 8.88 7.68C8.65 7.92 8.02 8.51 8.02 9.73C8.02 10.95 8.91 12.12 9.03 12.28C9.16 12.45 10.77 14.93 13.23 16C13.82 16.25 14.28 16.41 14.63 16.52C15.22 16.71 15.77 16.68 16.2 16.62C16.67 16.55 17.65 16.03 17.86 15.45C18.06 14.86 18.06 14.36 18 14.26C17.94 14.15 17.79 14.09 17.56 13.98C17.34 13.87 16.25 13.33 16.05 13.26C15.84 13.18 15.69 13.15 15.54 13.38C15.38 13.61 14.94 14.15 14.81 14.3C14.68 14.45 14.54 14.47 14.32 14.36C14.09 14.24 13.37 14.01 12.52 13.25C11.86 12.66 11.41 11.93 11.29 11.71C11.16 11.49 11.27 11.37 11.39 11.25C11.49 11.14 11.62 10.98 11.73 10.84C11.85 10.71 11.89 10.61 11.96 10.46C12.04 10.31 12 10.18 11.94 10.07C11.89 9.96 11.43 8.84 11.25 8.38C11.06 7.93 10.88 7.99 10.74 7.99C10.61 7.98 10.46 7.98 10.31 7.98C10.16 7.98 9.91 8.04 9.71 8.25C9.53 8.46 9.53 7.37 9.53 7.37Z"/>
              </svg>
              <span>Finalizar Pedido por WhatsApp</span>
            </button>

            {/* Acciones secundarias */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <button
                type="button"
                onClick={clearCart}
                className="text-[#ac8888] hover:text-[#ff5449] transition-colors uppercase tracking-wider cursor-pointer"
              >
                Vaciar Pedido
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-[#ac8888] hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
              >
                Continuar Explorando →
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
