import React from 'react';
import { useStore } from '@nanostores/react';
import { $cart, getCartTotalItems, toggleDrawer } from '../../stores/cartStore';

export function CartBadge() {
  const items = useStore($cart);
  const totalItems = getCartTotalItems(items);

  return (
    <button
      onClick={() => toggleDrawer()}
      aria-label="Abrir Carrito de Compras"
      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] hover:text-white border border-white/[0.08] transition-all cursor-pointer group active:scale-95"
    >
      {/* Icono Bolsa de Compras */}
      <svg
        className="w-5 h-5 text-[#e5e2e1] group-hover:text-[#dc143c] transition-colors"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      {/* Badge Contador Carmesí */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-mono font-bold text-white bg-[#dc143c] rounded-full shadow-[0_0_12px_rgba(220,20,60,0.8)] border border-[#131313] animate-in zoom-in-75 duration-200">
          {totalItems}
        </span>
      )}
    </button>
  );
}
