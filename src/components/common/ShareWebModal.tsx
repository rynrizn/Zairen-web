import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { siteConfig } from '../../config/site';
import { ModalPortal } from '../ui/ModalPortal';
import { X, Copy, Check, Share2, MessageCircle, Download } from 'lucide-react';

interface ShareWebModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareWebModal({ isOpen, onClose }: ShareWebModalProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>(siteConfig.cloudflareDomain || siteConfig.url);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const touchStartY = useRef<number>(0);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Determinar URL de la tienda
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin);
    }
  }, []);

  // Generar código QR en memoria inmediatamente al abrirse
  useEffect(() => {
    if (!isOpen) return;

    setIsGenerating(true);
    QRCode.toDataURL(shareUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('[QR] Error al generar código QR en memoria:', err);
        setIsGenerating(false);
      });
  }, [isOpen, shareUrl]);

  // Accesibilidad: Trampa de foco, Tecla ESC, Bloqueo de Scroll y Restauración de foco
  useEffect(() => {
    if (!isOpen) return;

    // Guardar elemento enfocado previamente para restaurar al cerrar
    if (typeof document !== 'undefined') {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-enfocar botón de cierre al abrir
    const focusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trampa de foco (Focus Trap)
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Descarga de código QR en alta resolución (1024x1024 px PNG)
  const handleDownloadQR = async () => {
    try {
      const highResDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 1024,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      const link = document.createElement('a');
      link.download = 'zairen-lab-qr.png';
      link.href = highResDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Código QR descargado en alta resolución (1024x1024 px)');
    } catch {
      toast.error('No se pudo generar la descarga del QR');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('¡Enlace copiado al portapapeles!', {
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
          title: `${siteConfig.name} // Catálogo Oficial`,
          text: `Visita la tienda oficial de ${siteConfig.name}:`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  // Deslizamiento en móvil (Bottom sheet pull down to close)
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
    if (dragOffset > 80) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Contenedor de la Tarjeta del Modal con 'relative' estricto para anclar la 'X' dentro del cuadro */}
        <div
          ref={modalRef}
          className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-[#0A0A0A] border-t sm:border border-[#201f1f] rounded-none p-5 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom duration-300 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6"
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
          <div className="sm:hidden w-12 h-1 bg-white/20 mx-auto -mt-1 mb-1 rounded-none select-none" />

          {/* Botón Cerrar Ortogonal DENTRO del cuadro en la esquina superior derecha */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-none bg-[#141416] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer z-20 border border-[#201f1f] shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Encabezado */}
          <div className="space-y-1 pt-1 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-none bg-[#dc143c]/15 text-[#ffb3b3] border border-[#dc143c]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
              <span className="w-1.5 h-1.5 rounded-none bg-[#dc143c] animate-pulse" />
              COMPARTIR TIENDA OFICIAL
            </div>
            <h3 id="share-modal-title" className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[#FAF9F6] pt-1">
              {siteConfig.name}
            </h3>
            <p className="text-[11px] font-mono text-[#ac8888]">
              Evolución constante // Escanea para ingresar al catálogo
            </p>
          </div>

          {/* Contenedor Código QR Local (Generación instantánea DataURL en memoria) */}
          <div className="relative p-3 rounded-none bg-white border border-[#201f1f] shadow-inner shrink-0 flex items-center justify-center min-w-[240px] min-h-[240px]">
            {isGenerating || !qrCodeDataUrl ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-10">
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-none animate-spin" />
              </div>
            ) : (
              <img
                src={qrCodeDataUrl}
                alt="Código QR de la tienda oficial"
                className="w-56 h-56 sm:w-52 sm:h-52 object-contain block filter contrast-105"
                loading="eager"
              />
            )}
          </div>

          <div className="text-[10px] font-mono text-[#ac8888] tracking-wider uppercase -mt-2">
            Escaneo instantáneo con cámara móvil
          </div>

          {/* Botón Descargar QR en Alta Resolución */}
          <button
            type="button"
            onClick={handleDownloadQR}
            className="w-full py-2 px-3 rounded-none bg-[#141416] hover:bg-[#201f1f] border border-[#201f1f] hover:border-[#dc143c] text-xs font-mono text-[#FAF9F6] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#dc143c]" />
            <span>Descargar QR en Alta Calidad (PNG)</span>
          </button>

          {/* Input con URL & Botón Copiar */}
          <div className="w-full space-y-2.5">
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-none bg-[#141416] border border-[#201f1f]">
              <span className="text-[11px] font-mono text-[#ac8888] truncate flex-1 text-left select-all">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-[#dc143c] hover:bg-[#b01030] text-white border-[#dc143c]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Canales Directos de Compartir */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Visita el catálogo oficial de ${siteConfig.name} aquí: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-2 rounded-none bg-[#141416] hover:bg-[#201f1f] text-[#FAF9F6] border border-[#201f1f] text-[10px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2.5 px-2 rounded-none bg-[#141416] hover:bg-[#201f1f] text-[#FAF9F6] border border-[#201f1f] text-[10px] font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#dc143c]" />
                <span>Más Opciones...</span>
              </button>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#5A5A5C] pt-1">
            ZAIREN LAB // TIENDA OFICIAL ONLINE
          </p>
        </div>
      </div>
    </ModalPortal>
  );
}
