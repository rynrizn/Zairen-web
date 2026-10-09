import { atom } from 'nanostores';
import { siteConfig } from '../config/site';

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  talla: string;
  imagen: string;
  cantidad: number;
  sku?: string;
}

// Cargar estado inicial desde localStorage de forma segura en navegador
function getInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('zairen_cart_v2');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// Átomos reactivos ultraligeros (~1 KB)
export const $cart = atom<CartItem[]>(getInitialCart());
export const $isDrawerOpen = atom<boolean>(false);

// Sincronizar automáticamente con localStorage cada vez que cambie
if (typeof window !== 'undefined') {
  $cart.subscribe((items) => {
    try {
      localStorage.setItem('zairen_cart_v2', JSON.stringify(items));
    } catch (e) {
      console.warn('No se pudo guardar carrito en localStorage:', e);
    }
  });
}

/**
 * Añade una prenda al carrito considerando la combinación ID + TALLA
 */
export function addItem(item: Omit<CartItem, 'cantidad'>) {
  const current = $cart.get();
  const existing = current.find((i) => i.id === item.id && i.talla === item.talla);

  if (existing) {
    $cart.set(
      current.map((i) =>
        i.id === item.id && i.talla === item.talla
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      )
    );
  } else {
    $cart.set([...current, { ...item, cantidad: 1 }]);
  }

  // Abrir automáticamente el drawer para confirmar la adición
  $isDrawerOpen.set(true);
}

/**
 * Remueve un item específico por ID y talla
 */
export function removeItem(id: string, talla: string) {
  $cart.set($cart.get().filter((i) => !(i.id === id && i.talla === talla)));
}

/**
 * Actualiza la cantidad de un item con validación de mínimo 1
 */
export function updateQuantity(id: string, talla: string, cantidad: number) {
  if (cantidad <= 0) {
    removeItem(id, talla);
    return;
  }
  $cart.set(
    $cart.get().map((i) =>
      i.id === id && i.talla === talla ? { ...i, cantidad } : i
    )
  );
}

/**
 * Vacía el carrito
 */
export function clearCart() {
  $cart.set([]);
}

/**
 * Control del Drawer lateral
 */
export function toggleDrawer() {
  $isDrawerOpen.set(!$isDrawerOpen.get());
}

export function openDrawer() {
  $isDrawerOpen.set(true);
}

export function closeDrawer() {
  $isDrawerOpen.set(false);
}

/**
 * Métricas calculadas del carrito
 */
export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

export function isFreeShippingEligible(items: CartItem[]): boolean {
  if (typeof window !== 'undefined') {
    const promoEnabled = localStorage.getItem('zairen_cart_promo_enabled') === 'true';
    if (!promoEnabled) return false;
    const customThreshold = localStorage.getItem('zairen_shipping_threshold');
    const threshold = customThreshold ? Number(customThreshold) : siteConfig.shipping.freeShippingThreshold;
    return getCartSubtotal(items) >= threshold;
  }
  return false;
}

export function getCartShippingCost(items: CartItem[]): number {
  if (items.length === 0) return 0;
  if (isFreeShippingEligible(items)) return 0;
  if (typeof window !== 'undefined') {
    const customCost = localStorage.getItem('zairen_shipping_cost');
    if (customCost !== null && !isNaN(Number(customCost))) {
      return Number(customCost);
    }
  }
  return siteConfig.shipping.expressShippingCost;
}

export function getCartTotal(items: CartItem[]): number {
  return getCartSubtotal(items) + getCartShippingCost(items);
}

export function getCartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.cantidad, 0);
}
