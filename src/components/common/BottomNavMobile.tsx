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
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-[#1C1B1B] py-2 px-3 shadow-[0_-8px_32px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Inicio */}
          <a
            href="/"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">Inicio</span>
          </a>

          {/* 2. Marca & Drops */}
          <a
            href="/marca"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">Marca</span>
          </a>

          {/* 3. Compartir / QR */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-[#dc143c] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="6" height="6" x="3" y="3" />
              <rect width="6" height="6" x="15" y="3" />
              <rect width="6" height="6" x="3" y="15" />
              <path d="M15 15h3v3h-3z" />
            </svg>
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">QR</span>
          </button>

          {/* 4. WhatsApp Directo */}
          <a
            href={`https://wa.me/${siteConfig.whatsapp.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#FAF9F6] hover:text-emerald-400 transition-colors"
          >
            <div className="relative">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400"></span>
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">Chat</span>
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
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-mono font-bold text-white bg-[#dc143c]">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium">Bolsa</span>
          </button>
        </div>
      </nav>

      <ShareWebModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </>
  );
}
