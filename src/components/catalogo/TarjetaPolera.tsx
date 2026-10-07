import React, { useState } from 'react';
import { toast } from 'sonner';
import { MorphIcon } from '../ui/MorphIcon';
import { addItem } from '../../stores/cartStore';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

export interface TarjetaPoleraProps {
  id: string;
  slug?: string;
  nombre: string;
  precio: number;
  coleccion: string;
  subtitulo?: string;
  imagen: string;
  imagenDorsal?: string;
  imagenes?: string[];
  tallas?: string[];
  stockDisponible?: number;
  esPrioritario?: boolean;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'ninguno';
}

export function TarjetaPolera({
  id,
  slug,
  nombre,
  precio,
  coleccion,
  subtitulo = 'Algodón Peinado 280 GSM • Caída Geométrica',
  imagen,
  imagenDorsal,
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  estadoComercial = 'ninguno',
}: TarjetaPoleraProps) {
  const [selectedTalla, setSelectedTalla] = useState<string>(tallas[0] || 'M');
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isSoldOut = stockDisponible <= 0;
  const isLowStock = stockDisponible > 0 && stockDisponible <= 4;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSoldOut) {
      toast.error('Prenda agotada temporalmente');
      return;
    }

    addItem({
      id,
      nombre,
      precio,
      talla: selectedTalla,
      imagen,
      sku: slug?.toUpperCase(),
    });

    setIsAdded(true);
    toast.success(`${nombre} (${selectedTalla}) añadido al carrito`, {
      description: `Precio: Bs ${precio.toFixed(2)}`,
    });

    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
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

  const productUrl = `/producto/${slug || id}`;
  const displayImage = isHovered && imagenDorsal ? imagenDorsal : imagen;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#201f1f]/50 backdrop-blur-md p-3 hover:bg-[#201f1f]/80 transition-all duration-300 border border-white/[0.06] hover:border-white/[0.15] shadow-lg hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Contenedor Imagen 4:5 */}
      <a href={productUrl} className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#141416] mb-3 block">
        <img
          src={getOptimizedImageUrl(displayImage, 600, 750)}
          alt={nombre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e]/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Badges de Disponibilidad y Estado Comercial */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[85%]">
          {isSoldOut ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#7f1d1d]/90 text-[#f87171] border border-[#dc2626]/30 backdrop-blur-sm">
              SOLD OUT
            </span>
          ) : (
            <>
              {estadoComercial === 'preventa' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#6d28d9]/90 text-[#ddd6fe] border border-[#8b5cf6]/40 backdrop-blur-sm shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                  PRE-ORDER
                </span>
              )}
              {estadoComercial === 'promocion' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#dc143c]/90 text-white border border-[#ff4d6d]/40 backdrop-blur-sm shadow-[0_0_10px_rgba(220,20,60,0.5)]">
                  PROMO
                </span>
              )}
              {estadoComercial === 'oferta' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#b91c1c]/90 text-[#fecaca] border border-[#ef4444]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                  OFERTA
                </span>
              )}
              {estadoComercial === 'nuevo' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#047857]/90 text-[#a7f3d0] border border-[#10b981]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  NUEVO
                </span>
              )}
              {isLowStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#78350f]/90 text-[#fbbf24] border border-[#d97706]/30 backdrop-blur-sm animate-pulse">
                  POCAS UDS // {stockDisponible}
                </span>
              ) : estadoComercial === 'ninguno' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#dc143c]/80 text-white backdrop-blur-sm shadow-[0_0_8px_rgba(220,20,60,0.5)]">
                  DISPONIBLE
                </span>
              ) : null}
            </>
          )}
        </div>
      </a>

      {/* Información de Prenda */}
      <div className="flex flex-col flex-1 justify-between gap-2 px-1">
        <div>
          <span className="text-[10px] font-mono text-[#dc143c] uppercase tracking-widest block font-bold">
            {coleccion}
          </span>
          <a href={productUrl} className="block mt-0.5">
            <h3 className="font-display text-sm md:text-base font-bold text-[#e5e2e1] uppercase tracking-tight line-clamp-1 group-hover:text-white transition-colors">
              {nombre}
            </h3>
          </a>
          <p className="text-xs font-body text-[#ac8888] line-clamp-1 mt-0.5">
            {subtitulo}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2 border-t border-white/[0.04]">
          {/* Selector Interactivo de Tallas */}
          <div className="flex items-center gap-1.5">
            {tallas.map((talla) => {
              const isSelected = selectedTalla === talla;
              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => setSelectedTalla(talla)}
                  disabled={isSoldOut}
                  className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.6)] scale-105'
                      : 'bg-[#1c1b1b] text-[#e6bdbc] hover:bg-[#2a2a2a] hover:text-white border border-white/[0.06]'
                  } ${isSoldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {talla}
                </button>
              );
            })}
          </div>

          {/* Precio & Botón Agregar Carrito con MorphIcon */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#ac8888] uppercase tracking-wider">
                PRECIO
              </span>
              <span className="font-mono text-base md:text-lg font-bold text-white tracking-tight">
                Bs {precio.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              aria-label={`Añadir ${nombre} al carrito`}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isSoldOut
                  ? 'bg-[#1c1b1b] text-[#5c3f3f] cursor-not-allowed'
                  : 'bg-[#dc143c] hover:bg-[#ff2d55] text-white shadow-[0_2px_14px_rgba(220,20,60,0.45)] hover:scale-105 active:scale-95'
              }`}
            >
              <MorphIcon
                active={isAdded}
                IconA={PlusIcon}
                IconB={CheckIcon}
                className="w-5 h-5 text-white"
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
