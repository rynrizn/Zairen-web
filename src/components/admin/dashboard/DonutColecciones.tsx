import React from 'react';

const collectionsData = [
  { name: 'Anime Mecha', percent: 58, amount: 'Bs 10,701.00', color: '#dc143c' },
  { name: 'Streetwear Zen', percent: 28, amount: 'Bs 5,166.00', color: '#ffb3b3' },
  { name: 'Cyberpunk Tokyo', percent: 14, amount: 'Bs 2,583.00', color: '#78350f' },
];

export function DonutColecciones() {
  return (
    <div className="p-6 rounded-none bg-[#1c1b1b]/90 backdrop-blur-md border border-white/[0.08] shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-4">
        <span className="text-xs font-mono text-[#e5e2e1] uppercase tracking-wider font-bold">
          Ventas por Colección
        </span>
        <span className="text-[10px] font-mono text-[#dc143c] bg-[#dc143c]/15 px-2 py-0.5 rounded-none uppercase">
          DROP 01
        </span>
      </div>

      <div className="flex items-center justify-center py-4">
        {/* SVG Donut Circle */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            {/* Fondo */}
            <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#141416" strokeWidth="4.5" />
            {/* Segmento 1: Anime Mecha 58% */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#dc143c"
              strokeWidth="4.5"
              strokeDasharray="58, 100"
              strokeDashoffset="0"
              className="transition-all duration-700"
            />
            {/* Segmento 2: Streetwear Zen 28% */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#ffb3b3"
              strokeWidth="4.5"
              strokeDasharray="28, 100"
              strokeDashoffset="-58"
              className="transition-all duration-700"
            />
            {/* Segmento 3: Cyberpunk 14% */}
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4.5"
              strokeDasharray="14, 100"
              strokeDashoffset="-86"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-xl font-bold text-white">58%</span>
            <span className="text-[9px] font-mono text-[#ac8888] uppercase">Mecha Top</span>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="space-y-2 pt-2 border-t border-white/[0.04]">
        {collectionsData.map((col) => (
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
    </div>
  );
}
