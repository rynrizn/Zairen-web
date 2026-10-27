/**
 * Utilidad para formatear títulos de página de Zairen Lab.
 * Regla de negocio:
 * - Sin sufijo "// ZAIRENLAB" en pestañas ni metadatos.
 * - Cada página muestra únicamente el nombre de su sección (ej. "Inventario", "Pedidos", "Ventas").
 * - Única excepción: El catálogo público principal usa "Zairen" (marca capitalizada).
 * - En la ficha de producto se usa únicamente el nombre del producto.
 */

export interface TitleOptions {
  title?: string;
  isCatalog?: boolean;
}

export function formatPageTitle(title?: string, isCatalog = false): string {
  if (isCatalog) {
    return 'Zairen';
  }

  if (!title) {
    return 'Zairen';
  }

  // Si el título viene con algún sufijo previo "// ZAIRENLAB" o variantes, lo eliminamos
  let clean = title
    .replace(/\s*\/\/\s*ZAIREN\s*LAB/gi, '')
    .replace(/\s*\/\/\s*ZAIRENLAB/gi, '')
    .replace(/\s*\/\/\s*Zairen/gi, '')
    .trim();

  // Si quedó vacío o solo decía Zairen Lab
  if (!clean || clean.toLowerCase() === 'zairen lab' || clean.toLowerCase() === 'zairenlab') {
    return isCatalog ? 'Zairen' : 'Zairen';
  }

  return clean;
}
