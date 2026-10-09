import React from 'react';

const topProducts = [
  {
    rank: '#1',
    name: 'Samurai Mecha Kanji Tee',
    sku: 'ZRN-044',
    sold: 48,
    revenue: 'Bs 6,960.00',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=200&auto=format&fit=crop',
  },
  {
    rank: '#2',
    name: 'Cyber-Spine Heavy Hoodie',
    sku: 'ZRN-091',
    sold: 24,
    revenue: 'Bs 6,720.00',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop',
  },
  {
    rank: '#3',
    name: 'Cyber Geisha Wireframe Tee',
    sku: 'ZRN-CG04',
    sold: 19,
    revenue: 'Bs 2,660.00',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=200&auto=format&fit=crop',
  },
  {
    rank: '#4',
    name: 'Tokyo Vanguard Acid Tee',
    sku: 'ZRN-TV09',
    sold: 16,
    revenue: 'Bs 2,080.00',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop',
  },
];

export function TopVendidos() {
  return (
    <div className="p-6 rounded-none bg-[#1c1b1b]/90 backdrop-blur-md border border-white/[0.08] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono text-[#dc143c] uppercase tracking-widest font-bold block">
            RANKING COMERCIAL
          </span>
          <h3 className="text-sm font-bold font-headline uppercase text-[#e5e2e1]">
            Prendas Más Vendidas
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#ac8888]">Últimos 30 días</span>
      </div>

      <div className="space-y-3">
        {topProducts.map((p) => (
          <div
            key={p.sku}
            className="flex items-center justify-between gap-3 p-3 rounded-none bg-[#201f1f] hover:bg-[#2a2a2a] transition-all border border-white/[0.03]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs font-bold text-[#dc143c] w-6 shrink-0">
                {p.rank}
              </span>
              <img
                src={p.image}
                alt={p.name}
                className="w-10 h-12 object-cover rounded-none bg-[#141416] shrink-0 border border-white/[0.06]"
              />
              <div className="min-w-0">
                <h4 className="font-display text-xs font-bold uppercase text-[#e5e2e1] truncate">
                  {p.name}
                </h4>
                <span className="text-[10px] font-mono text-[#ac8888]">{p.sku}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-xs font-bold text-white block">
                {p.sold} uds
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {p.revenue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
