import React from 'react';
import { useStore } from '@nanostores/react';
import { $favorites } from '../../stores/favoritesStore';
import { Heart } from 'lucide-react';

export function FavoritesBadge() {
  const favorites = useStore($favorites);
  const count = favorites.length;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;

    if (window.location.pathname === '/' || window.location.pathname === '/catalogo') {
      window.dispatchEvent(new CustomEvent('zairen-filter-favorites'));
      const catEl = document.getElementById('catalogo') || document.querySelector('section');
      if (catEl) {
        catEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/?filtro=favoritos#catalogo';
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Ver Prendas Favoritas (${count})`}
      title="Ver mis favoritos"
      className="relative flex items-center justify-center w-9 h-9 rounded-none bg-[#141416] hover:bg-[#201f1f] text-[#FAF9F6] hover:text-[#dc143c] border border-[#2A2A2A] hover:border-[#dc143c] transition-all cursor-pointer group active:scale-95"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          count > 0 ? 'text-[#dc143c] fill-[#dc143c]' : 'text-[#FAF9F6] group-hover:text-[#dc143c]'
        }`}
      />

      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-bold text-white bg-[#dc143c] rounded-none shadow-[0_0_10px_rgba(220,20,60,0.8)] border border-[#141416]">
          {count}
        </span>
      )}
    </button>
  );
}
