import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DetalleProducto, type DetalleProductoProps } from './DetalleProducto';

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
  const touchStartY = useRef<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Cerrar con animación suave
  const handleAnimatedClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setDragOffset(0);
      onClose();
      if (originRef) {
        originRef.focus();
      }
    }, 220);
  }, [onClose, originRef]);

  // Tecla Escape y Bloqueo de Scroll en el Body
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleAnimatedClose();
      }

      // Focus trap accesible
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
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Enfocar el modal al abrir
    const timer = setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input'
      );
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, handleAnimatedClose]);

  // Manejo de gestos táctiles de arrastre hacia abajo en móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      // Arrastrando hacia abajo
      setDragOffset(diff * 0.65);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffset > 90) {
      handleAnimatedClose();
    } else {
      setDragOffset(0);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center overflow-hidden transition-opacity duration-200"
    >
      {/* 1. Backdrop con Desenfoque Zen Oscurecido */}
      <div
        role="button"
        tabIndex={-1}
        aria-label="Cerrar modal de producto"
        onClick={handleAnimatedClose}
        className={`fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 2. Contenedor de la Ficha (Bottom-Sheet en Móvil, Bento Dialog en Escritorio) */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: dragOffset > 0 ? 'none' : 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full max-w-5xl max-h-[92vh] md:max-h-[88vh] bg-[#0A0A0A] border-t-2 md:border border-[#dc143c]/50 shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col z-10 overflow-hidden ${
          isClosing
            ? 'translate-y-full md:translate-y-6 opacity-0'
            : 'translate-y-0 opacity-100 animate-in slide-in-from-bottom duration-250'
        }`}
      >
        {/* Cabecera / Barra de Arrastre Móvil */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[#141416]/95 backdrop-blur shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
            <span id="modal-product-title" className="font-mono text-xs text-[#FAF9F6] uppercase font-bold tracking-wider">
              {product.nombre || 'FICHA DE PRODUCTO'}
            </span>
          </div>

          {/* Tirador táctil en móvil */}
          <div className="md:hidden flex-1 flex justify-center py-1">
            <span className="w-10 h-1 bg-[#444] rounded-full"></span>
          </div>

          {/* Botón X de Cierre Ortogonal */}
          <button
            type="button"
            onClick={handleAnimatedClose}
            aria-label="Cerrar ventana de producto"
            className="w-8 h-8 flex items-center justify-center bg-[#1c1b1b] hover:bg-[#dc143c] text-[#ac8888] hover:text-white font-mono text-sm transition-colors border border-white/[0.08] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Contenido con Scroll Interno Contenido */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin-hover">
          <DetalleProducto {...product} />
        </div>
      </div>
    </div>
  );
}
