import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DetalleProducto, type DetalleProductoProps } from './DetalleProducto';
import { ModalPortal } from '../ui/ModalPortal';
import { X } from 'lucide-react';

interface ModalDetalleProductoProps {
  isOpen: boolean;
  onClose: () => void;
  product: DetalleProductoProps | null;
  originRef?: HTMLElement | null;
}

export function ModalDetalleProducto({
  isOpen,
  onClose,
  product,
  originRef,
}: ModalDetalleProductoProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number>(0);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Cerrar con animación fluida y devolver el foco
  const handleAnimatedClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragOffset(0);
      onClose();
      if (originRef) {
        originRef.focus();
      } else if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    }, 200);
  }, [onClose, originRef]);

  // Accesibilidad: Guardar foco, Trampa de foco, Tecla ESC y Bloqueo de Scroll
  useEffect(() => {
    if (!isOpen) return;

    if (typeof document !== 'undefined') {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto-enfocar botón de cierre al abrir
    const focusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleAnimatedClose();
        return;
      }

      // Focus trap accesible dentro del modal
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

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
    };
  }, [isOpen, handleAnimatedClose]);

  // Gestos táctiles en móvil (Bottom Sheet deslizar hacia abajo para cerrar)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragOffset(diff * 0.7);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 80) {
      handleAnimatedClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        onClick={handleAnimatedClose}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      >
        {/* Contenedor del Modal: Bottom-Sheet en móvil, Ventana Bento en PC */}
        <div
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: dragOffset > 0 ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease',
          }}
          className={`relative w-full max-w-5xl max-h-[92dvh] sm:max-h-[88dvh] bg-[#0A0A0A] border-t sm:border border-[#201f1f] rounded-none shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col z-10 overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-0 ${
            isClosing
              ? 'translate-y-full sm:translate-y-6 opacity-0'
              : 'translate-y-0 opacity-100 animate-in slide-in-from-bottom duration-250'
          }`}
        >
          {/* Tirador táctil en móvil (Bottom Sheet Drag Handle) */}
          <div className="sm:hidden w-12 h-1 bg-white/20 mx-auto mt-2 mb-1 rounded-none select-none shrink-0" />

          {/* Cabecera / Barra Superior con Título y Botón Cerrar "X" DENTRO del modal */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#201f1f] bg-[#141416]/95 backdrop-blur shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
              <span id="modal-product-title" className="font-mono text-xs text-[#FAF9F6] uppercase font-bold tracking-wider truncate max-w-[240px] sm:max-w-md">
                {product.nombre || 'FICHA DE PRENDA'}
              </span>
            </div>

            {/* Botón X de Cierre Ortogonal DENTRO de la cabecera */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleAnimatedClose}
              aria-label="Cerrar ventana de producto"
              className="w-8 h-8 rounded-none bg-[#141416] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#201f1f] shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido con Scroll Interno Contenido */}
          <div className="overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin-hover">
            <DetalleProducto {...product} isModal={true} />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
