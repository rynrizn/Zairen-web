import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * Renderiza el modal directamente en document.body para aislarlo de cualquier
 * contexto de apilamiento (stacking context) como <main class="relative z-10">
 * y asegurar que quede por encima de la barra de navegación superior móvil.
 */
export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
}
