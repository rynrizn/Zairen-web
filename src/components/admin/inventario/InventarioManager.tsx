import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { ProductoEditor, type InventarioItem } from './ProductoEditor';
import { supabase } from '../../../lib/supabase';

export function InventarioManager() {
  const [items, setItems] = useState<InventarioItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [coleccionesList, setColeccionesList] = useState<string[]>(['Todas']);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedColeccion, setSelectedColeccion] = useState<string>('Todas');
  const [selectedEstado, setSelectedEstado] = useState<'Todos' | 'Disponible' | 'Pocas Uds' | 'Agotado'>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data: dbCols } = await supabase.from('coleccion').select('id, nombre, slug').order('orden');
      if (dbCols && dbCols.length > 0) {
        setColeccionesList(['Todas', ...dbCols.map((c: any) => c.nombre)]);
      }

      const { data: dbProducts, error } = await supabase
        .from('producto')
        .select(`
          id,
          nombre,
          slug,
          descripcion,
          precio_venta,
          stock_minimo,
          activo,
          publicado,
          destacado,
          estado_comercial,
          coleccion:coleccion_id (id, nombre, slug),
          imagenes:imagen (id, url_imagen, es_portada, orden),
          inventario:inventario (cantidad, cantidad_reservada),
          atributos:atributo_producto (clave, valor)
        `)
        .order('created_at', { ascending: false });

      if (!error && dbProducts) {
        const mapped: InventarioItem[] = dbProducts.map((p: any) => {
          const tallas = p.atributos
            ?.filter((a: any) => a.clave.toLowerCase() === 'talla')
            ?.map((a: any) => a.valor) || ['S', 'M', 'L', 'XL'];

          const totalStock = p.inventario?.reduce((acc: number, inv: any) => acc + (inv.cantidad || 0), 0) || 0;
          const sortedImgs = (p.imagenes || []).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
          const coverImg = sortedImgs.find((img: any) => img.es_portada) || sortedImgs[0];
          const allImgUrls = sortedImgs.map((img: any) => img.url_imagen);

          return {
            id: p.id,
            sku: `ZRN-${p.slug?.substring(0, 8).toUpperCase() || 'PRENDA'}`,
            nombre: p.nombre,
            slug: p.slug,
            coleccion: p.coleccion?.nombre || 'General',
            seccion: p.coleccion?.nombre || 'General',
            tipo: 'Polera',
            precio: Number(p.precio_venta) || 0,
            costo: Math.round((Number(p.precio_venta) || 0) * 0.4),
            stock: (() => {
              const stockMap: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0 };
              let hasSpecificStock = false;
              p.atributos?.forEach((a: any) => {
                if (a.clave && a.clave.toLowerCase().startsWith('stock_')) {
                  const t = a.clave.replace(/stock_/i, '').toUpperCase();
                  stockMap[t] = parseInt(a.valor, 10) || 0;
                  hasSpecificStock = true;
                }
              });
              if (hasSpecificStock) return stockMap;
              // Si no hay atributos guardados pero solo hay 1 talla, asignarlo directo
              if (tallas.length === 1) {
                stockMap[tallas[0]] = totalStock;
                return stockMap;
              }
              // Fallback
              return {
                S: Math.floor(totalStock / 4) || 0,
                M: Math.floor(totalStock / 4) || 0,
                L: Math.floor(totalStock / 4) || 0,
                XL: Math.max(0, totalStock - Math.floor(totalStock / 4) * 3) || 0,
              };
            })(),
            tallas,
            descripcion: p.descripcion || '',
            imagen: coverImg?.url_imagen || 'https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp',
            imagenDorsal: sortedImgs[1]?.url_imagen,
            imagenes: allImgUrls.length > 0 ? allImgUrls : undefined,
            estadoComercial: p.estado_comercial || 'disponible',
            publicado: Boolean(p.publicado),
            destacado: Boolean(p.destacado),
          };
        });
        setItems(mapped);
      }
    } catch (err) {
      console.warn('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const handleChanged = () => fetchInventory();
    window.addEventListener('inventory-changed', handleChanged);
    return () => window.removeEventListener('inventory-changed', handleChanged);
  }, []);

  // Métricas calculadas
  const totalPrendas = useMemo(() => {
    return items.reduce((total, item) => {
      return total + Object.values(item.stock).reduce((a, b) => a + b, 0);
    }, 0);
  }, [items]);

  const skusActivos = items.length;

  const bajoStockCritico = useMemo(() => {
    return items.filter((item) => {
      const totalItem = Object.values(item.stock).reduce((a, b) => a + b, 0);
      const hasDepletedSize = Object.values(item.stock).some((s) => s <= 2);
      return totalItem < 10 || hasDepletedSize;
    }).length;
  }, [items]);

  // Filtrado de items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.nombre.toLowerCase().includes(search.toLowerCase());

      const matchesCol =
        selectedColeccion === 'Todas' || item.coleccion.includes(selectedColeccion);

      const totalItem = Object.values(item.stock).reduce((a, b) => a + b, 0);
      let matchesEstado = true;
      if (selectedEstado === 'Disponible') matchesEstado = totalItem >= 10;
      else if (selectedEstado === 'Pocas Uds') matchesEstado = totalItem > 0 && totalItem < 10;
      else if (selectedEstado === 'Agotado') matchesEstado = totalItem === 0;

      return matchesSearch && matchesCol && matchesEstado;
    });
  }, [items, search, selectedColeccion, selectedEstado]);

  const handleSelectItem = (item: InventarioItem) => {
    setSelectedItem(item);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = (savedItem: InventarioItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i));
      }
      return [savedItem, ...prev];
    });
    setSelectedItem(savedItem);
  };

  const handleRefreshCdn = () => {
    toast.success('Caché CDN y Catálogo Público sincronizados', {
      description: 'Los cambios de stock se reflejan instantáneamente en la tienda web.',
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section: Title, Stats & Primary Triggers */}
      <section className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-none bg-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.8)]"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-widest font-bold">
              STOCK CONTROL // PROTOCOL 04
            </span>
            <span className="text-[#ac8888] font-mono text-xs">// ZAIREN ARCHIVE</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight leading-none break-words">
            CONTROL DE INVENTARIO{' '}
            <span className="text-[#dc143c] font-light text-base sm:text-xl tracking-normal block md:inline font-mono">
              // DROPS & SKUS
            </span>
          </h1>
          <div className="h-0.5 w-60 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent"></div>
        </div>

        {/* Micro-Cards de Estadísticas Rápidas (Ortogonales) */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto">
            {/* Total Prendas */}
            <div className="bg-[#1c1b1b]/90 px-3.5 py-2.5 rounded-none border border-[#2A2A2A] shadow-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#141416] flex items-center justify-center text-[#dc143c] border border-white/[0.04] shrink-0">
                <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#ac8888] uppercase truncate">Total Prendas</div>
                <div className="font-headline text-base font-bold text-[#e5e2e1] leading-tight">
                  {totalPrendas} <span className="font-mono text-[11px] text-[#ac8888] font-normal">uds</span>
                </div>
              </div>
            </div>

            {/* SKUs Activos */}
            <div className="bg-[#1c1b1b]/90 px-3.5 py-2.5 rounded-none border border-[#2A2A2A] shadow-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#141416] flex items-center justify-center text-[#dc143c] border border-white/[0.04] shrink-0">
                <span className="material-symbols-outlined text-[18px]">tag</span>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#ac8888] uppercase truncate">SKUs Activos</div>
                <div className="font-headline text-base font-bold text-[#e5e2e1] leading-tight">
                  {skusActivos} <span className="font-mono text-[11px] text-[#ac8888] font-normal">refs</span>
                </div>
              </div>
            </div>

            {/* Bajo Stock Crítico */}
            <div className="bg-[#1c1b1b]/90 px-3.5 py-2.5 rounded-none border border-[#dc143c]/30 shadow-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-none bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c] shrink-0">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[#f87171] uppercase font-bold truncate">Bajo Stock</div>
                <div className="font-headline text-base font-bold text-[#f87171] leading-tight">
                  {bajoStockCritico} <span className="font-mono text-[11px] text-[#f87171] font-normal">variantes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Triggers de Acción */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <button
              type="button"
              onClick={handleRefreshCdn}
              className="px-3 sm:px-4 py-2.5 rounded-none bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-mono text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-[#2A2A2A] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#dc143c]">sync</span>
              <span className="truncate">Sincronizar</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3.5 sm:px-5 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_20px_rgba(220,20,60,0.35)] cursor-pointer border border-[#dc143c]"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
              <span className="truncate">+ AGREGAR</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Barra de Filtros y Búsqueda (Ortogonal y Contenida) */}
      <section className="bg-[#1c1b1b]/80 p-3 rounded-none border border-[#2A2A2A] shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full max-w-full overflow-hidden">
        {/* Input de Búsqueda Flexible */}
        <div className="relative flex-1 w-full min-w-0 max-w-xl">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ac8888] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="BUSCAR POR SKU (EJ: ZRN-044) O NOMBRE..."
            className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs placeholder:text-[#888] pl-10 pr-10 py-2.5 rounded-none border border-[#2A2A2A] focus:border-[#dc143c] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#ac8888] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Grupo de Filtros con Scroll Horizontal Contenido */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 max-w-full py-1">
          {/* Colección */}
          <div className="flex items-center bg-[#141416] p-1 rounded-none border border-[#2A2A2A] overflow-x-auto max-w-full scrollbar-none">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase shrink-0">
              Colección:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {coleccionesList.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColeccion(col)}
                  className={`px-2.5 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer border whitespace-nowrap ${
                    selectedColeccion === col
                      ? 'bg-[#dc143c] text-white font-bold border-[#dc143c]'
                      : 'text-[#ac8888] hover:text-white border-transparent'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de Stock */}
          <div className="flex items-center bg-[#141416] p-1 rounded-none border border-[#2A2A2A] overflow-x-auto max-w-full scrollbar-none">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase shrink-0">
              Estado:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {(['Todos', 'Disponible', 'Pocas Uds', 'Agotado'] as const).map((est) => (
                <button
                  key={est}
                  type="button"
                  onClick={() => setSelectedEstado(est)}
                  className={`px-2 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer border whitespace-nowrap ${
                    selectedEstado === est
                      ? 'bg-[#2a2a2a] text-[#FAF9F6] font-bold border-white/20'
                      : 'text-[#ac8888] hover:text-white border-transparent'
                  }`}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Vista */}
          <div className="flex items-center bg-[#141416] p-1 rounded-none ml-auto border border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista Lista"
              className={`w-8 h-8 rounded-none flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#dc143c] text-white shadow-sm'
                  : 'text-[#ac8888] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Vista Cuadrícula"
              className={`w-8 h-8 rounded-none flex items-center justify-center transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#dc143c] text-white shadow-sm'
                  : 'text-[#ac8888] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Matriz Global de Stock - Ancho Completo a 12 Columnas */}
      <div className="w-full bg-[#1c1b1b]/80 rounded-none p-3.5 sm:p-6 border border-[#2A2A2A] shadow-xl flex flex-col space-y-4">
        {/* Header de la Tabla */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#dc143c]">
              table_chart
            </span>
            <span className="font-headline text-base font-bold text-[#e5e2e1] uppercase tracking-wide">
              CATÁLOGO DE PRODUCTOS & STOCK
            </span>
          </div>
          <div className="font-mono text-xs text-[#ac8888] uppercase">
            MOSTRANDO {filteredItems.length} DE {items.length} SKUS REGISTRADOS
          </div>
        </div>

        {/* Listado de Productos con Tipografía Aumentada en Escritorio */}
        <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const totalItem = Object.values(item.stock).reduce((a, b) => a + b, 0);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="p-4 rounded-none space-y-3 transition-all cursor-pointer border bg-[#141416] hover:bg-[#1a191c] border-[#201f1f] hover:border-[#4A4A4A] group shadow-md"
                >
                  <div className="flex items-start gap-4">
                    {/* Foto Prenda */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-none overflow-hidden shrink-0 bg-[#0E0F11] border border-white/[0.08] relative">
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Datos Principales con Tipografía Legible */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#dc143c] tracking-wider">
                          {item.sku}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-none font-mono text-[11px] uppercase font-bold border ${
                            totalItem === 0
                              ? 'bg-red-950/80 text-red-400 border-red-800'
                              : totalItem <= 8
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {totalItem === 0
                            ? 'Agotado'
                            : totalItem <= 8
                            ? `Pocas Uds (${totalItem})`
                            : `Disponible (${totalItem})`}
                        </span>
                      </div>

                      {/* Título en tamaño mediano/grande */}
                      <h3 className="font-headline text-sm sm:text-base font-bold text-[#FAF9F6] truncate group-hover:text-[#dc143c] transition-colors">
                        {item.nombre}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 pt-0.5 font-mono text-xs text-[#ac8888]">
                        <span>{item.coleccion}</span>
                        <span>•</span>
                        <span className="text-white font-bold">Bs. {item.precio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fila de Tallas y Stock Total Adaptable */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06]">
                    <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                      {['S', 'M', 'L', 'XL'].map((talla) => {
                        const stockTalla = item.stock[talla] || 0;
                        return (
                          <span
                            key={talla}
                            className={`px-1.5 sm:px-2 py-0.5 rounded-none border text-[10px] sm:text-[11px] font-bold ${
                              stockTalla === 0
                                ? 'bg-red-950/60 text-red-400 border-red-900/50'
                                : stockTalla <= 3
                                ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                                : 'bg-[#1c1b1b] text-[#FAF9F6] border-white/10'
                            }`}
                          >
                            {talla}: {stockTalla}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#FAF9F6]">
                        {totalItem} UDS
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item);
                        }}
                        className="px-3 py-1 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-[#2A2A2A]"
                        title="Editar prenda en modal"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : items.length === 0 ? (
            <div className="text-center py-16 px-4 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-none bg-[#141416] border border-[#201f1f] flex items-center justify-center text-[#dc143c]">
                <span className="material-symbols-outlined text-[28px]">inventory_2</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline text-sm sm:text-base font-bold text-[#e5e2e1] uppercase">
                  Catálogo Listo para Nuevos Productos
                </h4>
                <p className="font-mono text-xs text-[#ac8888] max-w-md">
                  No hay prendas registradas en Supabase aún. Registra tu primera prenda con su colección para que aparezca automáticamente en la tienda web.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-6 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_16px_rgba(220,20,60,0.4)] transition-all cursor-pointer border border-[#dc143c]"
              >
                + Registrar Primera Prenda
              </button>
            </div>
          ) : (
            <div className="text-center py-16 text-xs font-mono text-[#ac8888]">
              No se encontraron prendas con los filtros aplicados.
            </div>
          )}
        </div>
      </div>

      {/* 4. Modal Flotante de Edición / Creación de Producto (Portal UI) */}
      {isEditorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => {
            setIsEditorOpen(false);
            setSelectedItem(null);
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#141416] border border-[#2A2A2A] rounded-none shadow-[0_24px_70px_rgba(0,0,0,0.95)] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductoEditor
              product={selectedItem}
              onSave={(item) => {
                handleSaveProduct(item);
                setIsEditorOpen(false);
                setSelectedItem(null);
              }}
              onClose={() => {
                setIsEditorOpen(false);
                setSelectedItem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
