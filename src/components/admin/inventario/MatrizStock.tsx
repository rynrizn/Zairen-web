import React, { useState } from 'react';

export interface StockBySize {
  [key: string]: number;
}

interface MatrizStockProps {
  stock: StockBySize;
  onChange: (newStock: StockBySize) => void;
  readOnly?: boolean;
}

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export function MatrizStock({ stock, onChange, readOnly = false }: MatrizStockProps) {
  const [customSizeInput, setCustomSizeInput] = useState<string>('');
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);

  // Obtener lista de tallas activas en el stock actual
  const activeSizes = Object.keys(stock);
  const total = Object.values(stock).reduce((acc, val) => acc + (Number(val) || 0), 0);

  const handleUpdate = (size: string, delta: number) => {
    if (readOnly) return;
    const current = stock[size] || 0;
    const next = Math.max(0, current + delta);
    onChange({ ...stock, [size]: next });
  };

  const handleSetDirect = (size: string, value: number) => {
    if (readOnly) return;
    const next = Math.max(0, isNaN(value) ? 0 : value);
    onChange({ ...stock, [size]: next });
  };

  const handleAddPresetSize = (size: string) => {
    if (readOnly) return;
    if (stock[size] !== undefined) return;
    onChange({ ...stock, [size]: 0 });
  };

  const handleAddCustomSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (readOnly) return;
    const cleanSize = customSizeInput.trim().toUpperCase();
    if (!cleanSize) return;

    if (stock[cleanSize] !== undefined) {
      setCustomSizeInput('');
      setShowAddCustom(false);
      return;
    }

    onChange({ ...stock, [cleanSize]: 0 });
    setCustomSizeInput('');
    setShowAddCustom(false);
  };

  const handleRemoveSize = (size: string) => {
    if (readOnly) return;
    const currentQty = stock[size] || 0;

    if (currentQty > 0) {
      const confirmRemove = window.confirm(
        `La talla "${size}" tiene ${currentQty} unidad(es) registrada(s). ¿Estás seguro de que deseas eliminarla de esta prenda?`
      );
      if (!confirmRemove) return;
    }

    const nextStock = { ...stock };
    delete nextStock[size];
    onChange(nextStock);
  };

  const getStatus = (count: number) => {
    if (count === 0) {
      return { text: 'Agotado', color: 'text-[#f87171] font-bold' };
    }
    if (count <= 3) {
      return { text: 'Pocas uds', color: 'text-[#fbbf24]' };
    }
    return { text: 'Disponible', color: 'text-emerald-400' };
  };

  return (
    <div className="bg-[#141416] p-3.5 sm:p-4 rounded-none space-y-3.5 border border-white/[0.06] shadow-inner">
      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#dc143c] animate-pulse"></span>
          <span className="font-mono text-xs text-[#dc143c] uppercase font-bold tracking-wider">
            Matriz de Stock x Talla
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#ac8888] uppercase">KARDEX EN VIVO</span>
      </div>

      {/* Selector de Chips de Tallas Disponibles para Agregar */}
      {!readOnly && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#ac8888] uppercase tracking-wider">
              Tallas Rápidas // Click para activar:
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="font-mono text-[10px] text-[#dc143c] hover:underline uppercase font-bold cursor-pointer"
            >
              {showAddCustom ? '✕ Cancelar' : '+ Talla especial'}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESET_SIZES.map((size) => {
              const isAdded = stock[size] !== undefined;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => (!isAdded ? handleAddPresetSize(size) : handleRemoveSize(size))}
                  className={`px-2 py-1 font-mono text-xs rounded-none transition-all cursor-pointer border ${
                    isAdded
                      ? 'bg-[#dc143c] text-white border-[#dc143c] font-bold'
                      : 'bg-[#1c1b1b] text-[#ac8888] border-white/[0.08] hover:border-white/20 hover:text-white'
                  }`}
                  title={isAdded ? `Talla ${size} activa (click para quitar)` : `Agregar talla ${size}`}
                >
                  {isAdded ? `✓ ${size}` : `+ ${size}`}
                </button>
              );
            })}
          </div>

          {/* Formulario para talla personalizada */}
          {showAddCustom && (
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                placeholder="Ej: 4XL, ÚNICA, OVER..."
                className="flex-1 bg-[#1c1b1b] text-white font-mono text-xs px-2.5 py-1.5 border border-[#dc143c] focus:outline-none uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSize();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleAddCustomSize()}
                className="px-3 py-1.5 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold cursor-pointer"
              >
                Agregar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Filas de Stock de Tallas Activas */}
      <div className="space-y-1.5 pt-1">
        {activeSizes.length === 0 ? (
          <div className="p-3 text-center bg-[#1c1b1b] border border-white/[0.04]">
            <p className="font-mono text-xs text-[#ac8888]">
              No hay tallas configuradas para esta prenda. Selecciona un chip arriba para empezar.
            </p>
          </div>
        ) : (
          activeSizes.map((size) => {
            const count = stock[size] || 0;
            const status = getStatus(count);

            return (
              <div
                key={size}
                className="flex items-center justify-between bg-[#1c1b1b] hover:bg-[#201f1f] px-3 py-2 rounded-none border border-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-7 rounded-none bg-[#2a2a2a] font-mono text-xs font-bold text-white flex items-center justify-center border border-white/[0.06]">
                    {size}
                  </span>
                  <span className={`font-mono text-[11px] ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                {!readOnly ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdate(size, -1)}
                      disabled={count <= 0}
                      className="w-7 h-7 rounded-none bg-[#2a2a2a] hover:bg-[#353534] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                      aria-label={`Disminuir stock talla ${size}`}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={Number.isNaN(count) || count === undefined ? 0 : count}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        handleSetDirect(size, Number.isNaN(val) ? 0 : val);
                      }}
                      className="w-12 text-center font-price text-sm bg-[#141416] text-white font-bold py-1 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(size, 1)}
                      className="w-7 h-7 rounded-none bg-[#2a2a2a] hover:bg-[#353534] text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                      aria-label={`Aumentar stock talla ${size}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(size)}
                      className="w-7 h-7 rounded-none bg-[#201f1f] hover:bg-red-950 hover:text-red-400 text-[#ac8888] flex items-center justify-center text-xs font-mono ml-1 cursor-pointer transition-colors"
                      title={`Quitar talla ${size}`}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="font-price text-sm font-bold text-[#e5e2e1]">
                    {count} uds
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between font-mono text-xs">
        <span className="text-[#ac8888] uppercase">Stock Total Prenda</span>
        <span className="font-bold text-white font-price">{total} UDS</span>
      </div>
    </div>
  );
}
