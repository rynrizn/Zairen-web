import React, { useState } from 'react';
import { ShareWebModal } from './ShareWebModal';
import { QrCode } from 'lucide-react';

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
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Compartir y ver QR"
        className={`relative flex items-center justify-center rounded-none transition-all cursor-pointer ${className}`}
      >
        <QrCode className="w-4 h-4 text-[#FAF9F6] group-hover:text-[#dc143c] transition-colors" />
        {showText && <span className="ml-2 text-xs font-mono uppercase tracking-wider">Compartir</span>}
      </button>

      <ShareWebModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
