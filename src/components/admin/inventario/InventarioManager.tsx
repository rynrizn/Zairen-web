import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { ProductoEditor, type InventarioItem } from './ProductoEditor';

const initialInventoryData: InventarioItem[] = [
  {
    id: 'prod-1',
    sku: 'ZRN-044',
    nombre: 'Samurai Mecha Kanji // Oversized Tee',
    slug: 'samurai-mecha-kanji-oversized-tee',
    coleccion: 'Anime Mecha // Drop 01',
    precio: 145.0,
    costo: 55.0,
    stock: { S: 4, M: 18, L: 12, XL: 0 },
    tejido: 'Algodón Peinado 280 GSM',
    construccion: 'Cuello Ribete 3.5cm // Doble Pespunte',
    estampado: 'Serigrafía tacto cero 4 tintas Neón',
    imagen: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    imagenDorsal: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: true,
  },
  {
    id: 'prod-2',
    sku: 'ZRN-091',
    nombre: 'Cyber-Spine 420GSM // Heavy Hoodie',
    slug: 'cyber-spine-heavy-hoodie',
    coleccion: 'Cyberpunk Tokyo // Spec',
    precio: 280.0,
    costo: 110.0,
    stock: { S: 12, M: 25, L: 19, XL: 6 },
    tejido: 'French Terry Pesado 420 GSM',
    construccion: 'Capucha forrada triple capa // Ojales metálicos',
    estampado: 'Bordado industrial 3D + Serigrafía reflectiva',
    imagen: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: false,
  },
  {
    id: 'prod-3',
    sku: 'ZRN-CG04',
    nombre: 'Cyber Geisha // Oversized Wireframe Tee',
    slug: 'cyber-geisha-oversized-wireframe-tee',
    coleccion: 'Anime Mecha // Drop 01',
    precio: 140.0,
    costo: 52.0,
    stock: { S: 6, M: 8, L: 8, XL: 0 },
    tejido: 'Algodón peinado lavado 240 GSM',
    construccion: 'Corte Boxy Drop Shoulder',
    estampado: 'Serigrafía Neón reactiva a luz UV',
    imagen: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: false,
  },
  {
    id: 'prod-4',
    sku: 'ZRN-TV09',
    nombre: 'Tokyo Vanguard // Boxy Tee Acid Wash',
    slug: 'tokyo-vanguard-boxy-tee',
    coleccion: 'Streetwear Zen // Core',
    precio: 130.0,
    costo: 48.0,
    stock: { S: 0, M: 7, L: 5, XL: 3 },
    tejido: 'Algodón pesado tratado con ácido 260 GSM',
    construccion: 'Costuras reforzadas en hombros',
    estampado: 'Kanji desgastado vintage print',
    imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: false,
  },
  {
    id: 'prod-5',
    sku: 'ZRN-ZKS88',
    nombre: 'Zen Kanji Shadow // Box Cut Heavy Tee',
    slug: 'zen-kanji-shadow-box-cut',
    coleccion: 'Streetwear Zen // Core',
    precio: 125.0,
    costo: 45.0,
    stock: { S: 2, M: 0, L: 4, XL: 0 },
    tejido: 'Algodón orgánico 260 GSM',
    construccion: 'Cuello ancho estilo Shibuya',
    estampado: 'Kanji monocromático en espalda completa',
    imagen: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: false,
  },
  {
    id: 'prod-6',
    sku: 'ZRN-078',
    nombre: 'Void Modular // Tactical Cargo Pant',
    slug: 'void-modular-tactical-cargo',
    coleccion: 'Cyberpunk Tokyo // Spec',
    precio: 310.0,
    costo: 135.0,
    stock: { S: 1, M: 8, L: 10, XL: 4 },
    tejido: 'Ripstop Cordura impermeable con spandex',
    construccion: 'Bolsillos modulares desmontables y correas Fidlock',
    estampado: 'Termotransferencia técnica reflectiva 3M',
    imagen: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop',
    publicado: true,
    destacado: false,
  },
];

