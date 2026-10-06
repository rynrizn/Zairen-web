import React, { useState } from 'react';
import { toast } from 'sonner';
import { addItem } from '../../stores/cartStore';
import { MorphIcon } from '../ui/MorphIcon';
import { siteConfig, formatCurrency } from '../../config/site';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

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
  especificaciones?: Record<string, string>;
}

export function DetalleProducto({
  id,
  nombre,
  slug,
  precio,
  coleccion,
  descripcion = 'Polera boxy oversized confeccionada en algodón pesado 280 GSM con estampado frontal en serigrafía neón y tipografía Shinjuku.',
  imagenes = [],
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  especificaciones = {
    'Tejido Principal': '100% Algodón Peinado 280 GSM',
    'Confección': 'Tubular sin costuras laterales',
    'Cuello': 'Ribete acanalado 3.5 cm con spandex',
    'Estampado': 'Serigrafía al agua tacto cero 4 tintas',
    'Corte': 'Boxy Oversized con hombro caído',
    'Cuidados': 'Lavar en frío con prendas similares. No planchar sobre el estampado.',
  },
}: DetalleProductoProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedTalla, setSelectedTalla] = useState<string>(tallas[0] || 'M');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  const isSoldOut = stockDisponible <= 0;
  const currentImage = imagenes[activeImageIndex] || imagenes[0] || '';

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
    const text = encodeURIComponent(
      `Hola Zairen Lab, me interesa adquirir la prenda:\n\n🏷️ *${nombre}*\n📏 Talla: *${selectedTalla}*\n💰 Precio: *${formatCurrency(precio)}*\n\n¿Está disponible para despacho inmediato?`
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
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-[#ac8888] mb-8">
        <a href="/" className="hover:text-white transition-colors">Inicio</a>
        <span>/</span>
        <a href="/#catalogo" className="hover:text-white transition-colors">Catálogo</a>
        <span>/</span>
        <span className="text-[#dc143c] font-bold">{coleccion}</span>
      </nav>

      {/* Bento Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Galería Multi-ángulo (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Imagen Principal 4:5 */}
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#1c1b1b] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.7)] group">
            <img
              src={getOptimizedImageUrl(currentImage, 1000, 1250)}
              alt={nombre}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/60 via-transparent to-transparent pointer-events-none"></div>

            {/* Badge de Stock en Foto */}
            <div className="absolute top-4 left-4">
              {isSoldOut ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#7f1d1d]/90 text-[#f87171] border border-[#dc2626]/40 backdrop-blur-md">
                  SOLD OUT // AGOTADO
                </span>
              ) : stockDisponible <= 4 ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#78350f]/90 text-[#fbbf24] border border-[#d97706]/40 backdrop-blur-md animate-pulse">
                  ÚLTIMAS {stockDisponible} UNIDADES
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.6)]">
                  DISPONIBLE EN STOCK
                </span>
              )}
            </div>
          </div>

          {/* Miniaturas de Galería */}
          {imagenes.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {imagenes.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-xl overflow-hidden bg-[#1c1b1b] border-2 transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.4)] scale-105'
                      : 'border-white/[0.08] hover:border-white/[0.2] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Compra & Ficha Técnica (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Tarjeta de Producto */}
          <div className="p-6 md:p-8 rounded-3xl bg-[#201f1f]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-[#dc143c] uppercase tracking-widest font-bold">
                {coleccion} // DROP 01
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-tight text-[#e5e2e1] mt-1">
                {nombre}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono text-3xl font-bold text-white tracking-tight">
                  {formatCurrency(precio)}
                </span>
                <span className="text-xs font-mono text-[#ac8888]">
                  IVA incluido • Envío gratis &gt; {formatCurrency(siteConfig.shipping.freeShippingThreshold)}
                </span>
              </div>
            </div>

            <p className="text-sm font-body text-[#ac8888] leading-relaxed border-t border-white/[0.06] pt-4">
              {descripcion}
            </p>

            {/* Selector de Tallas con Guía */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#e5e2e1] uppercase font-bold tracking-wider">
                  Seleccionar Talla (Boxy Fit)
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-[#dc143c] hover:underline cursor-pointer"
                >
                  {showSizeGuide ? 'Ocultar Medidas' : 'Guía de Tallas 📏'}
                </button>
              </div>

              {/* Píldoras de Talla */}
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
                          : 'bg-[#141416] text-[#e6bdbc] hover:bg-[#2a2a2a] hover:text-white border border-white/[0.08]'
                      } ${isSoldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {talla}
                    </button>
                  );
                })}
              </div>

              {/* Tabla Desplegable de Medidas */}
              {showSizeGuide && (
                <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] text-xs font-mono space-y-2 mt-2 animate-in fade-in duration-200">
                  <div className="text-[#ffb3b3] font-bold uppercase mb-1">Medidas en Centímetros:</div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[#ac8888] border-b border-white/[0.06] pb-1">
                    <span>Talla</span>
                    <span>Pecho</span>
                    <span>Largo</span>
                    <span>Manga</span>
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

            {/* Botones de Compra */}
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="w-full py-4 px-6 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_24px_rgba(220,20,60,0.5)] hover:shadow-[0_6px_32px_rgba(222,5,65,0.7)] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MorphIcon
                  active={isAdded}
                  IconA={PlusIcon}
                  IconB={CheckIcon}
                  className="w-5 h-5 text-white"
                />
                <span>{isSoldOut ? 'Agotado Temporalmente' : `Añadir a la Bolsa (${selectedTalla})`}</span>
              </button>

              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="w-full py-3.5 px-6 rounded-full bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] hover:text-white border border-white/[0.1] font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Pedir Directamente por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Ficha Técnica de Taller */}
          <div className="p-6 rounded-3xl bg-[#1c1b1b]/60 border border-white/[0.06] space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#e5e2e1] border-b border-white/[0.06] pb-2">
              Especificaciones de Taller // Specs
            </h3>
            <dl className="space-y-2 text-xs font-mono">
              {Object.entries(especificaciones).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-white/[0.03]">
                  <dt className="text-[#ac8888]">{key}</dt>
                  <dd className="text-[#e5e2e1] font-bold text-right max-w-[240px]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
