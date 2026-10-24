import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { addItem } from '../../stores/cartStore';
import { MorphIcon } from '../ui/MorphIcon';
import { siteConfig, formatCurrency } from '../../config/site';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { ShareProductModal } from './ShareProductModal';

export interface DetalleProductoProps {
  id: string;
  nombre: string;
  slug?: string;
  precio: number;
  coleccion?: string;
  seccion?: string;
  tipo?: string;
  descripcion?: string;
  imagenes: string[];
  tallas?: string[];
  stockDisponible?: number;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'disponible' | 'agotado' | 'ninguno';
}

export function DetalleProducto({
  id,
  nombre,
  slug,
  precio,
  coleccion = 'DROP 01',
  seccion,
  tipo = 'Polera',
  descripcion = '',
  imagenes = [],
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  estadoComercial = 'disponible',
}: DetalleProductoProps) {
  // Asegurar mínimo 1 imagen
  const safeImages = imagenes.length > 0 ? imagenes : [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
  ];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedTalla, setSelectedTalla] = useState<string>(tallas[0] || 'M');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const isSoldOut = stockDisponible <= 0 || estadoComercial === 'agotado';
  const currentImage = safeImages[activeImageIndex] || safeImages[0];
  const seccionTexto = (seccion || coleccion).toUpperCase();

  // Color de badge de estado comercial según CatalogoV0
  const getEstadoBadge = () => {
    if (isSoldOut) {
      return { texto: 'AGOTADO', color: '#EF4444' };
    }
    switch (estadoComercial) {
      case 'nuevo':
        return { texto: 'NUEVO', color: '#10B981' };
      case 'oferta':
      case 'promocion':
        return { texto: 'OFERTA', color: '#F59E0B' };
      case 'preventa':
        return { texto: 'PREVENTA', color: '#8B5CF6' };
      case 'disponible':
        return { texto: 'DISPONIBLE', color: '#3B82F6' };
      default:
        return null;
    }
  };

  const badgeInfo = getEstadoBadge();

  // Tecla Escape para modales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        setShowShareModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (next) {
      toast.success('Prenda agregada a favoritos');
    } else {
      toast.info('Prenda removida de favoritos');
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) {
      toast.error('Prenda agotada temporalmente');
      return;
    }

    addItem({
      id,
      nombre,
      precio,
      talla: selectedTalla,
      imagen: currentImage,
      sku: slug?.toUpperCase(),
    });

    setIsAdded(true);
    toast.success(`${nombre} (${selectedTalla}) añadido a la bolsa`, {
      description: `Total: ${formatCurrency(precio)}`,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleDirectWhatsApp = () => {
    if (isSoldOut) return;
    const text = encodeURIComponent(
      `Hola Zairen Lab, me interesa adquirir: ${nombre} en talla ${selectedTalla}. ¿Está disponible?`
    );
    window.open(`https://wa.me/${siteConfig.whatsapp.number}?text=${text}`, '_blank');
  };

  const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="detail-bento-container">
      {/* Botón Volver Atrás & Breadcrumb Zen */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = '/';
            }
          }}
          className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold text-[#FAF9F6] bg-[#141416] hover:bg-[#dc143c] hover:text-white border border-[#201f1f] hover:border-[#dc143c] transition-all cursor-pointer group shadow-sm"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Volver al Catálogo</span>
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#ac8888]">
          <a href="/" className="hover:text-white transition-colors">Catálogo</a>
          <span>/</span>
          <span className="text-[#dc143c] font-bold uppercase">{seccionTexto}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[180px] sm:max-w-none">{nombre}</span>
        </nav>
      </div>

      {/* ======================================================== */}
      {/* BENTO GRID PRINCIPAL // DISEÑO CATALOGO V0               */}
      {/* ======================================================== */}
      <div className="detail-bento">

        {/* ===== BOX 1: HERO IMAGE (Spans rows) ===== */}
        <div className="bento-cell bento-image">
          <div className="bento-image-viewport">
            {/* Imagen Principal con transición y zoom suave */}
            <img
              key={activeImageIndex}
              src={getOptimizedImageUrl(currentImage, 1000, 1250)}
              alt={`${nombre} - Vista ${activeImageIndex + 1}`}
              className="w-full h-full object-contain sm:object-cover bento-image-active transition-transform duration-500 ease-out hover:scale-[1.03]"
            />

            {/* Badge de Estado con Color Dinámico */}
            {badgeInfo && (
              <span
                className="bento-badge"
                style={{ backgroundColor: badgeInfo.color }}
              >
                {badgeInfo.texto}
              </span>
            )}

            {/* Botón Pantalla Completa (Lightbox) */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              aria-label="Ver en pantalla completa"
              title="Ver en pantalla completa"
              className="bento-fullscreen-btn"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Flechas Ortogonales Zen Minimalistas (si hay > 1 imagen) */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-[#0e0e10]/85 hover:bg-[#dc143c] text-[#FAF9F6] hover:text-white flex items-center justify-center border border-white/10 hover:border-[#dc143c] transition-all cursor-pointer z-20 backdrop-blur-md shadow-lg"
                >
                  <svg className="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-[#0e0e10]/85 hover:bg-[#dc143c] text-[#FAF9F6] hover:text-white flex items-center justify-center border border-white/10 hover:border-[#dc143c] transition-all cursor-pointer z-20 backdrop-blur-md shadow-lg"
                >
                  <svg className="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Fila de Miniaturas Flotantes */}
            {safeImages.length > 1 && (
              <div className="detail-thumbnails">
                {safeImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`detail-thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                    title={`Vista ${idx + 1}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== BOX 2: NOMBRE, SECCIÓN & ACCIONES CABECERA ===== */}
        <div className="bento-cell bento-description">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="bento-section-tag">
                <span className="tag-crimson">{seccionTexto}</span>
                <span className="tag-sep"></span>
                <span className="tag-muted">{tipo}</span>
              </div>
              <h1 className="bento-title">{nombre}</h1>
            </div>

            {/* Botones Cabecera: Compartir en Redes (Sin QR) + Favoritos */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-label="Favorito"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-[#dc143c] border-[#dc143c] text-white'
                    : 'bg-white/5 border-white/10 text-[#FAF9F6] hover:border-[#dc143c] hover:text-[#dc143c]'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Compartir prenda en redes"
                aria-label="Compartir"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[#FAF9F6] border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:border-[#dc143c] hover:text-[#dc143c]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bento-footer-row">
            <span className="bento-id">ID: {slug || id}</span>
            {stockDisponible > 0 && stockDisponible <= 4 && (
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase animate-pulse">
                ⚡ Solo {stockDisponible} uds disponibles
              </span>
            )}
          </div>
        </div>

        {/* ===== BOX 3: DESCRIPCIÓN REAL DE LA PRENDA ===== */}
        <div className="bento-cell bento-composition">
          <span className="bento-cell-label">DESCRIPCIÓN</span>
          <p className="bento-desc">
            {descripcion && descripcion.trim() !== ''
              ? descripcion
              : 'Prenda experimental Zairen Lab. Algodón de alta densidad con estructura definida y corte arquitectónico oversized.'}
          </p>
        </div>

        {/* ===== BOX 4: SELECTOR DE TALLAS ===== */}
        <div className="bento-cell bento-sizes">
          <div className="bento-sizes-header">
            <span className="bento-cell-label" style={{ marginBottom: 0 }}>TALLA</span>
            <span className="bento-talla-active">{selectedTalla}</span>
          </div>

          <div className="bento-talla-grid">
            {tallas.map((talla) => {
              const isSelected = selectedTalla === talla;
              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => setSelectedTalla(talla)}
                  disabled={isSoldOut}
                  className={`talla-btn ${isSelected ? 'talla-selected' : ''}`}
                >
                  {talla}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== BOX 5: BARRA DE ACCIONES Y PRECIO ===== */}
        <div className="bento-cell bento-actions">
          <div className="bento-price-block">
            <span className="bento-cell-label" style={{ marginBottom: 0 }}>PRECIO</span>
            <span className="bento-price-value">Bs. {precio.toFixed(2)}</span>
          </div>

          <div className="bento-actions-btns">
            {isSoldOut ? (
              <button
                type="button"
                disabled
                className="bento-btn-cart bento-btn-disabled"
              >
                <span>Agotado</span>
                <span className="material-symbols-outlined text-[18px]">block</span>
              </button>
            ) : (
              <>
                {/* Botón WhatsApp Fiel a CatalogoV0 */}
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="bento-btn-wsp"
                  title="Consultar y ordenar por WhatsApp"
                >
                  <svg fill="currentColor" viewBox="0 0 32 32" className="w-4 h-4">
                    <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z" />
                  </svg>
                  <span>WhatsApp</span>
                  <span className="material-symbols-outlined text-[18px]">east</span>
                </button>

                {/* Botón Carrito / Bolsa */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="bento-btn-cart"
                  title="Añadir prenda al carrito de la tienda"
                >
                  <MorphIcon
                    state={isAdded ? 'B' : 'A'}
                    IconA={PlusIcon}
                    IconB={CheckIcon}
                    className="w-4 h-4 text-white"
                  />
                  <span>Bolsa ({selectedTalla})</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Modal Pantalla Completa (Lightbox Zoom) */}
      {isFullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Cerrar pantalla completa"
            className="absolute top-6 right-6 w-12 h-12 rounded-none bg-[#1c1b1b] text-white flex items-center justify-center text-xl hover:bg-[#dc143c] transition-colors cursor-pointer border border-white/[0.1]"
          >
            ✕
          </button>
          <img
            src={currentImage}
            alt={nombre}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-none shadow-2xl"
          />
        </div>
      )}

      {/* Modal de Compartir en Redes Sociales (Sin QR) */}
      <ShareProductModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        nombre={nombre}
        precio={precio}
        imagen={currentImage}
        slug={slug}
        id={id}
      />
    </div>
  );
}
