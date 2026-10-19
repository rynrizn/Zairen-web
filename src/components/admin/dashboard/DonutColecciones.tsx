import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface CollectionStat {
  name: string;
  count: number;
  percent: number;
  amount: string;
  color: string;
  dashoffset: number;
}

const PALETTE = ['#dc143c', '#ffb3b3', '#f59e0b', '#3b82f6', '#10b981'];

export function DonutColecciones() {
  const [collections, setCollections] = useState<CollectionStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [topPercent, setTopPercent] = useState<string>('0%');
  const [topLabel, setTopLabel] = useState<string>('Sin datos');

  useEffect(() => {
    async function loadCollections() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data: cols } = await supabase
          .from('coleccion')
          .select('id, nombre')
          .eq('activa', true)
          .order('orden', { ascending: true });

        const { data: prods } = await supabase
          .from('producto')
          .select('id, nombre, coleccion_id')
          .eq('activo', true);

        if (cols && cols.length > 0 && prods && prods.length > 0) {
          const totalProds = prods.length;
          let currentOffset = 0;

          const stats: CollectionStat[] = cols.map((col, idx) => {
            const count = prods.filter((p) => p.coleccion_id === col.id).length;
            const percent = totalProds > 0 ? Math.round((count / totalProds) * 100) : 0;
            const color = PALETTE[idx % PALETTE.length];
            const dashoffset = currentOffset;
            currentOffset -= percent;

            return {
              name: col.nombre,
              count,
              percent,
              amount: `${count} prenda(s)`,
              color,
              dashoffset,
            };
          }).filter(c => c.count > 0);

          setCollections(stats);
          if (stats.length > 0) {
            setTopPercent(`${stats[0].percent}%`);
            setTopLabel(stats[0].name.slice(0, 10));
          }
        } else {
          setCollections([]);
        }
      } catch (err) {
        console.error('Failed to load collections stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  return (
    <div className="p-6 rounded-none bg-[#1c1b1b]/90 backdrop-blur-md border border-white/[0.08] shadow-xl flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <span className="text-xs font-mono text-[#e5e2e1] uppercase tracking-wider font-bold">
          Distribución por Colección
        </span>
        <span className="text-[10px] font-mono text-[#dc143c] bg-[#dc143c]/15 px-2 py-0.5 rounded-none uppercase">
          CATÁLOGO
        </span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-[#ac8888] animate-pulse">
          Calculando distribución...
        </div>
      ) : collections.length > 0 ? (
        <>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#141416" strokeWidth="4.5" />
                {collections.map((col) => (
                  <circle
                    key={col.name}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={col.color}
                    strokeWidth="4.5"
                    strokeDasharray={`${col.percent}, 100`}
                    strokeDashoffset={`${col.dashoffset}`}
                    className="transition-all duration-700"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-xl font-bold text-white">{topPercent}</span>
                <span className="text-[9px] font-mono text-[#ac8888] uppercase truncate max-w-[80px]">
                  {topLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.04]">
            {collections.map((col) => (
              <div key={col.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: col.color }} />
                  <span className="text-[#e5e2e1]">{col.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#ac8888]">{col.percent}%</span>
                  <span className="font-bold text-white">{col.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-xs font-mono text-[#ac8888]">
          Sin prendas registradas en colecciones.
        </div>
      )}
    </div>
  );
}
