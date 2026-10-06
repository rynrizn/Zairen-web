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
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(initialInventoryData[0]);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);
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
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.8)]"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-widest font-bold">
              STOCK CONTROL // PROTOCOL 04
            </span>
            <span className="text-[#ac8888] font-mono text-xs">// TOKYO ARCHIVE</span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight leading-none">
            CONTROL DE INVENTARIO{' '}
            <span className="text-[#dc143c] font-light text-xl tracking-normal block md:inline font-mono">
              // DROPS & SKUS
            </span>
          </h1>
          <div className="h-0.5 w-60 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent"></div>
        </div>

        {/* Micro-Cards de Estadísticas Rápidas */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Total Prendas */}
          <div className="bg-[#1c1b1b]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08] shadow-md flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-8 h-8 rounded-lg bg-[#141416] flex items-center justify-center text-[#dc143c]">
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
          <div className="bg-[#1c1b1b]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08] shadow-md flex items-center gap-3 flex-1 sm:flex-initial">
            <div className="w-8 h-8 rounded-lg bg-[#141416] flex items-center justify-center text-[#dc143c]">
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
          <div className="bg-[#1c1b1b]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/[0.08] shadow-md flex items-center gap-3 flex-1 sm:flex-initial shadow-[0_0_18px_rgba(220,20,60,0.15)]">
            <div className="w-8 h-8 rounded-lg bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c]">
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
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#e5e2e1] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/[0.06] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#dc143c]">sync</span>
              <span>Sincronizar CDN</span>
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(220,20,60,0.35)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ AGREGAR PRENDA</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Barra de Filtros y Búsqueda */}
      <section className="bg-[#1c1b1b]/80 backdrop-blur-md p-3 rounded-2xl border border-white/[0.08] shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
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
            className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs placeholder:text-[#5c3f3f] pl-10 pr-10 py-2.5 rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none shadow-inner"
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
          <div className="flex items-center bg-[#141416] p-1 rounded-full border border-white/[0.04]">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase hidden sm:inline">
              Colección:
            </span>
            {['Todas', 'Anime Mecha', 'Streetwear Zen', 'Cyberpunk'].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColeccion(col)}
                className={`px-3 py-1 rounded-full font-mono text-xs uppercase transition-all cursor-pointer ${
                  selectedColeccion === col
                    ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                    : 'text-[#ac8888] hover:text-white'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Estado de Stock */}
          <div className="flex items-center bg-[#141416] p-1 rounded-full border border-white/[0.04]">
            <span className="px-2 font-mono text-[10px] text-[#ac8888] uppercase hidden sm:inline">
              Estado:
            </span>
            {(['Todos', 'Disponible', 'Pocas Uds', 'Agotado'] as const).map((est) => (
              <button
                key={est}
                type="button"
                onClick={() => setSelectedEstado(est)}
                className={`px-2.5 py-1 rounded-full font-mono text-xs uppercase transition-all cursor-pointer ${
                  selectedEstado === est
                    ? 'bg-[#2a2a2a] text-[#ffb3b3] font-bold border border-white/[0.08]'
                    : 'text-[#ac8888] hover:text-white'
                }`}
              >
                {est}
              </button>
            ))}
          </div>

          {/* Selector de Vista */}
          <div className="flex items-center bg-[#141416] p-1 rounded-full ml-auto border border-white/[0.04]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista Lista"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
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

      {/* 3. Main Workspace: Side-by-Side Dual Context */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Editor Activo (7 cols en XL cuando está abierto) */}
        {isEditorOpen && (
          <div className="xl:col-span-7">
            <ProductoEditor
              product={selectedItem}
              onSave={handleSaveProduct}
              onClose={() => setIsEditorOpen(false)}
            />
          </div>
        )}

        {/* Tabla / Matriz Global de Stock (5 cols o 12 cols si editor cerrado) */}
        <div
          className={`${
            isEditorOpen ? 'xl:col-span-5' : 'xl:col-span-12'
          } bg-[#1c1b1b]/80 backdrop-blur-md rounded-2xl p-6 border border-white/[0.08] shadow-xl flex flex-col space-y-4`}
        >
          {/* Header de la Tabla */}
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#dc143c]">
                table_chart
              </span>
              <span className="font-headline text-sm font-bold text-[#e5e2e1] uppercase">
                REGISTRO DE STOCK
              </span>
            </div>
            <div className="font-mono text-xs text-[#ac8888]">
              MOSTRANDO {filteredItems.length} DE {items.length} SKUS
            </div>
          </div>

          {/* Listado de Productos */}
          <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const totalItem = Object.values(item.stock).reduce((a, b) => a + b, 0);
                const isSelected = selectedItem?.id === item.id && isEditorOpen;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-3.5 rounded-xl space-y-2.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#201f1f] border-[#dc143c] shadow-[0_0_20px_rgba(220,20,60,0.2)]'
                        : 'bg-[#141416]/70 hover:bg-[#201f1f] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-[#201f1f] border border-white/[0.06]">
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#dc143c]">
                            {item.sku}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold ${
                              totalItem === 0
                                ? 'bg-red-950 text-red-400'
                                : totalItem <= 8
                                ? 'bg-amber-950 text-amber-400'
                                : 'bg-emerald-950 text-emerald-400'
                            }`}
                          >
                            {totalItem === 0
                              ? 'Agotado'
                              : totalItem <= 8
                              ? 'Pocas Uds'
                              : 'Disponible'}
                          </span>
                        </div>
                        <h3 className="font-headline text-xs font-bold text-[#e5e2e1] truncate mt-0.5">
                          {item.nombre}
                        </h3>
                        <p className="font-mono text-[10px] text-[#ac8888] truncate">
                          {item.coleccion}
                        </p>
                      </div>
                    </div>

                    {/* Fila de Tallas y Stock Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.stock.S === 0
                              ? 'bg-red-950/80 text-red-400 font-bold'
                              : item.stock.S <= 3
                              ? 'bg-amber-950/60 text-amber-300'
                              : 'bg-[#2a2a2a] text-[#e5e2e1]'
                          }`}
                        >
                          S: {item.stock.S}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.stock.M === 0
                              ? 'bg-red-950/80 text-red-400 font-bold'
                              : item.stock.M <= 3
                              ? 'bg-amber-950/60 text-amber-300'
                              : 'bg-[#2a2a2a] text-[#e5e2e1]'
                          }`}
                        >
                          M: {item.stock.M}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.stock.L === 0
                              ? 'bg-red-950/80 text-red-400 font-bold'
                              : item.stock.L <= 3
                              ? 'bg-amber-950/60 text-amber-300'
                              : 'bg-[#2a2a2a] text-[#e5e2e1]'
                          }`}
                        >
                          L: {item.stock.L}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.stock.XL === 0
                              ? 'bg-red-950/80 text-red-400 font-bold'
                              : item.stock.XL <= 3
                              ? 'bg-amber-950/60 text-amber-300'
                              : 'bg-[#2a2a2a] text-[#e5e2e1]'
                          }`}
                        >
                          XL: {item.stock.XL}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {totalItem} uds
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(item);
                          }}
                          className="w-7 h-7 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
                          title="Editar prenda"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs font-mono text-[#ac8888]">
                No se encontraron prendas con los filtros aplicados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
