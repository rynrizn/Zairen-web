import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatCurrency } from '../../config/site';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  nombre: string;
  precio: number;
  imagen: string;
  slug?: string;
  id: string;
}

export function ShareProductModal({
  isOpen,
  onClose,
  nombre,
  precio,
  imagen,
  slug,
  id,
}: ShareProductModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const productPath = `/producto/${slug || id}`;
      setShareUrl(`${window.location.origin}${productPath}`);
    }
  }, [slug, id]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('¡Enlace del producto copiado!', {
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
          title: `${nombre} // ZAIREN LAB`,
          text: `Echa un vistazo a ${nombre} (${formatCurrency(precio)}) en Zairen Lab:`,
          url: shareUrl,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Echa un vistazo a *${nombre}* (${formatCurrency(precio)}) en Zairen Lab:\n${shareUrl}`
  )}`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${nombre} (${formatCurrency(precio)}) // Zairen Lab`
  )}&url=${encodeURIComponent(shareUrl)}`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
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
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#201f1f] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Encabezado */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dc143c]/15 text-[#ffb3b3] border border-[#dc143c]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
            COMPARTIR PRENDA
          </div>
          <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[#FAF9F6] pt-1 line-clamp-1">
            {nombre}
          </h3>
          <p className="text-xs font-mono text-[#dc143c] font-bold">
            {formatCurrency(precio)}
          </p>
        </div>

        {/* Preview Prenda Card */}
        <div className="flex items-center gap-3 w-full p-2.5 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-left">
          <img
            src={imagen}
            alt={nombre}
            className="w-16 h-20 object-cover rounded-xl shrink-0"
          />
          <div className="overflow-hidden">
            <span className="text-[10px] font-mono text-[#ac8888] uppercase block">
              ZAIREN LAB // 2026
            </span>
            <div className="text-xs font-display uppercase font-bold text-white truncate">
              {nombre}
            </div>
            <div className="text-[11px] font-mono text-[#ffb3b3] mt-0.5">
              Corte Boxy Oversized
            </div>
          </div>
        </div>

        {/* Input Enlace & Botón Copiar */}
        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#1c1b1b] border border-white/[0.08]">
            <span className="text-xs font-mono text-[#ac8888] truncate flex-1 text-left">
              {shareUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#dc143c] hover:bg-[#ff2d55] text-white shadow-[0_2px_12px_rgba(220,20,60,0.4)]'
              }`}
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Redes Sociales (Sin QR para productos según directiva del usuario) */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-xl bg-[#1c1b1b] hover:bg-[#25D366]/20 hover:text-[#25D366] text-[#e5e2e1] border border-white/[0.06] text-[11px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>WhatsApp</span>
            </a>

            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-xl bg-[#1c1b1b] hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] text-[#e5e2e1] border border-white/[0.06] text-[11px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>X (Twitter)</span>
            </a>

            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 rounded-xl bg-[#1c1b1b] hover:bg-[#1877F2]/20 hover:text-[#1877F2] text-[#e5e2e1] border border-white/[0.06] text-[11px] font-mono uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Facebook</span>
            </a>
          </div>

          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2 rounded-xl bg-[#201f1f] hover:bg-[#2a2a2a] text-[#FAF9F6] border border-white/[0.08] text-xs font-mono uppercase tracking-wider font-semibold transition-all cursor-pointer"
          >
            Más opciones de compartir...
          </button>
        </div>
      </div>
    </div>
  );
}
