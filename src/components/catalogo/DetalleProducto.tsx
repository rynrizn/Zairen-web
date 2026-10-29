import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { toast } from 'sonner';
import { addItem } from '../../stores/cartStore';
import { $favorites, toggleFavorite } from '../../stores/favoritesStore';
import { MorphIcon } from '../ui/MorphIcon';
import {
  Maximize2,
  MessageCircle,
  ArrowRight,
  Heart,
  Share2,
  Ban,
  Headphones,
  ExternalLink,
  X,
} from 'lucide-react';
import { siteConfig, formatCurrency } from '../../config/site';
import { generateWhatsAppProductUrl } from '../../utils/whatsapp';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { ShareProductModal } from './ShareProductModal';
import {
  getActiveChannels,
  buildChannelActionUrl,
  DEFAULT_CONTACT_CHANNELS,
  type ContactChannel,
} from '../../lib/contactChannels';

export interface DetalleProductoProps {
  id?: string;
  nombre?: string;
  slug?: string;
  precio?: number;
  coleccion?: string;
  seccion?: string;
  tipo?: string;
  descripcion?: string;
  subtitulo?: string;
  imagen?: string;
  imagenDorsal?: string;
  imagenes?: string[];
  tallas?: string[];
  stockDisponible?: number;
  stockPorTalla?: Record<string, number>;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'disponible' | 'agotado' | 'ninguno';
}

const FALLBACK_IMAGE = 'https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp';

