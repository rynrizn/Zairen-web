import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import {
  $cart,
  $isDrawerOpen,
  closeDrawer,
  removeItem,
  updateQuantity,
  clearCart,
  getCartSubtotal,
  validarYLimpiarCarrito,
} from '../../stores/cartStore';
import { formatCurrency } from '../../config/site';
import { generateWhatsAppOrderUrl } from '../../utils/whatsapp';
import { TurnstileWidget } from '../common/TurnstileWidget';
import { toast } from 'sonner';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Truck } from 'lucide-react';

export function CarritoDrawer() {
  const cart = useStore($cart);
  const isOpen = useStore($isDrawerOpen);
  const [requiresDelivery, setRequiresDelivery] = useState<boolean>(false);
  const [clientNotes, setClientNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, setTurnstileVerified] = useState<boolean>(false);
  const [honeypotValue, setHoneypotValue] = useState<string>('');
  const [, setCurrencyTick] = useState<number>(0);
  const lastOrderAttemptRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleCurrencyChange = () => {
        setCurrencyTick((t) => t + 1);
      };

      const handleTurnstileVerified = () => {
        setTurnstileVerified(true);
      };

      window.addEventListener('zairen-currency-changed', handleCurrencyChange);
      document.addEventListener('turnstile:verified', handleTurnstileVerified);
      return () => {
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
  const total = subtotal;

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

    const combinedNotes = requiresDelivery
      ? `[Requiere Envío a Domicilio] ${clientNotes}`.trim()
      : clientNotes.trim();

    try {
      const validateRes = await fetch('/api/checkout-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          subtotal,
          shipping: 0,
          total,
          notes: combinedNotes,
        }),
      });

      const validateData = await validateRes.json().catch(() => ({}));

      if (!validateRes.ok || !validateData.success) {
        toast.dismiss(toastLoading);
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
        ? `${combinedNotes ? `${combinedNotes} • ` : ''}[Orden #${validateData.orderNumber}]`
        : combinedNotes;

      // Generar URL y abrir WhatsApp
      const whatsappUrl = generateWhatsAppOrderUrl(cart, orderNote, requiresDelivery);
      window.open(whatsappUrl, '_blank');
      toast.success('Pedido registrado como PENDIENTE. Abriendo WhatsApp...');
    } catch (e: any) {
      toast.dismiss(toastLoading);
      const whatsappUrl = generateWhatsAppOrderUrl(cart, combinedNotes, requiresDelivery);
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
      <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-[#201f1f] flex flex-col h-full shadow-2xl z-10 transition-transform duration-300 ease-out animate-in slide-in-from-right duration-300">
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between p-4 border-b border-[#201f1f] bg-[#141416]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#dc143c]" />
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
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 border border-dashed border-[#201f1f] flex items-center justify-center text-[#ac8888]">
                <ShoppingBag className="w-7 h-7" />
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
                className="mt-2 px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold text-[#0A0A0A] bg-[#FAF9F6] hover:bg-[#dc143c] hover:text-white transition-colors cursor-pointer rounded-none"
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
                  className="w-20 h-20 object-contain bg-[#0A0A0A] border border-[#201f1f] shrink-0"
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
                        className="text-[#ac8888] hover:text-[#dc143c] p-1 cursor-pointer"
                        title="Eliminar de la bolsa"
                        aria-label="Eliminar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#201f1f] text-[#FAF9F6] font-bold rounded-none">
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
                    {/* Control de Cantidad Ortogonal */}
                    <div className="flex items-center border border-[#201f1f] bg-[#0A0A0A]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs text-[#ac8888] hover:text-white cursor-pointer active:scale-90 transition-transform rounded-none"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-[#FAF9F6]">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.talla, item.cantidad + 1)}
                        disabled={item.stockDisponible !== undefined && item.cantidad >= item.stockDisponible}
                        className={`w-6 h-6 flex items-center justify-center text-xs rounded-none ${
                          item.stockDisponible !== undefined && item.cantidad >= item.stockDisponible
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-[#ac8888] hover:text-white cursor-pointer active:scale-90 transition-transform'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
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
            {/* Opción de Envío a Domicilio */}
            <div className="bg-[#0A0A0A] p-3 border border-[#201f1f]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requiresDelivery}
                  onChange={(e) => setRequiresDelivery(e.target.checked)}
                  className="w-4 h-4 rounded-none bg-[#141416] border border-[#201f1f] text-[#dc143c] focus:ring-0 focus:outline-none accent-[#dc143c] cursor-pointer"
                />
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FAF9F6]">
                  <Truck className="w-3.5 h-3.5 text-[#dc143c]" />
                  <span>¿Deseas envío a domicilio?</span>
                </div>
              </label>

              {/* Si marca envío, se despliega el cuadro de referencia */}
              {requiresDelivery ? (
                <div className="mt-2.5 pt-2 border-t border-white/[0.06] animate-in fade-in duration-200">
                  <p className="text-[10px] font-mono text-[#ac8888] mb-1.5">
                    * El costo de entrega se coordinará directamente contigo vía WhatsApp.
                  </p>
                  <label htmlFor="order-notes" className="block text-[10px] font-mono text-[#FAF9F6] uppercase tracking-wider mb-1">
                    Dirección o Referencia de Entrega:
                  </label>
                  <textarea
                    id="order-notes"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Ej: Zona Central, Calle Sucre #123, entre Bolívar y Colón..."
                    rows={2}
                    maxLength={200}
                    className="w-full bg-[#141416] border border-[#201f1f] text-xs font-body text-[#FAF9F6] p-2 focus:border-[#dc143c] focus:outline-none resize-none rounded-none"
                  />
                </div>
              ) : (
                <p className="text-[10px] font-mono text-[#8F8F8C] mt-1 pl-6">
                  Recojo directo sin costo de envío.
                </p>
              )}
            </div>

            {/* Desglose Económico */}
            <div className="space-y-1.5 pt-2 border-t border-[#201f1f] text-xs font-mono">
              <div className="flex justify-between text-[#ac8888]">
                <span>Prendas ({cart.reduce((sum, item) => sum + item.cantidad, 0)})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {requiresDelivery && (
                <div className="flex justify-between text-[#ac8888]">
                  <span>Envío</span>
                  <span className="text-[#FAF9F6]">A coordinar por WhatsApp</span>
                </div>
              )}
              <div className="flex justify-between text-[#FAF9F6] font-bold text-sm pt-1 border-t border-[#201f1f]">
                <span>TOTAL PRENDAS</span>
                <span className="text-[#dc143c]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Cloudflare Turnstile Invisible / Interactivo para Protección de Pedidos */}
            <div className="pt-1">
              <TurnstileWidget action="checkout_order" />
            </div>

            {/* Honeypot Anti-Bot (Oculto) */}
            <input
              id="cart-honeypot"
              type="text"
              name="company_tax_id_ref"
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              aria-label="No completar"
              className="absolute opacity-0 pointer-events-none -left-[9999px]"
            />

            {/* Botón de Checkout Directo hacia WhatsApp */}
            <button
              type="button"
              onClick={handleCheckoutWhatsApp}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg rounded-none ${
                isSubmitting
                  ? 'bg-[#1c1b1b] text-[#8F8F8C] cursor-not-allowed border border-[#201f1f]'
                  : 'bg-[#dc143c] hover:bg-[#b01030] text-white border border-[#dc143c]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-none animate-spin" />
                  <span>Revalidando existencias...</span>
                </>
              ) : (
                <>
                  <span>Completar Pedido vía WhatsApp</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
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