export function InventarioManager() {
  const [items, setItems] = useState<InventarioItem[]>(initialInventoryData);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selectedColeccion, setSelectedColeccion] = useState<string>('Todas');
  const [selectedEstado, setSelectedEstado] = useState<'Todos' | 'Disponible' | 'Pocas Uds' | 'Agotado'>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight leading-none">
            CONTROL DE INVENTARIO{' '}
            <span className="text-[#dc143c] font-light text-xl tracking-normal block md:inline font-mono">
              // DROPS & SKUS
            </span>
          </h1>
          <div className="h-0.5 w-60 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent"></div>
        </div>

        {/* Micro-Cards de Estadísticas Rápidas (Ortogonales) */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Total Prendas */}
          <div className="bg-[#1c1b1b]/90 px-4 py-2.5 rounded-none border border-[#2A2A2A] shadow-md flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-8 h-8 rounded-none bg-[#141416] flex items-center justify-center text-[#dc143c] border border-white/[0.04]">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#ac8888] uppercase">Total Prendas</div>
              <div className="font-headline text-base font-bold text-[#e5e2e1] leading-tight">
                {totalPrendas} <span className="font-mono text-[11px] text-[#ac8888] font-normal">uds</span>
              </div>
            </div>
          </div>

          {/* SKUs Activos */}
          <div className="bg-[#1c1b1b]/90 px-4 py-2.5 rounded-none border border-[#2A2A2A] shadow-md flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-8 h-8 rounded-none bg-[#141416] flex items-center justify-center text-[#dc143c] border border-white/[0.04]">
              <span className="material-symbols-outlined text-[18px]">tag</span>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#ac8888] uppercase">SKUs Activos</div>
              <div className="font-headline text-base font-bold text-[#e5e2e1] leading-tight">
                {skusActivos} <span className="font-mono text-[11px] text-[#ac8888] font-normal">refs</span>
              </div>
            </div>
          </div>

          {/* Bajo Stock Crítico */}
          <div className="bg-[#1c1b1b]/90 px-4 py-2.5 rounded-none border border-[#dc143c]/30 shadow-md flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-8 h-8 rounded-none bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[#f87171] uppercase font-bold">Bajo Stock</div>
              <div className="font-headline text-base font-bold text-[#f87171] leading-tight">
                {bajoStockCritico} <span className="font-mono text-[11px] text-[#f87171] font-normal">variantes</span>
              </div>
            </div>
          </div>

          {/* Triggers de Acción */}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              type="button"
              onClick={handleRefreshCdn}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-none bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-[#2A2A2A] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#dc143c]">sync</span>
              <span>Sincronizar CDN</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(220,20,60,0.35)] cursor-pointer border border-[#dc143c]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ AGREGAR PRENDA</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Barra de Filtros y Búsqueda (Ortogonal) */}
      <section className="bg-[#1c1b1b]/80 p-3 rounded-none border border-[#2A2A2A] shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 min-w-[260px] max-w-xl">
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

        {/* Grupo de Filtros */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
          {/* Colección */}
          <div className="flex items-center bg-[#141416] p-1 rounded-none border border-[#2A2A2A]">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase hidden sm:inline">
              Colección:
            </span>
            {['Todas', 'Anime Mecha', 'Streetwear Zen', 'Cyberpunk'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColeccion(col)}
                className={`px-3 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer border ${
                  selectedColeccion === col
                    ? 'bg-[#dc143c] text-white font-bold border-[#dc143c]'
                    : 'text-[#ac8888] hover:text-white border-transparent'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Estado de Stock */}
          <div className="flex items-center bg-[#141416] p-1 rounded-none border border-[#2A2A2A]">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase hidden sm:inline">
              Estado:
            </span>
            {(['Todos', 'Disponible', 'Pocas Uds', 'Agotado'] as const).map((est) => (
              <button
                key={est}
                type="button"
                onClick={() => setSelectedEstado(est)}
                className={`px-2.5 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer border ${
                  selectedEstado === est
                    ? 'bg-[#2a2a2a] text-[#FAF9F6] font-bold border-white/20'
                    : 'text-[#ac8888] hover:text-white border-transparent'
                }`}
              >
                {est}
              </button>
            ))}
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
      <div className="w-full bg-[#1c1b1b]/80 rounded-none p-6 border border-[#2A2A2A] shadow-xl flex flex-col space-y-4">
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

                  {/* Fila de Tallas y Stock Total */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      {['S', 'M', 'L', 'XL'].map((talla) => {
                        const stockTalla = item.stock[talla] || 0;
                        return (
                          <span
                            key={talla}
                            className={`px-2 py-0.5 rounded-none border text-[11px] font-bold ${
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

                    <div className="flex items-center gap-3">
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
          onClick={() => setIsEditorOpen(false)}
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
              }}
              onClose={() => setIsEditorOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
