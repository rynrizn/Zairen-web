import React from 'react';
import type { InventarioItem } from './ProductoEditor';

interface InventarioTableProps {
  items: InventarioItem[];
  selectedId?: string;
  onSelect: (item: InventarioItem) => void;
}

export function InventarioTable({ items, selectedId, onSelect }: InventarioTableProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const total = Object.values(item.stock).reduce((a, b) => a + b, 0);
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`p-3.5 rounded-none space-y-2.5 transition-all cursor-pointer border ${
              isSelected
                ? 'bg-[#201f1f] border-[#dc143c] shadow-[0_0_20px_rgba(220,20,60,0.2)]'
                : 'bg-[#141416]/70 hover:bg-[#201f1f] border-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 rounded-none overflow-hidden shrink-0 bg-[#201f1f] border border-white/[0.06]">
                <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#dc143c]">{item.sku}</span>
                  <span
                    className={`px-2 py-0.5 rounded-none font-mono text-[10px] uppercase font-bold ${
                      total === 0
                        ? 'bg-red-950 text-red-400'
                        : total <= 8
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {total === 0 ? 'Agotado' : total <= 8 ? 'Pocas Uds' : 'Disponible'}
                  </span>
                </div>
                <h3 className="font-headline text-xs font-bold text-[#e5e2e1] truncate mt-0.5">
                  {item.nombre}
                </h3>
                <p className="font-mono text-[10px] text-[#ac8888] truncate">{item.coleccion}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#e5e2e1]">S: {item.stock.S}</span>
                <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#e5e2e1]">M: {item.stock.M}</span>
                <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#e5e2e1]">L: {item.stock.L}</span>
                <span className="bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#e5e2e1]">XL: {item.stock.XL}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">{total} uds</span>
                <button
                  type="button"
                  className="w-7 h-7 rounded-none bg-[#dc143c] text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
