import React, { useState, useMemo } from 'react';
import { TarjetaPolera, type TarjetaPoleraProps } from './TarjetaPolera';

interface CatalogoGridProps {
  initialProducts: TarjetaPoleraProps[];
  collections: Array<{ id: string; nombre: string; slug: string }>;
}

export function CatalogoGrid({ initialProducts, collections }: CatalogoGridProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('todas');
  const [commercialFilter, setCommercialFilter] = useState<string>('todos');
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

        // Filtro por estado comercial
        if (commercialFilter !== 'todos') {
          if (commercialFilter === 'ofertas') {
            if (p.estadoComercial !== 'oferta' && p.estadoComercial !== 'promocion') return false;
          } else if (p.estadoComercial !== commercialFilter) {
            return false;
          }
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
  }, [initialProducts, selectedCollection, commercialFilter, searchQuery, sortBy, onlyAvailable]);

  return (
    <section id="catalogo" className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-16 scroll-mt-20">
      {/* Encabezado de Sección */}
      <div className="flex flex-col gap-3 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#dc143c]"></span>
              <span className="text-xs font-mono text-[#ffb3b3] uppercase tracking-widest font-bold">
                01 // CATÁLOGO OFICIAL
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold font-display uppercase tracking-tight text-[#e5e2e1] mt-1">
              ARCHIVE & DROPS // 2026
            </h2>
          </div>
          {/* Logotipo Oficial Suelto con Degradado Sutil (Sin cajas ni bordes) */}
          <div className="flex items-center gap-3">
            <img
              src="/brand/zairen_logo_oficial.svg"
              alt="Zairen Lab"
              className="w-10 h-10 object-contain opacity-90 hover:opacity-100 transition-opacity filter drop-shadow-[0_0_12px_rgba(220,20,60,0.35)]"
            />
            <div className="flex flex-col">
              <span className="font-display font-black tracking-widest text-base md:text-lg uppercase bg-gradient-to-r from-white via-[#e5e2e1] to-[#ac8888] bg-clip-text text-transparent">
                ZAIREN
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#dc143c]">
                LAB // OFFICIAL
              </span>
            </div>
          </div>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-[#dc143c] via-[#dc143c]/30 to-transparent mt-2"></div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        {/* Chips de Colección Ortogonales */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCollection('todas')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer border ${
              selectedCollection === 'todas'
                ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                : 'bg-[#141416] text-[#ac8888] hover:text-white border-[#201f1f]'
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
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                    : 'bg-[#141416] text-[#ac8888] hover:text-white border-[#201f1f]'
                }`}
              >
                {col.nombre.split('//')[0]?.trim() || col.nombre}
              </button>
            );
          })}
        </div>

        {/* Buscador y Orden */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Campo Búsqueda Ortogonal */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por SKU o nombre..."
              className="w-full bg-[#141416] border border-[#201f1f] focus:border-[#dc143c] rounded-none px-4 py-2 text-xs font-mono text-[#e5e2e1] placeholder:text-[#ac8888]/60 focus:outline-none transition-colors"
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

          {/* Selector de Orden Ortogonal */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#141416] border border-[#201f1f] text-[#e5e2e1] text-xs font-mono rounded-none px-3 py-2 focus:outline-none focus:border-[#dc143c] cursor-pointer"
          >
            <option value="recientes">Más Recientes</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Sub-barra de Filtro Comercial & Stock */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#ac8888] mr-1">
            ESTADO:
          </span>
          <button
            type="button"
            onClick={() => setCommercialFilter('todos')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              commercialFilter === 'todos'
                ? 'bg-[#FAF9F6] text-black border-[#FAF9F6]'
                : 'bg-[#141416] text-[#ac8888] hover:text-white border-[#201f1f]'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setCommercialFilter('preventa')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              commercialFilter === 'preventa'
                ? 'bg-[#6d28d9] text-white border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                : 'bg-[#141416] text-[#ddd6fe]/70 hover:text-white border-[#201f1f]'
            }`}
          >
            Pre-Order ⚡
          </button>
          <button
            type="button"
            onClick={() => setCommercialFilter('nuevo')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              commercialFilter === 'nuevo'
                ? 'bg-[#047857] text-white border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-[#141416] text-[#a7f3d0]/70 hover:text-white border-[#201f1f]'
            }`}
          >
            Nuevo Drop 🔥
          </button>
          <button
            type="button"
            onClick={() => setCommercialFilter('promocion')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              commercialFilter === 'promocion'
                ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)]'
                : 'bg-[#141416] text-[#fca5a5]/70 hover:text-white border-[#201f1f]'
            }`}
          >
            Promoción 🏷️
          </button>
          <button
            type="button"
            onClick={() => setCommercialFilter('oferta')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border ${
              commercialFilter === 'oferta'
                ? 'bg-[#b91c1c] text-white border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                : 'bg-[#141416] text-[#fca5a5]/70 hover:text-white border-[#201f1f]'
            }`}
          >
            Oferta 💥
          </button>
        </div>

        {/* Checkbox de Disponibilidad Ortogonal */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#ac8888] hover:text-[#e5e2e1] transition-colors">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
          />
          <span>Solo en stock</span>
        </label>
      </div>

      {/* Cuadrícula de Prendas */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((producto) => (
            <TarjetaPolera key={producto.id} {...producto} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-none bg-[#141416] border border-[#201f1f]">
          <div className="w-12 h-12 rounded-none bg-[#201f1f] text-[#dc143c] flex items-center justify-center mx-auto mb-3 font-mono text-xl border border-[#dc143c]/30">
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
            className="mt-4 px-5 py-2 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white text-xs font-mono uppercase tracking-wider font-bold cursor-pointer border border-[#dc143c]"
          >
            Restablecer Filtros
          </button>
        </div>
      )}
    </section>
  );
}
