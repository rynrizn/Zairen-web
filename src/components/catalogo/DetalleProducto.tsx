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
  coleccion: string;
  descripcion?: string;
  imagenes: string[];
  tallas?: string[];
  stockDisponible?: number;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'ninguno';
  especificaciones?: Record<string, string>;
}

export function DetalleProducto({
  id,
  nombre,
  slug,
  precio,
  coleccion,
  descripcion = 'Polera boxy oversized confeccionada en algodón pesado 280 GSM con caída estructurada y acabado prémium.',
  imagenes = [],
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  estadoComercial = 'ninguno',
  especificaciones = {
    'Tejido Principal': '100% Algodón Peinado 280-420 GSM',
    'Confección': 'Cuerpo tubular sin costuras laterales',
    'Cuello': 'Ribete acanalado 3.5 cm con memoria spandex',
    'Estampado': 'Serigrafía al agua tacto cero 4 tintas',
    'Silueta': 'Boxy Oversized con caída de hombro pronunciada',
    'Origen': 'Taller Zairen Lab // Tarija, Bolivia',
    'Cuidados': 'Lavar en frío con prendas oscuras. No planchar sobre el estampado.',
  },
}: DetalleProductoProps) {
  // Asegurar mínimo 1 imagen
  const safeImages = imagenes.length > 0 ? imagenes : [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
  ];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedTalla, setSelectedTalla] = useState<string>(tallas[0] || 'M');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const isSoldOut = stockDisponible <= 0;
  const currentImage = safeImages[activeImageIndex] || safeImages[0];

  // Tecla Escape para cerrar fullscreen
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
    const statusNote = estadoComercial === 'preventa' ? ' (PRE-ORDER)' : '';
    const text = encodeURIComponent(
      `Hola Zairen Lab, me interesa adquirir la prenda:\n\n🏷️ *${nombre}*${statusNote}\n📏 Talla: *${selectedTalla}*\n💰 Precio: *${formatCurrency(
        precio
      )}*\n\n¿Tienen disponibilidad para despacho inmediato en Tarija / Bolivia?`
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
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-6">
      {/* Breadcrumbs de Navegación */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[#ac8888] mb-8">
        <a href="/" className="hover:text-white transition-colors">Inicio</a>
        <span>/</span>
        <a href="/catalogo" className="hover:text-white transition-colors">Catálogo</a>
        <span>/</span>
        <span className="text-[#dc143c] font-bold uppercase">{coleccion}</span>
        <span>/</span>
        <span className="text-white truncate max-w-[200px] sm:max-w-none">{nombre}</span>
      </nav>

      {/* Bento Grid Principal // Estilo PublicOldZairen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: GALERÍA DE 1 A 5 IMÁGENES (7 cols)    */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Viewport Principal de Imagen (Proporción 4:5) */}
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#141416] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.8)] group select-none">
            {/* Imagen Activa con Transición */}
            <img
              src={getOptimizedImageUrl(currentImage, 1100, 1375)}
              alt={`${nombre} - Vista ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

            {/* Badges Flotantes de Estado */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              {isSoldOut ? (
                <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#7f1d1d]/90 text-[#f87171] border border-[#dc2626]/40 backdrop-blur-md shadow-md">
                  SOLD OUT // AGOTADO
                </span>
              ) : (
                <>
                  {estadoComercial === 'preventa' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#6d28d9]/90 text-[#ddd6fe] border border-[#8b5cf6]/40 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                      PRE-ORDER ⚡
                    </span>
                  )}
                  {estadoComercial === 'promocion' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#dc143c]/90 text-white border border-[#ff4d6d]/40 backdrop-blur-md shadow-[0_0_12px_rgba(220,20,60,0.6)]">
                      PROMOCIÓN 🏷️
                    </span>
                  )}
                  {estadoComercial === 'oferta' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#b91c1c]/90 text-[#fecaca] border border-[#ef4444]/40 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      OFERTA 💥
                    </span>
                  )}
                  {estadoComercial === 'nuevo' && (
                    <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#047857]/90 text-[#a7f3d0] border border-[#10b981]/40 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                      NUEVO DROP 🔥
                    </span>
                  )}
                  {stockDisponible <= 4 ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#78350f]/90 text-[#fbbf24] border border-[#d97706]/40 backdrop-blur-md animate-pulse">
                      ÚLTIMAS {stockDisponible} UDS
                    </span>
                  ) : estadoComercial === 'ninguno' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.6)]">
                      DISPONIBLE EN STOCK
                    </span>
                  ) : null}
                </>
              )}
            </div>

            {/* Botón Pantalla Completa (Zoom Lightbox) */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              aria-label="Ver imagen en pantalla completa"
              title="Pantalla Completa"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-[#dc143c] text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 z-10"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Controles Prev / Next si hay múltiples fotos */}
            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10"
                >
                  ›
                </button>
              </>
            )}

            {/* Tira Flotante de Miniaturas estilo PublicOldZairen */}
            {safeImages.length > 1 && (
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-2 p-2 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 z-10">
                {safeImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`Seleccionar vista ${idx + 1}`}
                    className={`relative w-12 h-14 md:w-14 md:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#dc143c] scale-105 shadow-[0_0_12px_rgba(220,20,60,0.6)]'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: PANEL DE COMPRA & BENTO CARDS (5 cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Card Principal: Título, Precio y Compartir */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#141416]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-[#dc143c] uppercase tracking-widest font-bold block">
                  {coleccion} // ARCHIVE 2026
                </span>
                <h1 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-tight text-[#FAF9F6] mt-1">
                  {nombre}
                </h1>
              </div>

              {/* Botón Compartir Prenda (Abre ShareProductModal) */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                title="Compartir prenda en redes sociales"
                aria-label="Compartir prenda"
                className="w-10 h-10 rounded-full bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#FAF9F6] border border-white/[0.1] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Precio & Envíos */}
            <div className="flex items-baseline justify-between border-y border-white/[0.06] py-4">
              <div>
                <span className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider block">
                  PRECIO OFICIAL
                </span>
                <span className="font-mono text-3xl font-bold text-white tracking-tight">
                  {formatCurrency(precio)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400 block font-medium">
                  Envío gratis &gt; Bs {siteConfig.shipping.freeShippingThreshold}
                </span>
                <span className="text-[10px] font-mono text-[#ac8888]">
                  Despacho express a toda Bolivia
                </span>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-sm font-body text-[#ac8888] leading-relaxed">
              {descripcion}
            </p>

            {/* Selector de Tallas con Guía */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FAF9F6] uppercase font-bold tracking-wider">
                  Seleccionar Talla (Boxy Cut)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-[#dc143c] hover:underline cursor-pointer"
                >
                  {showSizeGuide ? 'Ocultar Medidas' : 'Guía de Tallas 📏'}
                </button>
              </div>

              {/* Selector de Tallas */}
              <div className="flex items-center gap-2.5">
                {tallas.map((talla) => {
                  const isSelected = selectedTalla === talla;
                  return (
                    <button
                      key={talla}
                      type="button"
                      onClick={() => setSelectedTalla(talla)}
                      disabled={isSoldOut}
                      className={`w-12 h-12 rounded-2xl font-mono text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#dc143c] text-white shadow-[0_0_16px_rgba(220,20,60,0.6)] scale-105'
                          : 'bg-[#1c1b1b] text-[#ac8888] hover:bg-[#2a2a2a] hover:text-white border border-white/[0.08]'
                      } ${isSoldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {talla}
                    </button>
                  );
                })}
              </div>

              {/* Guía de Medidas Desplegable */}
              {showSizeGuide && (
                <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] text-xs font-mono space-y-2 mt-2 animate-in fade-in duration-200">
                  <div className="text-[#ffb3b3] font-bold uppercase mb-1">Medidas en Centímetros:</div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#ac8888] border-b border-white/[0.06] pb-1">
                    <span>Talla</span><span>Pecho</span><span>Largo</span><span>Manga</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#e5e2e1]">
                    <span>S</span><span>56 cm</span><span>71 cm</span><span>22 cm</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#e5e2e1]">
                    <span>M</span><span>60 cm</span><span>74 cm</span><span>24 cm</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#e5e2e1]">
                    <span>L</span><span>64 cm</span><span>77 cm</span><span>25 cm</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#e5e2e1]">
                    <span>XL</span><span>68 cm</span><span>80 cm</span><span>26 cm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción / Compra */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="w-full py-4 px-6 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_24px_rgba(220,20,60,0.5)] hover:shadow-[0_8px_32px_rgba(222,5,65,0.7)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MorphIcon
                  active={isAdded}
                  IconA={PlusIcon}
                  IconB={CheckIcon}
                  className="w-5 h-5 text-white"
                />
                <span>
                  {isSoldOut
                    ? 'Agotado Temporalmente'
                    : `Añadir a la Bolsa (${selectedTalla})`}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="w-full py-3.5 px-6 rounded-full bg-[#1c1b1b] hover:bg-[#201f1f] text-[#FAF9F6] border border-white/[0.1] font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                <span>Pedir Directamente por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Ficha Técnica de Taller */}
          <div className="p-6 rounded-3xl bg-[#141416]/70 border border-white/[0.06] space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#FAF9F6] border-b border-white/[0.06] pb-2">
              Especificaciones de Taller // Specs
            </h3>
            <dl className="space-y-2 text-xs font-mono">
              {Object.entries(especificaciones).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-white/[0.03]">
                  <dt className="text-[#ac8888]">{key}</dt>
                  <dd className="text-[#FAF9F6] font-bold text-right max-w-[240px]">{value}</dd>
                </div>
              ))}
            </dl>
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
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#1c1b1b] text-white flex items-center justify-center text-xl hover:bg-[#dc143c] transition-colors cursor-pointer"
          >
            ✕
          </button>
          <img
            src={currentImage}
            alt={nombre}
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
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
