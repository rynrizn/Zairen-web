import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $cart, getCartTotalItems, toggleDrawer } from '../../stores/cartStore';
import { ShoppingBag } from 'lucide-react';

export function CartBadge() {
  const [mounted, setMounted] = useState<boolean>(false);
  const items = useStore($cart);
  const totalItems = mounted ? getCartTotalItems(items) : 0;
  const [isBumping, setIsBumping] = useState<boolean>(false);
  const prevCount = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const count = getCartTotalItems($cart.get());
    prevCount.current = count;
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (totalItems > prevCount.current) {
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 320);
      prevCount.current = totalItems;
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItems;
  }, [totalItems, mounted]);

  return (
    <button
      type="button"
      onClick={() => toggleDrawer()}
      aria-label={`Abrir Carrito de Compras (${totalItems} artículos)`}
      title="Bolsa de compras"
      className={`relative flex items-center justify-center w-9 h-9 rounded-none bg-[#141416] hover:bg-[#201f1f] text-[#FAF9F6] hover:text-[#dc143c] border border-[#2A2A2A] hover:border-[#dc143c] transition-all cursor-pointer group active:scale-95 ${
        isBumping ? 'cart-bump border-[#dc143c] shadow-[0_0_20px_rgba(220,20,60,0.6)]' : ''
      }`}
    >
      <ShoppingBag
        className={`w-4 h-4 transition-colors ${
          isBumping ? 'text-[#dc143c]' : 'text-[#FAF9F6] group-hover:text-[#dc143c]'
        }`}
      />

      {mounted && totalItems > 0 && (
        <span
          className={`absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-bold text-white bg-[#dc143c] rounded-none shadow-[0_0_12px_rgba(220,20,60,0.8)] border border-[#141416] transition-transform duration-200 ${
            isBumping ? 'scale-125' : 'scale-100'
          }`}
        >
          {totalItems}
        </span>
      )}
    </button>
  );
}
