import React, { useState } from 'react';
import { toast } from 'sonner';
import { MorphIcon } from '../ui/MorphIcon';
import { addItem } from '../../stores/cartStore';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { formatCurrency } from '../../config/site';

export interface TarjetaPoleraProps {
  id: string;
  slug?: string;
  nombre: string;
  precio: number;
  coleccion: string;
  coleccionSlug?: string;
  idColeccion?: string;
  subtitulo?: string;
  imagen: string;
  imagenDorsal?: string;
  imagenes?: string[];
  tallas?: string[];
  stockDisponible?: number;
  esPrioritario?: boolean;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'ninguno' | 'disponible' | 'agotado';
}

export function TarjetaPolera({
  id,
  slug,
  nombre,
  precio,
  coleccion,
  coleccionSlug,
  idColeccion,
  subtitulo = 'Algodón Peinado 280 GSM • Caída Geométrica',
  imagen,
  imagenDorsal,
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  estadoComercial = 'ninguno',
}: TarjetaPoleraProps) {
  const [selectedTalla, setSelectedTalla] = useState<string>(tallas[0] || 'M');
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const isSoldOut = stockDisponible <= 0 || estadoComercial === 'agotado';
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
      sku: slug?.toUpperCase() || id.toUpperCase(),
    });

    setIsAdded(true);
    toast.success(`${nombre} (${selectedTalla}) añadido a la bolsa`, {
      description: `Bs. ${precio.toFixed(2)}`,
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

  return (
    <article
      className="group relative flex flex-col bg-[#141416] border border-[#201f1f] hover:border-[#4A4A4A] transition-all duration-300 p-3 shadow-lg hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Contenedor Fotográfico Orthogonal 4:5 */}
      <a href={productUrl} className="relative w-full aspect-[4/5] bg-[#0E0F11] overflow-hidden block">
        {/* Imagen Frontal */}
        <img
          src={getOptimizedImageUrl(imagen, 600, 750)}
          alt={nombre}
          loading="lazy"
          className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Revelación Dorsal en Hover */}
        {imagenDorsal && (
          <img
            src={getOptimizedImageUrl(imagenDorsal, 600, 750)}
            alt={`${nombre} dorsal`}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
          />
        )}

        {/* Badges de Disponibilidad y Estado Comercial (Cuadrados / Ortogonales) */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[90%]">
          {isSoldOut ? (
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#7f1d1d]/90 text-[#f87171] border border-[#dc2626]/40 backdrop-blur-sm">
              SOLD OUT
            </span>
          ) : (
            <>
              {estadoComercial === 'preventa' && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#6d28d9]/90 text-[#ddd6fe] border border-[#8b5cf6]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                  PRE-ORDER
                </span>
              )}
              {estadoComercial === 'promocion' && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#dc143c]/90 text-white border border-[#ff4d6d]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(220,20,60,0.5)]">
                  PROMO
                </span>
              )}
              {estadoComercial === 'oferta' && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#b91c1c]/90 text-[#fecaca] border border-[#ef4444]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                  OFERTA
                </span>
              )}
              {estadoComercial === 'nuevo' && (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#047857]/90 text-[#a7f3d0] border border-[#10b981]/40 backdrop-blur-sm shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  NUEVO
                </span>
              )}
              {isLowStock ? (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#78350f]/90 text-[#fbbf24] border border-[#d97706]/40 backdrop-blur-sm animate-pulse">
                  POCAS UDS // {stockDisponible}
                </span>
              ) : (estadoComercial === 'ninguno' || estadoComercial === 'disponible') ? (
                <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-[#141416]/90 text-[#FAF9F6] border border-white/20 backdrop-blur-sm">
                  DISPONIBLE
                </span>
              ) : null}
            </>
          )}
        </div>
      </a>

      {/* Ficha Inferior con Información de Prenda */}
      <div className="flex flex-col flex-1 justify-between gap-3 pt-3 px-1">
        <div>
          <span className="text-[10px] font-mono text-[#dc143c] uppercase tracking-widest block font-bold">
            {coleccion}
          </span>
          <a href={productUrl} className="block mt-0.5">
            <h3 className="font-display text-sm md:text-base font-bold text-[#FAF9F6] uppercase tracking-tight line-clamp-1 group-hover:text-[#dc143c] transition-colors">
              {nombre}
            </h3>
          </a>
          <p className="text-xs font-body text-[#ac8888] line-clamp-1 mt-0.5">
            {subtitulo}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5 border-t border-[#201f1f]">
          {/* Selector de Tallas Cuadrado / Ortogonal */}
          <div className="flex items-center gap-1.5">
            {tallas.map((talla) => {
              const isSelected = selectedTalla === talla;
              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => setSelectedTalla(talla)}
                  disabled={isSoldOut}
                  className={`w-7 h-7 text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)]'
                      : 'bg-[#1c1b1b] text-[#e6bdbc] hover:bg-[#2a2a2a] hover:text-white border-white/[0.08]'
                  } ${isSoldOut ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {talla}
                </button>
              );
            })}
          </div>

          {/* Precio y Botón Agregar Carrito Cuadrado / Ortogonal */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#ac8888] uppercase tracking-wider">
                PRECIO
              </span>
              <span className="font-mono text-base md:text-lg font-bold text-[#FAF9F6] tracking-tight">
                {formatCurrency(precio)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              aria-label={`Añadir ${nombre} al carrito`}
              title="Añadir a la bolsa"
              className={`w-9 h-9 shrink-0 flex items-center justify-center font-bold transition-all cursor-pointer border ${
                isSoldOut
                  ? 'bg-[#1c1b1b] text-[#5c3f3f] border-[#201f1f] cursor-not-allowed'
                  : isAdded
                  ? 'bg-[#047857] text-white border-[#10b981]'
                  : 'bg-[#FAF9F6] hover:bg-[#dc143c] text-[#0A0A0A] hover:text-white border-[#FAF9F6] hover:border-[#dc143c]'
              }`}
            >
              <MorphIcon
                state={isAdded ? 'B' : 'A'}
                IconA={PlusIcon}
                IconB={CheckIcon}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
