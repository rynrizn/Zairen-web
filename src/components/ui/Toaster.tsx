import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#201f1f',
          color: '#e5e2e1',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '9999px',
          padding: '10px 18px',
          fontFamily: 'Space Mono, monospace',
          fontSize: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        },
      }}
    />
  );
}
