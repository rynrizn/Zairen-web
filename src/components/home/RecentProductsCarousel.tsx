import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { addItem } from '../../stores/cartStore';
import type { TarjetaPoleraProps } from '../catalogo/TarjetaPolera';

interface RecentProductsCarouselProps {
  products: TarjetaPoleraProps[];
}

export function RecentProductsCarousel({ products }: RecentProductsCarouselProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [showDragBadge, setShowDragBadge] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Ordenar productos por los más recientes (prioritarios primero o por id)
  const sortedRecent = [...products].sort((a, b) => {
    if (a.esPrioritario && !b.esPrioritario) return -1;
    if (!a.esPrioritario && b.esPrioritario) return 1;
    return 0;
  });

  // Filtrado reactivo por categoría
  const filteredProducts = sortedRecent.filter((item) => {
    if (selectedFilter === 'todos') return true;
    if (selectedFilter === 'limpias') return item.coleccion.toLowerCase().includes('zen') || item.coleccion.toLowerCase().includes('limpia');
    if (selectedFilter === 'diseno') return item.coleccion.toLowerCase().includes('mecha') || item.coleccion.toLowerCase().includes('propio');
    if (selectedFilter === 'edicion') return item.coleccion.toLowerCase().includes('cyber') || item.esPrioritario;
    return true;
  });

  // Manejo de drag con mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Actualizar posición del indicador flotante
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = () => {
    setShowDragBadge(true);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setShowDragBadge(false);
    setCursorPos(null);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: TarjetaPoleraProps) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      talla: product.tallas?.[0] || 'M',
      imagen: product.imagen,
      sku: product.slug?.toUpperCase() || 'ZRN-TEE',
    });

    toast.success(`${product.nombre} añadido a la bolsa`, {
      description: `Bs. ${product.precio.toFixed(2)} // Talla ${product.tallas?.[0] || 'M'}`,
    });
  };

  return (
    <section className="w-full bg-[#0A0A0A] py-20 px-4 md:px-8 border-t border-[#1C1B1B] relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Encabezado de Sección // ÚLTIMOS LANZAMIENTOS */}
        <div className="flex flex-col items-center mb-8 relative">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold uppercase tracking-tight text-[#FAF9F6] text-center">
            ÚLTIMOS LANZAMIENTOS
          </h2>
          <span className="text-xs font-mono text-[#8F8F8C] uppercase tracking-widest mt-2 block">
            PIEZAS RECIENTES // EDICIÓN LIMITADA
          </span>

          <div className="w-full flex justify-end mt-4 sm:mt-0 sm:absolute sm:right-0 sm:bottom-0">
            <a
              href="/catalogo"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#FAF9F6] hover:text-[#8F8F8C] transition-colors group"
            >
              <span>VER CATÁLOGO COMPLETO</span>
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Carrusel Deslizable */}
        <div 
          className="relative mt-8 select-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Indicador Flotante "← Arrastrar →" */}
          {showDragBadge && cursorPos && (
            <div
              className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center px-4 py-2 bg-white text-black text-xs font-mono uppercase font-bold tracking-wider shadow-2xl transition-transform duration-75"
              style={{
                left: `${cursorPos.x}px`,
                top: `${cursorPos.y}px`,
              }}
            >
              ← Arrastrar →
            </div>
          )}

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`flex items-stretch gap-5 overflow-x-auto pb-8 pt-2 scrollbar-none cursor-grab active:cursor-grabbing scroll-smooth ${
              isDragging ? 'scroll-auto' : ''
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {filteredProducts.map((product) => {
              const productUrl = `/producto/${product.slug || product.id}`;
              return (
                <div
                  key={product.id}
                  className="w-[260px] sm:w-[290px] md:w-[320px] shrink-0 bg-[#141416] border border-[#201f1f] hover:border-[#4A4A4A] transition-all duration-300 flex flex-col group relative"
                >
                  {/* Contenedor Fotográfico 4:5 */}
                  <a
                    href={productUrl}
                    className="relative w-full aspect-[4/5] bg-[#0E0F11] overflow-hidden block"
                  >
                    <img
                      src={product.imagen}
                      alt={product.nombre}
                      loading="lazy"
                      className="w-full h-full object-cover filter contrast-[1.03] group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Revelación dorsal en hover si existe */}
                    {product.imagenDorsal && (
                      <img
                        src={product.imagenDorsal}
                        alt={`${product.nombre} dorsal`}
                        className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80"></div>
                  </a>

                  {/* Ficha Inferior con Datos y Botón de Acción Rápida */}
                  <div className="p-4 bg-[#141416] flex items-center justify-between border-t border-[#201f1f] relative">
                    <div className="space-y-1 pr-3 overflow-hidden">
                      <a
                        href={productUrl}
                        className="text-xs font-mono text-[#FAF9F6] font-bold block truncate hover:text-[#8F8F8C] transition-colors uppercase tracking-wider"
                      >
                        {product.nombre}
                      </a>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-[#FAF9F6] font-bold">
                          Bs. {product.precio.toFixed(0)}
                        </span>
                        {/* Swatches de Color */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0A0A0A] border border-white/40"></span>
                          <span className="w-2 h-2 rounded-full bg-[#FAF9F6]"></span>
                          <span className="w-2 h-2 rounded-full bg-[#4A4A4A]"></span>
                        </div>
                      </div>
                    </div>

                    {/* Botón "+" de Adición Inmediata */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, product)}
                      title="Añadir a la bolsa"
                      className="w-9 h-9 shrink-0 bg-[#FAF9F6] hover:bg-[#dc143c] text-[#0A0A0A] hover:text-white flex items-center justify-center font-bold text-lg transition-colors cursor-pointer border border-[#FAF9F6]"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros Inferiores en Botones Rectangulares */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            type="button"
            onClick={() => setSelectedFilter('todos')}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === 'todos'
                ? 'bg-[#FAF9F6] text-[#0A0A0A] font-bold'
                : 'bg-[#141416] text-[#8F8F8C] hover:text-[#FAF9F6] border border-[#2A2A2A]'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('limpias')}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === 'limpias'
                ? 'bg-[#FAF9F6] text-[#0A0A0A] font-bold'
                : 'bg-[#141416] text-[#8F8F8C] hover:text-[#FAF9F6] border border-[#2A2A2A]'
            }`}
          >
            Poleras Limpias
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('diseno')}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === 'diseno'
                ? 'bg-[#FAF9F6] text-[#0A0A0A] font-bold'
                : 'bg-[#141416] text-[#8F8F8C] hover:text-[#FAF9F6] border border-[#2A2A2A]'
            }`}
          >
            Diseño Propio
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('edicion')}
            className={`px-5 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              selectedFilter === 'edicion'
                ? 'bg-[#FAF9F6] text-[#0A0A0A] font-bold'
                : 'bg-[#141416] text-[#8F8F8C] hover:text-[#FAF9F6] border border-[#2A2A2A]'
            }`}
          >
            Edición Especial
          </button>
        </div>

      </div>
    </section>
  );
}
