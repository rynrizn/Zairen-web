import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TarjetaPolera, type TarjetaPoleraProps } from './TarjetaPolera';
import { GuiaTallasModal } from './GuiaTallasModal';
import { ColeccionCombobox } from './ColeccionCombobox';
import { ModalDetalleProducto } from './ModalDetalleProducto';

interface CatalogoGridProps {
  initialProducts: TarjetaPoleraProps[];
  collections: Array<{ id: string; nombre: string; slug: string }>;
}

export function CatalogoGrid({ initialProducts, collections }: CatalogoGridProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('todas');
  const [commercialFilter, setCommercialFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recientes' | 'precio-asc' | 'precio-desc' | 'nombre-asc' | 'nombre-desc' | 'disponibles'>('recientes');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [mobileDensity, setMobileDensity] = useState<'compact' | 'large'>('compact');
  const [isGuiaOpen, setIsGuiaOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<TarjetaPoleraProps | null>(null);
  const originCardElementRef = useRef<HTMLElement | null>(null);

  // Abrir modal e interceptar URL con pushState
  const handleOpenProductModal = (product: TarjetaPoleraProps, targetEl?: HTMLElement) => {
    originCardElementRef.current = targetEl || null;
    setSelectedProductForModal(product);
    if (typeof window !== 'undefined') {
      const productPath = `/producto/${product.slug || product.id}`;
      window.history.pushState({ modalOpen: true, id: product.id }, '', productPath);
    }
  };

  // Cerrar modal y restaurar URL
  const handleCloseProductModal = () => {
    setSelectedProductForModal(null);
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/producto')) {
        const search = window.location.search;
        window.history.pushState({}, '', '/' + search);
      }
    }
  };

  // Escuchar popstate para sincronización con historial (Atrás/Adelante)
  useEffect(() => {
    const handlePopStateModal = () => {
      if (window.location.pathname.startsWith('/producto')) {
        const slugOrId = window.location.pathname.replace('/producto/', '').replace(/\/$/, '');
        const found = initialProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
        if (found) {
          setSelectedProductForModal(found);
        }
      } else {
        setSelectedProductForModal(null);
      }
    };
    window.addEventListener('popstate', handlePopStateModal);
    return () => window.removeEventListener('popstate', handlePopStateModal);
  }, [initialProducts]);

  // Si el usuario carga directamente /producto/[slug] en una navegación de cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/producto')) {
      const slugOrId = window.location.pathname.replace('/producto/', '').replace(/\/$/, '');
      const found = initialProducts.find((p) => p.slug === slugOrId || p.id === slugOrId);
      if (found) {
        setSelectedProductForModal(found);
      }
    }
  }, [initialProducts]);


  // 1. Sincronización inicial con URL query param ?coleccion=<slug>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const colFromUrl = params.get('coleccion');
    if (colFromUrl) {
      const match = collections.find(
        (c) => c.slug === colFromUrl || c.slug.toLowerCase() === colFromUrl.toLowerCase()
      );
      if (match) {
        setSelectedCollection(match.slug);
      } else if (colFromUrl === 'todas') {
        setSelectedCollection('todas');
      }
    }
  }, [collections]);

  // 2. Escuchar cambios de historial en el navegador (botón Atrás / Adelante)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const col = params.get('coleccion') || 'todas';
      setSelectedCollection(col);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Handler de selección con sincronización pushState
  const handleCollectionSelect = (slug: string) => {
    setSelectedCollection(slug);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (slug === 'todas') {
      url.searchParams.delete('coleccion');
    } else {
      url.searchParams.set('coleccion', slug);
    }
    window.history.pushState({}, '', url.toString());
  };

  // 4. Calcular colecciones disponibles con conteo real de prendas activas
    // Conteo de prendas por estado comercial real
  const commercialCounts = useMemo(() => {
    const counts: Record<string, number> = {
      todos: initialProducts.length,
      preventa: 0,
      nuevo: 0,
      promocion: 0,
      oferta: 0,
    };
    initialProducts.forEach((p) => {
      const st = p.estadoComercial;
      if (st && counts[st] !== undefined) {
        counts[st]++;
      }
    });
    return counts;
  }, [initialProducts]);

  const collectionsWithCount = useMemo(() => {
    return collections
      .map((col) => {
        const selNorm = col.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
        const count = initialProducts.filter((p) => {
          const prodColNorm = (p.coleccion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const prodSlugNorm = ((p as any).coleccionSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return (
            (p as any).coleccionSlug === col.slug ||
            prodSlugNorm === selNorm ||
            prodColNorm === selNorm ||
            prodColNorm.includes(selNorm) ||
            selNorm.includes(prodColNorm)
          );
        }).length;

        return {
          id: col.id,
          nombre: col.nombre.split('//')[0]?.trim() || col.nombre,
          slug: col.slug,
          count,
        };
      })
      .filter((c) => c.count > 0 && !c.slug.includes('sin-coleccion'));
  }, [collections, initialProducts]);


  // Filtrado y ordenamiento reactivo
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Filtro por colección (normalizado sin conflicto de guiones o espacios)
        if (selectedCollection !== 'todas') {
          const selNorm = selectedCollection.toLowerCase().replace(/[^a-z0-9]/g, '');
          const prodColNorm = (p.coleccion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const prodSlugNorm = ((p as any).coleccionSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const match =
            (p as any).coleccionSlug === selectedCollection ||
            prodSlugNorm === selNorm ||
            prodColNorm === selNorm ||
            prodColNorm.includes(selNorm) ||
            selNorm.includes(prodColNorm);
          if (!match) return false;
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

        // Búsqueda por texto (nombre, colección, subtítulo, sku)
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
        if (sortBy === 'disponibles') {
          const aHasStock = (a.stockDisponible ?? 0) > 0 ? 1 : 0;
          const bHasStock = (b.stockDisponible ?? 0) > 0 ? 1 : 0;
          if (aHasStock !== bHasStock) return bHasStock - aHasStock;
        }
        if (sortBy === 'precio-asc') return a.precio - b.precio;
        if (sortBy === 'precio-desc') return b.precio - a.precio;
        if (sortBy === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
        if (sortBy === 'nombre-desc') return b.nombre.localeCompare(a.nombre);
        return 0;
      });
  }, [initialProducts, selectedCollection, commercialFilter, searchQuery, sortBy, onlyAvailable]);

  // Agrupación por colecciones con prendas agotadas al final de cada sección
  const sections = useMemo(() => {
    const sortByStockAndConfig = (prods: TarjetaPoleraProps[]) => {
      return [...prods].sort((a, b) => {
        const aSoldOut = (a.stockDisponible ?? 0) <= 0 || a.estadoComercial === 'agotado';
        const bSoldOut = (b.stockDisponible ?? 0) <= 0 || b.estadoComercial === 'agotado';
        if (aSoldOut !== bSoldOut) return aSoldOut ? 1 : -1;
        return 0;
      });
    };

    // Si se seleccionó una colección específica, mostrar solo esa sección
    if (selectedCollection !== 'todas') {
      const activeCol = collections.find((c) => c.slug === selectedCollection);
      const name = activeCol ? (activeCol.nombre.split('//')[0]?.trim() || activeCol.nombre) : selectedCollection;
      return [
        {
          id: selectedCollection,
          name: name.toUpperCase(),
          products: sortByStockAndConfig(filteredProducts),
        },
      ];
    }

    // Modo "todas": agrupar según colecciones definidas
    const grouped: Array<{ id: string; name: string; products: TarjetaPoleraProps[] }> = [];
    const usedProductIds = new Set<string>();

    collections.forEach((col) => {
      const colProducts = filteredProducts.filter((p) => {
        return (
          p.coleccion.toLowerCase().includes(col.slug.toLowerCase()) ||
          col.slug.toLowerCase().includes(p.coleccion.toLowerCase()) ||
          col.nombre.toLowerCase().includes(p.coleccion.toLowerCase())
        );
      });
      if (colProducts.length > 0) {
        colProducts.forEach((p) => usedProductIds.add(p.id));
        grouped.push({
          id: col.slug,
          name: (col.nombre.split('//')[0]?.trim() || col.nombre).toUpperCase(),
          products: sortByStockAndConfig(colProducts),
        });
      }
    });

    // Productos que no coincidieron con colecciones registradas: agrupar por su propia coleccion
    const remaining = filteredProducts.filter((p) => !usedProductIds.has(p.id));
    if (remaining.length > 0) {
      const byColName = new Map<string, TarjetaPoleraProps[]>();
      remaining.forEach((p) => {
        const colKey = p.coleccion || 'COLECCIÓN PRINCIPAL';
        if (!byColName.has(colKey)) byColName.set(colKey, []);
        byColName.get(colKey)!.push(p);
      });
      byColName.forEach((prods, colName) => {
        grouped.push({
          id: colName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: colName.toUpperCase(),
          products: sortByStockAndConfig(prods),
        });
      });
    }

    return grouped;
  }, [filteredProducts, selectedCollection, collections]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const areAllCollapsed = sections.length > 0 && sections.every((s) => collapsedSections[s.id]);

  const toggleAllSections = () => {
    if (areAllCollapsed) {
      setCollapsedSections({});
    } else {
      const next: Record<string, boolean> = {};
      sections.forEach((s) => {
        next[s.id] = true;
      });
      setCollapsedSections(next);
    }
  };

  return (
    <section id="catalogo" className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-16 scroll-mt-20">
      {/* ========================================================== */}
      {/* 1. ENCABEZADO ZEN CON LOGO WATERMARK DERECHO DETRÁS DEL TEXTO */}
      {/* ========================================================== */}
      <div className="relative flex flex-col justify-center min-h-[130px] md:min-h-[150px] mb-10 pb-4 border-b border-[#dc143c]/30">
        {/* Logotipo Oficial Watermark Suelto Sin Letras (Entero y completo, puntas superior e inferior visibles) */}
        <div className="absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-25 select-none h-28 w-28 md:h-36 md:w-36 filter drop-shadow-[0_0_24px_rgba(220,20,60,0.45)]">
          <img
            src="https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp"
            alt="Zairen Lab Isotipo Oficial"
            className="w-full h-full object-contain p-1"
          />
        </div>

        {/* Texto de Cabecera al Frente */}
        <div className="relative z-10">
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
      </div>

      {/* ========================================================== */}
      {/* 2. BARRA DE FILTROS, SCROLLBAR FINA Y BUSCADOR             */}
      {/* ========================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4 mb-6">
        {/* Selector de Colección Accesible en Combobox (Fase 6) */}
        <div className="flex-shrink-0">
          <ColeccionCombobox
            collections={collectionsWithCount}
            selectedSlug={selectedCollection}
            totalCount={initialProducts.length}
            onSelect={handleCollectionSelect}
          />
        </div>

        {/* Buscador y Selector de Orden Ampliado */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Campo de Búsqueda Ortogonal */}
          <div className="relative flex-1 sm:w-64">
            <label htmlFor="catalogo-search-input" className="sr-only">
              Buscar prenda o SKU
            </label>
            <input
              id="catalogo-search-input"
              name="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prenda o SKU..."
              className="w-full bg-[#141416] border border-[#201f1f] focus:border-[#dc143c] rounded-none px-4 py-2 text-xs font-mono text-[#e5e2e1] placeholder:text-[#ac8888]/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#ac8888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de Orden Ampliado (Precios, Recientes, Alfabético, Disponibles) */}
          <label htmlFor="catalogo-sort-select" className="sr-only">
            Ordenar catálogo por
          </label>
          <select
            id="catalogo-sort-select"
            name="sortBy"
            aria-label="Ordenar catálogo por"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#141416] border border-[#201f1f] text-[#e5e2e1] text-xs font-mono rounded-none px-3 py-2 focus:outline-none focus:border-[#dc143c] cursor-pointer"
          >
            <option value="recientes">Más Recientes</option>
            <option value="disponibles">Disponibles Primero</option>
            <option value="precio-asc">Precio: Menor a Mayor</option>
            <option value="precio-desc">Precio: Mayor a Menor</option>
            <option value="nombre-asc">Nombre: A - Z</option>
            <option value="nombre-desc">Nombre: Z - A</option>
          </select>

          {/* Botón Guía de Tallas */}
          <button
            type="button"
            onClick={() => setIsGuiaOpen(true)}
            title="Ver medidas en centímetros de prendas"
            className="px-3 py-2 bg-[#141416] hover:bg-[#201f1f] border border-[#201f1f] hover:border-[#dc143c] text-[#e5e2e1] text-xs font-mono rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>📏</span>
            <span className="hidden sm:inline">Guía de Tallas</span>
            <span className="sm:hidden">Tallas</span>
          </button>

          {/* Toggle de Densidad Móvil (1 o 2 columnas) */}
          <div className="flex sm:hidden items-center bg-[#141416] border border-[#201f1f] p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileDensity('compact')}
              title="2 Columnas compactas"
              className={`px-2 py-1 text-[10px] font-mono uppercase cursor-pointer ${
                mobileDensity === 'compact' ? 'bg-[#dc143c] text-white font-bold' : 'text-[#ac8888]'
              }`}
            >
              2 Col
            </button>
            <button
              type="button"
              onClick={() => setMobileDensity('large')}
              title="1 Columna grande"
              className={`px-2 py-1 text-[10px] font-mono uppercase cursor-pointer ${
                mobileDensity === 'large' ? 'bg-[#dc143c] text-white font-bold' : 'text-[#ac8888]'
              }`}
            >
              1 Col
            </button>
          </div>

          {/* Botón Global para Contraer / Expandir Todas las Secciones */}
          {sections.length > 1 && (
            <button
              type="button"
              onClick={toggleAllSections}
              title={areAllCollapsed ? 'Expandir todas las secciones' : 'Contraer todas las secciones'}
              className="px-3 py-2 bg-[#141416] hover:bg-[#201f1f] border border-[#201f1f] hover:border-[#dc143c] text-[#e5e2e1] text-xs font-mono rounded-none flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span className="text-[#dc143c] font-bold">{areAllCollapsed ? '⊞' : '⊟'}</span>
              <span className="hidden sm:inline">{areAllCollapsed ? 'Expandir Todo' : 'Contraer Todo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. FILTROS COMERCIALES DINÁMICOS CON CONTEO REAL */}
      {/* ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin-hover">
          {/* Filtro Todos (Siempre visible) */}
          <button
            type="button"
            onClick={() => setCommercialFilter('todos')}
            className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border whitespace-nowrap ${
              commercialFilter === 'todos'
                ? 'bg-[#FAF9F6] text-black border-[#FAF9F6]'
                : 'bg-[#141416] text-[#b3b3b3] hover:text-white border-[#2A2A2A]'
            }`}
          >
            Todos ({commercialCounts.todos})
          </button>

          {/* Filtro Pre-Order (Solo si hay prendas en preventa) */}
          {commercialCounts.preventa > 0 && (
            <button
              type="button"
              onClick={() => setCommercialFilter('preventa')}
              className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border whitespace-nowrap ${
                commercialFilter === 'preventa'
                  ? 'bg-[#6d28d9] text-white border-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                  : 'bg-[#141416] text-[#b3b3b3] hover:text-white border-[#2A2A2A]'
              }`}
            >
              Pre-Order ({commercialCounts.preventa})
            </button>
          )}

          {/* Filtro Nuevo Drop (Solo si hay prendas nuevas) */}
          {commercialCounts.nuevo > 0 && (
            <button
              type="button"
              onClick={() => setCommercialFilter('nuevo')}
              className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border whitespace-nowrap ${
                commercialFilter === 'nuevo'
                  ? 'bg-[#047857] text-white border-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-[#141416] text-[#b3b3b3] hover:text-white border-[#2A2A2A]'
              }`}
            >
              Nuevo Drop ({commercialCounts.nuevo})
            </button>
          )}

          {/* Filtro Promoción (Solo si hay prendas en promoción) */}
          {commercialCounts.promocion > 0 && (
            <button
              type="button"
              onClick={() => setCommercialFilter('promocion')}
              className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border whitespace-nowrap ${
                commercialFilter === 'promocion'
                  ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.5)]'
                  : 'bg-[#141416] text-[#b3b3b3] hover:text-white border-[#2A2A2A]'
              }`}
            >
              Promoción ({commercialCounts.promocion})
            </button>
          )}

          {/* Filtro Oferta (Solo si hay prendas en oferta) */}
          {commercialCounts.oferta > 0 && (
            <button
              type="button"
              onClick={() => setCommercialFilter('oferta')}
              className={`px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider font-bold transition-all cursor-pointer border whitespace-nowrap ${
                commercialFilter === 'oferta'
                  ? 'bg-[#b91c1c] text-white border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                  : 'bg-[#141416] text-[#b3b3b3] hover:text-white border-[#2A2A2A]'
              }`}
            >
              Oferta ({commercialCounts.oferta})
            </button>
          )}
        </div>

        {/* Checkbox de Disponibilidad Ortogonal */}
        <label htmlFor="catalogo-solo-stock" className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#ac8888] hover:text-[#e5e2e1] transition-colors">
          <input
            id="catalogo-solo-stock"
            name="soloStock"
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
          />
          <span>Solo en stock</span>
        </label>
      </div>

      {/* ========================================================== */}
      {/* 4. SECCIONES COLAPSABLES POR COLECCIÓN (Estilo CatalogoV0) */}
      {/* ========================================================== */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-12">
          {sections.map((section, secIdx) => {
            const isCollapsed = Boolean(collapsedSections[section.id]);
            return (
              <div
                key={section.id}
                className={`section-collapsible ${
                  secIdx > 0 ? '[content-visibility:auto] [contain-intrinsic-size:1px_500px]' : ''
                }`}
              >
                {/* Encabezado de Sección Colapsable */}
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between p-4 md:px-6 md:py-4 bg-[#141416]/90 backdrop-blur-md border border-white/[0.08] hover:border-[#dc143c]/50 transition-all cursor-pointer select-none group mb-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-[#dc143c]"></span>
                    <h3 className="font-display font-bold text-base md:text-lg uppercase tracking-wider text-[#FAF9F6] group-hover:text-white transition-colors">
                      {section.name}
                    </h3>
                    <span className="px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider bg-[#201f1f] text-[#ffb3b3] border border-white/[0.06]">
                      {section.products.length} {section.products.length === 1 ? 'PRENDA' : 'PRENDAS'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#8F8F8C] group-hover:text-white transition-colors">
                    <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">
                      {isCollapsed ? 'MOSTRAR' : 'CONTRAER'}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                {/* Cuadrícula de Prendas de la Sección */}
                {!isCollapsed && (
                  <div
                    className={`grid ${
                      mobileDensity === 'compact' ? 'grid-cols-2' : 'grid-cols-1'
                    } sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-in fade-in duration-200`}
                  >
                    {section.products.map((producto, prodIdx) => (
                      <TarjetaPolera
                        key={producto.id}
                        {...producto}
                        priority={secIdx === 0 && prodIdx === 0}
                        onSelectProduct={handleOpenProductModal}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Estado Vacío Ortogonal */
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
              setCommercialFilter('todos');
              setSearchQuery('');
              setOnlyAvailable(false);
            }}
            className="mt-4 px-5 py-2 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white text-xs font-mono uppercase tracking-wider font-bold cursor-pointer border border-[#dc143c]"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Modal de Guía de Tallas */}
      <GuiaTallasModal isOpen={isGuiaOpen} onClose={() => setIsGuiaOpen(false)} />

      {/* Modal Ficha Completa de Producto (Fase 7) */}
      <ModalDetalleProducto
        isOpen={Boolean(selectedProductForModal)}
        onClose={handleCloseProductModal}
        product={selectedProductForModal}
        originRef={originCardElementRef.current}
      />
    </section>
  );
}
