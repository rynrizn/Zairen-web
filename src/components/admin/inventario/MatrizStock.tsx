import React from 'react';

export interface StockBySize {
  S: number;
  M: number;
  L: number;
  XL: number;
  [key: string]: number;
}

interface MatrizStockProps {
  stock: StockBySize;
  onChange: (newStock: StockBySize) => void;
  readOnly?: boolean;
}

const SIZES: Array<keyof StockBySize> = ['S', 'M', 'L', 'XL'];

export function MatrizStock({ stock, onChange, readOnly = false }: MatrizStockProps) {
  const total = Object.values(stock).reduce((acc, val) => acc + (val || 0), 0);

  const handleUpdate = (size: keyof StockBySize, delta: number) => {
    if (readOnly) return;
    const current = stock[size] || 0;
    const next = Math.max(0, current + delta);
    onChange({ ...stock, [size]: next });
  };

  const handleSetDirect = (size: keyof StockBySize, value: number) => {
    if (readOnly) return;
    const next = Math.max(0, isNaN(value) ? 0 : value);
    onChange({ ...stock, [size]: next });
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
    <div className="bg-[#141416] p-4 rounded-none space-y-3 border border-white/[0.06] shadow-inner">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#dc143c] animate-pulse"></span>
          <span className="font-mono text-xs text-[#dc143c] uppercase font-bold tracking-wider">
            Matriz de Stock x Talla
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#ac8888] uppercase">KARDEX EN VIVO</span>
      </div>

      <div className="space-y-2">
        {SIZES.map((size) => {
          const count = stock[size] || 0;
          const status = getStatus(count);

          return (
            <div
              key={size}
              className="flex items-center justify-between bg-[#1c1b1b] hover:bg-[#201f1f] px-3 py-2 rounded-none border border-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-none bg-[#2a2a2a] font-mono text-xs font-bold text-white flex items-center justify-center border border-white/[0.06]">
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
                    value={count}
                    onChange={(e) => handleSetDirect(size, parseInt(e.target.value, 10))}
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
                </div>
              ) : (
                <span className="font-price text-sm font-bold text-[#e5e2e1]">
                  {count} uds
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between font-mono text-xs">
        <span className="text-[#ac8888] uppercase">Stock Total Prenda</span>
        <span className="font-bold text-white">{total} UDS</span>
      </div>
    </div>
  );
}
