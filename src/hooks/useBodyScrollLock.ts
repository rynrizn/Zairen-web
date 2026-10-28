import { useEffect } from 'react';

/**
 * Hook para bloquear el scroll del body mientras un modal o drawer está abierto.
 * Evita el problema de "scroll tras el modal" en dispositivos móviles y de escritorio.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof document === 'undefined' || !isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Prevenir el layout shift por desaparición de la scrollbar en escritorio
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
