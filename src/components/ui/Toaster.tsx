import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toaster oficial de Zairen Lab:
 * Estilo estrictamente ortogonal (rectangular, rounded-none),
 * fondo Zen oscuro (#141416), acento lateral Carmín Zen (#DC143C)
 * y tipografía monoespaciada técnica.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#141416',
          color: '#FAF9F6',
          border: '1px solid #2A2A2A',
          borderLeft: '3px solid #DC143C',
          borderRadius: '0px',
          padding: '12px 18px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '12px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85)',
        },
      }}
    />
  );
}
