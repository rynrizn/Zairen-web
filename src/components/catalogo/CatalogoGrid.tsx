import React, { useState, useMemo } from 'react';
import { TarjetaPolera, type TarjetaPoleraProps } from './TarjetaPolera';

interface CatalogoGridProps {
  initialProducts: TarjetaPoleraProps[];
  collections: Array<{ id: string; nombre: string; slug: string }>;
}

export function CatalogoGrid({ initialProducts, collections }: CatalogoGridProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recientes' | 'precio-asc' | 'precio-desc'>('recientes');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Filtrado y ordenamiento reactivo
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Filtro por colección
        if (selectedCollection !== 'todas') {
          const matchCol = p.coleccion.toLowerCase().includes(selectedCollection.toLowerCase());
          if (!matchCol) return false;
        }

        // Filtro por disponibilidad
        if (onlyAvailable && (p.stockDisponible ?? 0) <= 0) {
          return false;
        }

        // Búsqueda por texto (nombre, colección, subtitulo)
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.nombre.toLowerCase().includes(q);
          const matchSub = p.subtitulo?.toLowerCase().includes(q);
          const matchCol = p.coleccion.toLowerCase().includes(q);
          const matchSlug = p.slug?.toLowerCase().includes(q);
          if (!matchName && !matchSub && !matchCol && !matchSlug) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'precio-asc') return a.precio - b.precio;
        if (sortBy === 'precio-desc') return b.precio - a.precio;
        return 0;
      });
  }, [initialProducts, selectedCollection, searchQuery, sortBy, onlyAvailable]);

  return (
    <section id="catalogo" className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-16 scroll-mt-20">
      {/* Encabezado de Sección */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc143c]"></span>
              <span className="text-xs font-mono text-[#ffb3b3] uppercase tracking-widest font-bold">
                01 // CATÁLOGO OFICIAL
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold font-display uppercase tracking-tight text-[#e5e2e1] mt-1">
              ARCHIVE & DROPS // 2026
            </h2>
          </div>
          <p className="text-sm font-body text-[#ac8888] max-w-md">
            Cortes oversized confeccionados en algodón pesado. Disponibilidad limitada con reabastecimiento programado.
          </p>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-[#dc143c] via-[#dc143c]/30 to-transparent mt-2"></div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        {/* Chips de Colección */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCollection('todas')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCollection === 'todas'
                ? 'bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                : 'bg-[#201f1f] text-[#ac8888] hover:text-white border border-white/[0.06]'
            }`}
          >
            Todas ({initialProducts.length})
          </button>

          {collections.map((col) => {
            const isSelected = selectedCollection === col.slug;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollection(col.slug)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                    : 'bg-[#201f1f] text-[#ac8888] hover:text-white border border-white/[0.06]'
                }`}
              >
                {col.nombre.split('//')[0]?.trim() || col.nombre}
              </button>
            );
          })}
        </div>

        {/* Buscador y Orden */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Campo Búsqueda */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por SKU o nombre..."
              className="w-full bg-[#1c1b1b] border border-white/[0.08] focus:border-[#dc143c] rounded-full px-4 py-2 text-xs font-mono text-[#e5e2e1] placeholder:text-[#ac8888]/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#ac8888] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de Orden */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1c1b1b] border border-white/[0.08] text-[#e5e2e1] text-xs font-mono rounded-full px-3 py-2 focus:outline-none focus:border-[#dc143c] cursor-pointer"
          >
            <option value="recientes">Más Recientes</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Prendas */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((producto) => (
            <TarjetaPolera key={producto.id} {...producto} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-2xl bg-[#1c1b1b]/50 border border-white/[0.06]">
          <div className="w-12 h-12 rounded-full bg-[#201f1f] text-[#dc143c] flex items-center justify-center mx-auto mb-3 font-mono text-xl">
            ∅
          </div>
          <h3 className="text-lg font-bold font-display uppercase text-[#e5e2e1] mb-1">
            No se encontraron prendas
          </h3>
          <p className="text-xs font-mono text-[#ac8888] max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda o cambiando el filtro de colección.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCollection('todas');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2 rounded-full bg-[#dc143c] text-white text-xs font-mono uppercase tracking-wider font-bold cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </section>
  );
}
