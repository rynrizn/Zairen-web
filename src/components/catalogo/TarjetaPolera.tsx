import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MorphIcon } from '../ui/MorphIcon';
import { addItem } from '../../stores/cartStore';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../../lib/cloudinary';
import { formatCurrency } from '../../config/site';
import {
  getFirstActiveChannel,
  buildChannelActionUrl,
  DEFAULT_CONTACT_CHANNELS,
  type ContactChannel,
} from '../../lib/contactChannels';

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
  stockPorTalla?: Record<string, number>;
  esPrioritario?: boolean;
  priority?: boolean;
  estadoComercial?: 'preventa' | 'promocion' | 'oferta' | 'nuevo' | 'ninguno' | 'disponible' | 'agotado';
  onSelectProduct?: (product: TarjetaPoleraProps, targetElement?: HTMLElement) => void;
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
  imagenes,
  tallas = ['S', 'M', 'L', 'XL'],
  stockDisponible = 10,
  stockPorTalla,
  esPrioritario = false,
  priority = false,
  estadoComercial = 'ninguno',
  onSelectProduct,
}: TarjetaPoleraProps) {
  // Determinar stock de cada talla
  const getStockForTalla = (t: string) => {
    if (stockPorTalla && Object.keys(stockPorTalla).length > 0) {
      return stockPorTalla[t] ?? 0;
    }
    // Si no hay desglose pero hay tallas y stock disponible total
    if (tallas.length === 1) return stockDisponible;
    return stockDisponible > 0 ? 1 : 0;
  };

  const totalStockAvailable = stockPorTalla && Object.keys(stockPorTalla).length > 0
    ? Object.values(stockPorTalla).reduce((a, b) => a + b, 0)
    : stockDisponible;
  const isSoldOut = totalStockAvailable <= 0 || estadoComercial === 'agotado';

  // Seleccionar por defecto la primera talla con stock disponible
  const firstAvailableTalla = tallas.find((t) => getStockForTalla(t) > 0) || tallas[0] || 'M';
  const [selectedTalla, setSelectedTalla] = useState<string>(firstAvailableTalla);
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [priorityChannel, setPriorityChannel] = useState<ContactChannel | null>(null);

  useEffect(() => {
    const syncChannel = () => {
      try {
        const raw = localStorage.getItem('zairen_contact_channels');
        const list = raw ? JSON.parse(raw) : DEFAULT_CONTACT_CHANNELS;
        setPriorityChannel(getFirstActiveChannel(list));
      } catch {
        setPriorityChannel(getFirstActiveChannel(DEFAULT_CONTACT_CHANNELS));
      }
    };
    syncChannel();
    window.addEventListener('zairen-config-updated', syncChannel);
    return () => window.removeEventListener('zairen-config-updated', syncChannel);
  }, []);

  useEffect(() => {
    const available = tallas.find((t) => getStockForTalla(t) > 0);
    if (available && getStockForTalla(selectedTalla) <= 0) {
      setSelectedTalla(available);
    }
  }, [tallas, stockPorTalla, stockDisponible]);
  const isLowStock = stockDisponible > 0 && stockDisponible <= 4;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stockForSelected = getStockForTalla(selectedTalla);
    if (isSoldOut || stockForSelected <= 0) {
      toast.error(`La talla ${selectedTalla} está agotada`);
      return;
    }

    addItem({
      id,
      nombre,
      precio,
      talla: selectedTalla,
      imagen,
      sku: slug?.toUpperCase() || id.toUpperCase(),
      stockDisponible: stockForSelected,
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

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      return;
    }
    if (onSelectProduct) {
      e.preventDefault();
      onSelectProduct(
        {
          id,
          slug,
          nombre,
          precio,
          coleccion,
          coleccionSlug,
          idColeccion,
          subtitulo,
          imagen,
          imagenDorsal,
          imagenes,
          tallas,
          stockDisponible,
          stockPorTalla,
          esPrioritario,
          priority,
          estadoComercial,
        },
        e.currentTarget
      );
    }
  };

  const productUrl = `/producto/${slug || id}`;
  const selectedTallaStock = getStockForTalla(selectedTalla);

  return (
    <article
      className={`group relative flex flex-col bg-[#141416] border transition-all duration-300 ease-out p-3 shadow-lg hover:-translate-y-1.5 overflow-hidden ${
        isSoldOut
          ? 'border-red-950/40 opacity-70 grayscale-[25%]'
          : 'border-[#201f1f] hover:border-[#dc143c]/60 hover:shadow-[0_16px_36px_rgba(220,20,60,0.20)]'
      }`}
    >
      {/* Micro-línea de acento carmesí Zen en la base al hacer hover */}
      <div className="absolute bottom-0 left-0 h-[2.5px] w-0 bg-gradient-to-r from-[#dc143c] via-[#ff2d55] to-[#dc143c] group-hover:w-full transition-all duration-500 ease-out pointer-events-none z-20" />
      {/* Contenedor Fotográfico Orthogonal 4:5 */}
      <a href={productUrl} onClick={handleCardClick} data-astro-prefetch="hover" className="relative w-full aspect-[4/5] bg-[#0E0F11] overflow-hidden block">
        {/* Imagen Frontal Optimizada */}
        <img
          src={getOptimizedImageUrl(imagen, 600, 750)}
          srcSet={getResponsiveSrcSet(imagen)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          alt={nombre}
          width={400}
          height={500}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...(priority ? { fetchPriority: 'high' } : {})}
          style={{ viewTransitionName: `prod-img-${id}` }}
          className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Revelación Dorsal en Hover */}
        {imagenDorsal && (
          <img
            src={getOptimizedImageUrl(imagenDorsal, 600, 750)}
            srcSet={getResponsiveSrcSet(imagenDorsal)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={`${nombre} dorsal`}
            width={400}
            height={500}
            loading="lazy"
            decoding="async"
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
          <a href={productUrl} onClick={handleCardClick} className="block mt-0.5">
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
              const stockThisTalla = getStockForTalla(talla);
              const isTallaAgotada = isSoldOut || stockThisTalla <= 0;
              return (
                <button
                  key={talla}
                  type="button"
                  onClick={() => !isTallaAgotada && setSelectedTalla(talla)}
                  disabled={isTallaAgotada}
                  title={isTallaAgotada ? `Talla ${talla} agotada` : `Talla ${talla} (${stockThisTalla} disponibles)`}
                  className={`w-7 h-7 text-xs font-mono font-bold flex items-center justify-center transition-all border ${
                    isTallaAgotada
                      ? 'bg-[#141416]/50 text-[#8F8F8C]/40 border-white/[0.04] line-through cursor-not-allowed opacity-30 pointer-events-none'
                      : isSelected
                      ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)] cursor-pointer active:scale-90'
                      : 'bg-[#1c1b1b] text-[#e6bdbc] hover:bg-[#2a2a2a] hover:text-white border-white/[0.08] cursor-pointer active:scale-90'
                  }`}
                >
                  {talla}
                </button>
              );
            })}
          </div>

          {/* Micro-aviso de últimas unidades por talla seleccionada */}
          {!isSoldOut && selectedTallaStock > 0 && selectedTallaStock <= 2 && (
            <span className="text-[9px] font-mono text-amber-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] text-amber-400">bolt</span>
              <span>Últimas {selectedTallaStock} uds ({selectedTalla})</span>
            </span>
          )}

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

            <div className="flex items-center gap-1.5">{priorityChannel && (
              <a
                href={buildChannelActionUrl(priorityChannel, {
                  nombre,
                  precio,
                  moneda: 'Bs',
                  url: typeof window !== 'undefined' ? `${window.location.origin}${productUrl}` : productUrl,
                })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title={`Consultar por ${priorityChannel.name}`}
                aria-label={`Consultar ${nombre} por ${priorityChannel.name}`}
                className="w-9 h-9 shrink-0 flex items-center justify-center font-bold transition-all border bg-[#141416] hover:bg-[#201f1f] text-[#ac8888] hover:text-[#dc143c] border-[#201f1f] hover:border-[#dc143c] cursor-pointer active:scale-95 mr-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {priorityChannel.type === 'whatsapp' ? 'chat' : 'alternate_email'}
                </span>
              </a>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              aria-label={`Añadir ${nombre} al carrito`}
              title="Añadir a la bolsa"
              className={`w-9 h-9 shrink-0 flex items-center justify-center font-bold transition-all cursor-pointer border active:scale-95 ${
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
      </div>
    </article>
  );
}