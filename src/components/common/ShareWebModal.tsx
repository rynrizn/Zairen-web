import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { siteConfig } from '../../config/site';

interface ShareWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareWebModal({ isOpen, onClose }: ShareWebModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>(siteConfig.cloudflareDomain || siteConfig.url);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&bgcolor=0e0e0e&color=FAF9F6&data=${encodeURIComponent(
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
    } catch (err) {
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
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-y-auto bg-[#141416] border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col items-center text-center space-y-4 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#201f1f] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Encabezado */}
        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#dc143c]/15 text-[#ffb3b3] border border-[#dc143c]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c] animate-pulse"></span>
            COMPARTIR TIENDA OFICIAL
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[#FAF9F6] pt-1">
            {siteConfig.name}
          </h3>
          <p className="text-[11px] font-mono text-[#ac8888]">
            Evolución constante // Escanea para abrir en móvil
          </p>
        </div>

        {/* Contenedor Código QR Responsivo */}
        <div className="relative p-2.5 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] shadow-inner shrink-0">
          <img
            src={qrImageUrl}
            alt="Código QR de la tienda oficial"
            className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl"
            loading="lazy"
          />
          <div className="py-1 text-[10px] font-mono text-[#ac8888] tracking-wider uppercase flex items-center justify-center">
            <span>Escaneo Directo</span>
          </div>
        </div>

        {/* Input con URL & Botón Copiar */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#1c1b1b] border border-white/[0.08]">
            <span className="text-[11px] font-mono text-[#ac8888] truncate flex-1 text-left">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#dc143c] hover:bg-[#ff2d55] text-white shadow-[0_2px_12px_rgba(220,20,60,0.4)]'
              }`}
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Botones de Redes Sociales */}
          <div className="grid grid-cols-3 gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Visita el catálogo oficial de ${siteConfig.name} aquí: ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2.5 rounded-xl bg-[#1c1b1b] hover:bg-[#25D366]/20 hover:text-[#25D366] text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center"
            >
              <span>WhatsApp</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${siteConfig.name} // ${siteConfig.slogan}`
              )}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2.5 rounded-xl bg-[#1c1b1b] hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center"
            >
              <span>X / Twitter</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2 px-2.5 rounded-xl bg-[#1c1b1b] hover:bg-white/10 text-[#e5e2e1] border border-white/[0.06] text-[10px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center cursor-pointer"
            >
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
