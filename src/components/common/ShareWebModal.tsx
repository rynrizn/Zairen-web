import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { siteConfig } from '../../config/site';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';

interface ShareWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareWebModal({ isOpen, onClose }: ShareWebModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>(siteConfig.cloudflareDomain || siteConfig.url);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const touchStartY = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin);
    }
  }, []);

  // Bloquear scroll de la página al abrir modal
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Código QR de alta resolución (360x360) para escaneo nítido
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=10&bgcolor=0e0e0e&color=FAF9F6&data=${encodeURIComponent(
    shareUrl
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('¡Enlace oficial copiado!', {
        description: shareUrl,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${siteConfig.name} // ${siteConfig.slogan}`,
          text: siteConfig.description,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setDragOffset(delta);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 90) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir tienda oficial"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[88vh] sm:max-h-[92vh] overflow-y-auto bg-[#0E0F11] sm:bg-[#141416] border-t-2 sm:border border-[#dc143c] sm:border-[#201f1f] rounded-none p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom duration-300"
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: dragOffset > 0 ? 'none' : 'transform 200ms ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Arrastre Móvil (Bottom-Sheet Drag Handle) */}
        <div className="sm:hidden w-12 h-1 bg-white/20 mx-auto -mt-1 mb-1 rounded-none select-none"></div>

        {/* Botón Cerrar Ortogonal */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 w-8 h-8 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10 border border-white/[0.08]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-none bg-[#dc143c]/15 text-[#ffb3b3] border border-[#dc143c]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-none bg-[#dc143c] animate-pulse"></span>
            COMPARTIR TIENDA OFICIAL
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[#FAF9F6] pt-1">
            {siteConfig.name}
          </h3>
          <p className="text-[11px] font-mono text-[#ac8888]">
            Evolución constante // Escanea para abrir la web
          </p>
        </div>

        {/* Contenedor Código QR Responsivo y Ampliado para Móvil */}
        <div className="relative p-3.5 rounded-none bg-[#0a0a0a] border border-[#201f1f] shadow-inner shrink-0">
          <img
            src={qrImageUrl}
            alt="Código QR de la tienda oficial"
            className="w-56 h-56 sm:w-52 sm:h-52 object-contain rounded-none filter contrast-105"
            loading="eager"
          />
          <div className="pt-1.5 text-[10px] font-mono text-[#ac8888] tracking-wider uppercase flex items-center justify-center">
            <span>Escaneo Directo con Cámara</span>
          </div>
        </div>

        {/* Input con URL & Botón Copiar */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-none bg-[#1c1b1b] border border-[#201f1f]">
            <span className="text-[11px] font-mono text-[#ac8888] truncate flex-1 text-left select-all">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[#dc143c] hover:bg-[#ff2d55] text-white border-[#dc143c] shadow-[0_2px_12px_rgba(220,20,60,0.4)]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Botones de Compartir en Canales */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Visita el catálogo oficial de ${siteConfig.name} aquí: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-none bg-[#1c1b1b] hover:bg-[#25D366]/20 hover:text-[#25D366] text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${siteConfig.name} // ${siteConfig.slogan}`
              )}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-none bg-[#1c1b1b] hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center"
            >
              <span>X / Twitter</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-2 rounded-none bg-[#1c1b1b] hover:bg-white/10 text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#ac8888]" />
              <span>Más...</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] font-mono text-[#5A5A5C] pt-1">
          ZAIREN LAB // TIENDA OFICIAL ONLINE
        </p>
      </div>
    </div>
  );
}