export function DetalleProducto({
  id = '',
  nombre = 'Prenda Zairen',
  slug,
  precio = 0,
  coleccion = 'General',
  seccion,
  tipo = 'Polera',
  descripcion = '',
  subtitulo = '',
  imagen,
  imagenDorsal,
  imagenes = [],
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 0,
  stockPorTalla,
  estadoComercial = 'disponible',
}: DetalleProductoProps) {
  // 1. Normalización y blindaje de datos nulos
  const safeId = id || slug || '';
  const safeSlug = slug || id || 'prenda';
  const safeNombre = nombre?.trim() || 'Prenda de Autor';
  const safePrecio = typeof precio === 'number' && !isNaN(precio) && precio >= 0 ? precio : Number(precio) || 0;
  const coleccionSegura = coleccion?.trim() || 'General';
  const seccionTexto = (seccion || coleccionSegura).toUpperCase();
  const tipoSeguro = tipo?.trim() || 'Polera';

  const [activeChannels, setActiveChannels] = useState<ContactChannel[]>([]);

  useEffect(() => {
    const syncChannels = () => {
      try {
        const raw = localStorage.getItem('zairen_contact_channels');
        const list = raw ? JSON.parse(raw) : DEFAULT_CONTACT_CHANNELS;
        setActiveChannels(getActiveChannels(list));
      } catch {
        setActiveChannels(getActiveChannels(DEFAULT_CONTACT_CHANNELS));
      }
    };
    syncChannels();
    window.addEventListener('zairen-config-updated', syncChannels);
    return () => window.removeEventListener('zairen-config-updated', syncChannels);
  }, []);

  // Sincronizar título de la pestaña con el nombre de la prenda
  useEffect(() => {
    if (typeof document !== 'undefined' && safeNombre) {
      const prevTitle = document.title;
      document.title = safeNombre;
      return () => {
        document.title = prevTitle;
      };
    }
  }, [safeNombre]);

  // Si no hay id ni slug, mostrar estado de contingencia
  if (!safeId && !slug) {
    return (
      <div className="detail-bento-container py-12 flex flex-col items-center text-center">
        <div className="border border-[#201f1f] bg-[#141416] p-8 max-w-md w-full relative">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#dc143c]"></div>
          <span className="text-xs font-mono font-bold text-[#dc143c] uppercase tracking-widest block mb-2">
            ERROR // PRENDA NO DISPONIBLE
          </span>
          <h2 className="font-display text-xl font-bold text-[#FAF9F6] uppercase mb-4">
            Prenda no encontrada
          </h2>
          <p className="text-xs font-body text-[#ac8888] mb-6">
            La prenda solicitada no cuenta con un identificador válido o ha sido retirada del catálogo.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FAF9F6] hover:bg-[#dc143c] text-[#0A0A0A] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ← Volver al Catálogo
          </a>
        </div>
      </div>
    );
  }

  // Consolidación de imágenes del producto evitando que el logo fallback desplace fotos reales
  const candidateImages = [
    ...(Array.isArray(imagenes) ? imagenes : []),
    imagen,
    imagenDorsal,
  ].filter((img): img is string => typeof img === 'string' && img.trim().length > 0);

  const realImages = candidateImages.filter((img) => !img.includes('zairen_logo_oficial_nehjev'));
  const safeImages = realImages.length > 0
    ? Array.from(new Set(realImages))
    : (candidateImages.length > 0 ? Array.from(new Set(candidateImages)) : [FALLBACK_IMAGE]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const currentImage = safeImages[Math.min(activeImageIndex, safeImages.length - 1)] || safeImages[0];

  // Sanitización de tallas
  const tallasDisponibles = Array.isArray(tallas) && tallas.length > 0 ? tallas : ['S', 'M', 'L', 'XL'];

  const getStockForTalla = (t: string) => {
    if (stockPorTalla && typeof stockPorTalla === 'object' && Object.keys(stockPorTalla).length > 0) {
      return Number(stockPorTalla[t]) || 0;
    }
    if (tallasDisponibles.length === 1) return Number(stockDisponible) || 0;
    return (Number(stockDisponible) || 0) > 0 ? 1 : 0;
  };

  const totalStockAvailable = (stockPorTalla && typeof stockPorTalla === 'object' && Object.keys(stockPorTalla).length > 0)
    ? Object.values(stockPorTalla).reduce((a, b) => a + (Number(b) || 0), 0)
    : (Number(stockDisponible) || 0);

  const isSoldOut = totalStockAvailable <= 0 || estadoComercial === 'agotado';

  const firstAvailableTalla = tallasDisponibles.find((t) => getStockForTalla(t) > 0) || tallasDisponibles[0] || 'M';
  const [selectedTalla, setSelectedTalla] = useState<string>(firstAvailableTalla);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const favorites = useStore($favorites);
  const isFavorite = favorites.includes(safeId) || (!!safeSlug && favorites.includes(safeSlug));

  useEffect(() => {
    const available = tallasDisponibles.find((t) => getStockForTalla(t) > 0);
    if (available && getStockForTalla(selectedTalla) <= 0) {
      setSelectedTalla(available);
    }
  }, [tallasDisponibles, stockPorTalla, stockDisponible]);

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
    toggleFavorite(safeId, safeSlug, safeNombre);
  };

  const handleAddToCart = () => {
    const stockForSelected = getStockForTalla(selectedTalla);
    if (isSoldOut || stockForSelected <= 0) {
      toast.error(`La talla ${selectedTalla} está agotada`);
      return;
    }

    addItem({
      id: safeId,
      nombre: safeNombre,
      precio: safePrecio,
      talla: selectedTalla,
      imagen: currentImage,
      sku: safeSlug.toUpperCase(),
      stockDisponible: stockForSelected,
    });

    setIsAdded(true);
    toast.success(`${safeNombre} (${selectedTalla}) añadido a la bolsa`, {
      description: `Total: ${formatCurrency(safePrecio)}`,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const handleDirectWhatsApp = () => {
    if (isSoldOut) return;
    const url = typeof window !== 'undefined' ? window.location.href : `/producto/${safeSlug}`;
    const whatsappUrl = generateWhatsAppProductUrl({
      nombre: safeNombre,
      talla: selectedTalla,
      url,
    });
    window.open(whatsappUrl, '_blank');
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
        <a
          href="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold text-[#FAF9F6] bg-[#141416] hover:bg-[#dc143c] hover:text-white border border-[#201f1f] hover:border-[#dc143c] transition-all cursor-pointer group shadow-sm rounded-none"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
          <span>Volver al Catálogo</span>
        </a>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#ac8888]">
          <a href="/" className="hover:text-white transition-colors">Catálogo</a>
          <span>/</span>
          <span className="text-[#dc143c] font-bold uppercase">{seccionTexto}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[180px] sm:max-w-none">{safeNombre}</span>
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
              alt={`${safeNombre} - Vista ${activeImageIndex + 1}`}
              className="w-full h-full object-contain bento-image-active transition-transform duration-500 ease-out hover:scale-[1.03]"
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
              aria-label="Ver en pantalla completa (Zoom)"
              title="Ver en pantalla completa (Zoom)"
              className="bento-fullscreen-btn z-30"
            >
              <Maximize2 className="w-4 h-4 text-white" />
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
                <span className="tag-muted">{tipoSeguro}</span>
              </div>
              <h1 className="bento-title">{safeNombre}</h1>
            </div>

            {/* Botones Cabecera: Compartir en Redes (Sin QR) + Favoritos (Ortogonales) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFavorite}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                aria-label="Favorito"
                className={`w-9 h-9 rounded-none border flex items-center justify-center transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-[#dc143c] border-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.6)]'
                    : 'bg-white/5 border-white/10 text-[#FAF9F6] hover:border-[#dc143c] hover:text-[#dc143c]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Compartir prenda en redes"
                aria-label="Compartir"
                className="w-9 h-9 rounded-none bg-white/5 hover:bg-white/10 text-[#FAF9F6] border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:border-[#dc143c] hover:text-[#dc143c]"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bento-footer-row">
            <span className="bento-id">ID: {safeSlug}</span>
          </div>
        </div>

        {/* ===== BOX 3: DESCRIPCIÓN REAL DE LA PRENDA ===== */}
        <div className="bento-cell bento-composition">
          <span className="bento-cell-label">DESCRIPCIÓN</span>
          <p className="bento-desc">
            {descripcion && descripcion.trim() !== ''
              ? descripcion
              : subtitulo && subtitulo.trim() !== ''
              ? subtitulo
              : '100% Algodón Calidad Premium'}
          </p>
        </div>

        {/* ===== BOX 4: SELECTOR DE TALLAS ===== */}
        <div className="bento-cell bento-sizes">
          <div className="bento-sizes-header">
            <span className="bento-cell-label" style={{ marginBottom: 0 }}>TALLA</span>
            <span className="bento-talla-active">{selectedTalla}</span>
          </div>

          <div className="bento-talla-grid">
            {tallasDisponibles.map((talla) => {
              const isSelected = selectedTalla === talla;
              const stockThisTalla = getStockForTalla(talla);
              const isTallaAgotada = isSoldOut || stockThisTalla <= 0;
              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => !isTallaAgotada && setSelectedTalla(talla)}
                  disabled={isTallaAgotada}
                  title={isTallaAgotada ? `Talla ${talla} agotada` : `Talla ${talla}`}
                  className={`talla-btn ${
                    isTallaAgotada
                      ? 'talla-disabled line-through opacity-30 cursor-not-allowed pointer-events-none'
                      : isSelected
                      ? 'talla-selected'
                      : ''
                  }`}
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
            <span className="bento-price-value">{formatCurrency(safePrecio)}</span>
          </div>

          <div className="bento-actions-btns">
            {isSoldOut ? (
              <button
                type="button"
                disabled
                className="bento-btn-cart bento-btn-disabled"
              >
                <Ban className="w-4 h-4 mr-1 text-[#ac8888]" />
                <span>Agotado</span>
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
                  <ArrowRight className="w-4 h-4 ml-1" />
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

        {/* ===== BOX 6: CANALES DE CONTACTO OFICIALES (Sin duplicar WhatsApp) ===== */}
        {activeChannels.filter((c) => !c.name.toLowerCase().includes('whatsapp') && !c.id.toLowerCase().includes('whatsapp')).length > 0 && (
          <div className="bento-cell col-span-full bg-[#141416] p-5 border border-[#201f1f]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#dc143c]" />
                <span className="bento-cell-label" style={{ marginBottom: 0 }}>
                  CANALES DE CONTACTO DIRECTO
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#ac8888] uppercase">
                Atención Inmediata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {activeChannels
                .filter((c) => !c.name.toLowerCase().includes('whatsapp') && !c.id.toLowerCase().includes('whatsapp'))
                .map((c) => (
                  <a
                    key={c.id}
                    href={buildChannelActionUrl(c, {
                      nombre: safeNombre,
                      precio: safePrecio,
                      moneda: 'Bs',
                      url: typeof window !== 'undefined' ? window.location.href : '',
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1c1b1b] hover:bg-[#201f1f] border border-white/[0.08] hover:border-[#dc143c] flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-none bg-emerald-400 shrink-0"></span>
                      <span className="font-mono text-xs font-bold text-[#FAF9F6] uppercase truncate group-hover:text-[#dc143c]">
                        {c.name}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#ac8888] group-hover:text-white shrink-0" />
                  </a>
                ))}
            </div>
          </div>
        )}
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
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImage}
            alt={safeNombre}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-none shadow-2xl"
          />
        </div>
      )}

      {/* Modal de Compartir en Redes Sociales (Sin QR) */}
      <ShareProductModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        nombre={safeNombre}
        precio={safePrecio}
        imagen={currentImage}
        slug={safeSlug}
        id={safeId}
      />
    </div>
  );
}
