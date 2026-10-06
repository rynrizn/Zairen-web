import React, { useState } from 'react';

const dataSets = {
  '7D': {
    total: 'Bs 4,820.00',
    percent: '+18.4%',
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    values: [480, 720, 540, 890, 1150, 680, 360],
  },
  '30D': {
    total: 'Bs 18,450.00',
    percent: '+14.2%',
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    values: [3900, 4650, 5100, 4800],
  },
  '12M': {
    total: 'Bs 142,600.00',
    percent: '+32.8%',
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    values: [8500, 9200, 10400, 11200, 12800, 14500, 13200, 12100, 13800, 15400, 10500, 11000],
  },
};

export function VentasChart() {
  const [period, setPeriod] = useState<'7D' | '30D' | '12M'>('7D');
  const current = dataSets[period];
  const maxVal = Math.max(...current.values);

  return (
    <div className="p-6 rounded-2xl bg-[#1c1b1b]/90 backdrop-blur-md border border-white/[0.08] shadow-xl flex flex-col justify-between">
      {/* Cabecera del Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider block">
            Rendimiento Comercial
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight">
              {current.total}
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-mono text-xs font-bold border border-emerald-800/40">
              {current.percent}
            </span>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-full border border-white/[0.06] w-fit">
          {(['7D', '30D', '12M'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#dc143c] text-white shadow-[0_0_8px_rgba(220,20,60,0.5)]'
                  : 'text-[#ac8888] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Visualización de Barras SVG */}
      <div className="h-48 w-full flex items-end gap-3 pt-6 pb-2">
        {current.values.map((val, idx) => {
          const heightPercent = Math.round((val / maxVal) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Tooltip Hover */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white bg-[#0e0e0e] px-1.5 py-0.5 rounded border border-white/[0.1] shadow-lg whitespace-nowrap">
                Bs {val}
              </span>
              {/* Barra */}
              <div className="w-full bg-[#141416] rounded-t-lg overflow-hidden h-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-[#dc143c] to-[#ff2d55] rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-[0_0_8px_rgba(220,20,60,0.3)]"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              {/* Etiqueta */}
              <span className="text-[10px] font-mono text-[#ac8888] group-hover:text-white transition-colors">
                {current.labels[idx]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
