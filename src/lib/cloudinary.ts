/**
 * =====================================================================
 * ⛩️ OPTIMIZACIÓN DE IMÁGENES CLOUDINARY // ZAIREN LAB
 * =====================================================================
 */

const cloudName = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'zairen-lab';

/**
 * Retorna una URL optimizada en formato WebP con compresión automática y dimensiones exactas.
 * Si la imagen ya es una URL completa (ej: Unsplash o CDN externo), la retorna directamente.
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  width: number = 600,
  height?: number
): string {
  if (!publicIdOrUrl) return '';

  // Si ya es una URL absoluta HTTP/HTTPS
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // Si ya es de Cloudinary, le inyectamos transformaciones
    if (publicIdOrUrl.includes('res.cloudinary.com')) {
      const transform = height 
        ? `f_auto,q_auto,w_${width},h_${height},c_fill` 
        : `f_auto,q_auto,w_${width}`;
      return publicIdOrUrl.replace('/upload/', `/upload/${transform}/`);
    }
    return publicIdOrUrl;
  }

  // Si es un public_id de Cloudinary
  const transform = height 
    ? `f_auto,q_auto,w_${width},h_${height},c_fill` 
    : `f_auto,q_auto,w_${width}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicIdOrUrl}.webp`;
}

/**
 * Genera un srcset responsivo con transformaciones f_auto,q_auto de Cloudinary
 */
export function getResponsiveSrcSet(
  publicIdOrUrl: string,
  widths: number[] = [360, 480, 600, 800, 1000]
): string {
  if (!publicIdOrUrl) return '';
  return widths
    .map((w) => `${getOptimizedImageUrl(publicIdOrUrl, w, Math.round(w * 1.25))} ${w}w`)
    .join(', ');
}
