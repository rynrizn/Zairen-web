import { atom } from 'nanostores';
import { siteConfig } from '../config/site';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  talla: string;
  imagen: string;
  cantidad: number;
  sku?: string;
  stockDisponible?: number;
}

// Cargar estado inicial desde localStorage de forma segura en navegador,
// filtrando elementos corruptos o incompletos
function getInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('zairen_cart_v2');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter((item): item is CartItem => {
      return (
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.trim().length > 0 &&
        typeof item.nombre === 'string' &&
        typeof item.talla === 'string' &&
        item.talla.trim().length > 0 &&
        typeof item.precio === 'number' &&
        !isNaN(item.precio) &&
        typeof item.cantidad === 'number' &&
        item.cantidad > 0
      );
    });
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
 * Añade una prenda a la lista de consulta considerando la combinación ID + TALLA.
 * En modo consulta no se limita por stock ni se descuenta inventario.
 */
export function addItem(item: Omit<CartItem, 'cantidad'>) {
  const current = $cart.get();
  const existing = current.find((i) => i.id === item.id && i.talla === item.talla);

  if (existing) {
    if (existing.cantidad >= 99) {
      return;
    }
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
}

/**
 * Remueve un item específico por ID y talla
 */
export function removeItem(id: string, talla: string) {
  $cart.set($cart.get().filter((i) => !(i.id === id && i.talla === talla)));
}

/**
 * Actualiza la cantidad de un item con validación de mínimo 1 y tope razonable de 99
 */
export function updateQuantity(id: string, talla: string, cantidad: number) {
  if (cantidad <= 0) {
    removeItem(id, talla);
    return;
  }
  $cart.set(
    $cart.get().map((i) => {
      if (i.id === id && i.talla === talla) {
        return { ...i, cantidad: Math.min(cantidad, 99) };
      }
      return i;
    })
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
 * Valida la existencia y disponibilidad de las prendas en el carrito contra Supabase.
 * Retira discretamente los productos que hayan sido eliminados, archivados o inactivados.
 */
export async function validarYLimpiarCarrito(): Promise<{ retirados: string[] }> {
  if (typeof window === 'undefined') return { retirados: [] };
  const current = $cart.get();
  if (current.length === 0) return { retirados: [] };

  try {
    const uniqueIds = Array.from(new Set(current.map((i) => i.id).filter(Boolean)));
    if (uniqueIds.length === 0) return { retirados: [] };

    // 1. Consultar por ID directo
    const { data: dbProds, error } = await supabase
      .from('producto')
      .select('id, slug, activo, publicado')
      .in('id', uniqueIds);

    const activeSet = new Set<string>();
    if (!error && dbProds) {
      dbProds.forEach((p) => {
        if (p.activo && p.publicado) {
          activeSet.add(p.id);
          if (p.slug) activeSet.add(p.slug);
        }
      });
    }

    // 2. Si algunos IDs no se encontraron (quizá eran slugs), consultar por slug
    const missing = uniqueIds.filter((id) => !activeSet.has(id));
    if (missing.length > 0) {
      const { data: slugProds } = await supabase
        .from('producto')
        .select('id, slug, activo, publicado')
        .in('slug', missing);

      if (slugProds) {
        slugProds.forEach((p) => {
          if (p.activo && p.publicado) {
            activeSet.add(p.id);
            if (p.slug) activeSet.add(p.slug);
          }
        });
      }
    }

    const retirados: string[] = [];
    const validItems = current.filter((item) => {
      const isStillAvailable = activeSet.has(item.id);
      if (!isStillAvailable) {
        retirados.push(item.nombre);
      }
      return isStillAvailable;
    });

    if (retirados.length > 0) {
      $cart.set(validItems);
      const nombresUnicos = Array.from(new Set(retirados));
      const msg =
        nombresUnicos.length === 1
          ? `"${nombresUnicos[0]}" ya no está disponible y fue retirado de tu lista de consulta.`
          : `Se retiraron ${nombresUnicos.length} prendas no disponibles de tu lista de consulta.`;
      toast.info(msg, { duration: 6000 });
    }

    return { retirados };
  } catch (err) {
    console.warn('Error al verificar disponibilidad del carrito:', err);
    return { retirados: [] };
  }
}

/**
 * Métricas calculadas del carrito
 */
export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (Number(item.precio) || 0) * item.cantidad, 0);
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

export function getCartShippingCost(_items: CartItem[]): number {
  // En Zairen Lab no se aplica costo de envío predeterminado: es 'A coordinar precio'
  return 0;
}

export function getCartTotal(items: CartItem[]): number {
  return getCartSubtotal(items);
}

export function getCartTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.cantidad, 0);
}
