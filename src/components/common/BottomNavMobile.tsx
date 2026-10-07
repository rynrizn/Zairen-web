import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, getCartTotalItems, toggleDrawer } from '../../stores/cartStore';
import { siteConfig } from '../../config/site';
import { ShareWebModal } from './ShareWebModal';

export function BottomNavMobile() {
  const items = useStore($cart);
  const totalItems = getCartTotalItems(items);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <nav
        aria-label="Navegación Móvil Rápida"
        className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-[#141416]/90 backdrop-blur-2xl border border-white/[0.12] rounded-full p-2 shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-center justify-around">
          {/* 1. Inicio */}
          <a
            href="/"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-mono tracking-tight font-medium">Inicio</span>
          </a>

          {/* 2. Catálogo */}
          <a
            href="/catalogo"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            <span className="text-[10px] font-mono tracking-tight font-medium">Catálogo</span>
          </a>

          {/* 3. Compartir / QR */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="5" height="5" x="3" y="3" rx="1" />
              <rect width="5" height="5" x="16" y="3" rx="1" />
              <rect width="5" height="5" x="3" y="16" rx="1" />
              <path d="M16 16h3v3h-3z" />
            </svg>
            <span className="text-[10px] font-mono tracking-tight font-medium">QR / Link</span>
          </button>

          {/* 4. WhatsApp Directo */}
          <a
            href={`https://wa.me/${siteConfig.whatsapp.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#25D366] transition-colors"
          >
            <div className="relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-[10px] font-mono tracking-tight font-medium">WhatsApp</span>
          </a>

          {/* 5. Bolsa / Carrito */}
          <button
            type="button"
            onClick={() => toggleDrawer()}
            className="relative flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors cursor-pointer"
          >
            <div className="relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-bold text-white bg-[#dc143c] rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono tracking-tight font-medium">Bolsa</span>
          </button>
        </div>
      </nav>

      <ShareWebModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  );
}
