import React, { useState } from 'react';
import { ShareWebModal } from './ShareWebModal';

interface ShareButtonProps {
  className?: string;
  showText?: boolean;
}

export function ShareButton({ className = '', showText = false }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Compartir tienda oficial y ver código QR"
        title="Compartir y ver QR"
        className={`relative flex items-center justify-center rounded-full transition-all cursor-pointer ${className}`}
      >
        <svg
          className="w-5 h-5 text-[#e5e2e1] group-hover:text-[#dc143c] transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* QR / Share hybrid icon */}
          <rect width="6" height="6" x="3" y="3" rx="1" />
          <rect width="6" height="6" x="15" y="3" rx="1" />
          <rect width="6" height="6" x="3" y="15" rx="1" />
          <path d="M15 15h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM19 15h2v2h-2z" />
        </svg>
        {showText && <span className="ml-2 text-xs font-mono uppercase tracking-wider">Compartir</span>}
      </button>

      <ShareWebModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
