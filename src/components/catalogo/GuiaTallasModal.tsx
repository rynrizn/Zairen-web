import React, { useEffect, useState } from 'react';
import { ModalPortal } from '../ui/ModalPortal';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { X, Ruler } from 'lucide-react';
import {
  OFFICIAL_SIZE_CHART,
  SIZE_CHART_FOOTNOTE,
  type SizeCode,
} from '../../config/sizeChart';

interface GuiaTallasModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSize?: string;
}

function normalizeSizeCode(value?: string): SizeCode {
  const upper = (value || 'M').trim().toUpperCase();
  if (upper === 'S' || upper === 'M' || upper === 'L' || upper === 'XL') {
    return upper;
  }
  return 'M';
}

export function GuiaTallasModal({ isOpen, onClose, initialSize }: GuiaTallasModalProps) {
  useBodyScrollLock(isOpen);
  const [selectedSize, setSelectedSize] = useState<SizeCode>(() =>
    normalizeSizeCode(initialSize)
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(normalizeSizeCode(initialSize));
    }
  }, [isOpen, initialSize]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeRow =
    OFFICIAL_SIZE_CHART.find((row) => row.size === selectedSize) || OFFICIAL_SIZE_CHART[1];

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guia-tallas-title"
        className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="size-guide-modal relative bg-[#141416] border-t sm:border border-white/[0.12] w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 rounded-none shadow-2xl space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra superior de arrastre visual en móvil */}
          <div className="sm:hidden w-12 h-1 bg-white/20 mx-auto -mt-1 mb-1 select-none" />

          {/* Cabecera */}
          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#dc143c] shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ac8888] font-bold">
                  ZAIREN LAB // MEDIDAS EN CM
                </span>
              </div>
              <h3
                id="guia-tallas-title"
                className="font-display text-lg sm:text-xl font-extrabold uppercase text-white tracking-wider flex items-center gap-2"
              >
                <Ruler className="w-4 h-4 text-[#dc143c] shrink-0" />
                <span>Guía de Tallas</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/[0.08]"
              title="Cerrar guía de tallas"
              aria-label="Cerrar guía de tallas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bloque Superior: Diagrama Técnico SVG + Selector Interactivo de Talla */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Diagrama técnico fiel a las cotas X, Y, T, Θ */}
            <div className="md:col-span-6 size-guide-diagram-box border border-white/[0.08] bg-[#0E0F11] p-4 flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 320 235"
                className="w-full max-w-[260px] h-auto select-none"
                role="img"
                aria-label="Diagrama técnico de medidas de polera: X Ancho, Y Largo, T Ancho de manga y Theta Largo de manga"
              >
                <defs>
                  <marker
                    id="zrn-arrow-end"
                    viewBox="0 0 8 8"
                    refX="7"
                    refY="4"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 7 4 L 0 7 z" className="size-guide-arrow-fill" />
                  </marker>
                  <marker
                    id="zrn-arrow-crimson"
                    viewBox="0 0 8 8"
                    refX="7"
                    refY="4"
                    markerWidth="5.5"
                    markerHeight="5.5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 7 4 L 0 7 z" fill="#dc143c" />
                  </marker>
                </defs>

                {/* Silueta de polera */}
                <path
                  d="M126 24 C138 38, 182 38, 194 24 L224 34 L274 84 L245 112 L222 92 L222 214 L98 214 L98 92 L75 112 L46 84 L96 34 Z"
                  className="size-guide-shirt-shape"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Cuello */}
                <path
                  d="M126 24 C138 44, 182 44, 194 24"
                  fill="none"
                  className="size-guide-shirt-collar"
                  strokeWidth="1.8"
                />

                {/* Cota X — Ancho (Horizontal pecho) */}
                <line
                  x1="101"
                  y1="104"
                  x2="219"
                  y2="104"
                  stroke="#dc143c"
                  strokeWidth="1.6"
                  markerStart="url(#zrn-arrow-crimson)"
                  markerEnd="url(#zrn-arrow-crimson)"
                />
                <text
                  x="160"
                  y="96"
                  textAnchor="middle"
                  className="size-guide-label-accent"
                  fontSize="13"
                  fontWeight="700"
                >
                  X
                </text>

                {/* Cota Y — Largo (Vertical hombro a ruedo) */}
                <line
                  x1="124"
                  y1="29"
                  x2="124"
                  y2="211"
                  className="size-guide-line"
                  strokeWidth="1.5"
                  markerStart="url(#zrn-arrow-end)"
                  markerEnd="url(#zrn-arrow-end)"
                />
                <text
                  x="136"
                  y="142"
                  textAnchor="middle"
                  className="size-guide-label-main"
                  fontSize="13"
                  fontWeight="700"
                >
                  Y
                </text>

                {/* Cota T — Ancho manga (Puño manga izquierda visual) */}
                <line
                  x1="39"
                  y1="91"
                  x2="68"
                  y2="119"
                  className="size-guide-line-outer"
                  strokeWidth="1.5"
                  markerStart="url(#zrn-arrow-end)"
                  markerEnd="url(#zrn-arrow-end)"
                />
                <text
                  x="43"
                  y="121"
                  textAnchor="middle"
                  className="size-guide-label-outer"
                  fontSize="13"
                  fontWeight="700"
                >
                  T
                </text>

                {/* Cota Θ — Largo manga (Borde superior manga derecha visual) */}
                <line
                  x1="233"
                  y1="27"
                  x2="282"
                  y2="76"
                  className="size-guide-line-outer"
                  strokeWidth="1.5"
                  markerStart="url(#zrn-arrow-end)"
                  markerEnd="url(#zrn-arrow-end)"
                />
                <text
                  x="270"
                  y="45"
                  textAnchor="middle"
                  className="size-guide-label-outer"
                  fontSize="14"
                  fontWeight="700"
                >
                  Θ
                </text>
              </svg>
            </div>

            {/* Selector Rápido de Talla + Tarjetas de Medida Activa */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#ac8888] font-bold">
                  Selecciona tu talla
                </span>
                <span className="font-mono text-xs font-bold text-[#dc143c] uppercase">
                  Talla {activeRow.size}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Seleccionar talla para consultar medidas">
                {OFFICIAL_SIZE_CHART.map((row) => {
                  const isActive = row.size === selectedSize;
                  return (
                    <button
                      key={row.size}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedSize(row.size)}
                      className={`h-10 rounded-none font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.35)]'
                          : 'bg-[#1c1b1b] text-[#e5e2e1] border-white/[0.08] hover:border-[#dc143c]'
                      }`}
                    >
                      {row.size}
                    </button>
                  );
                })}
              </div>

              {/* Tarjetas 2x2 de las 4 cotas de la talla activa */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-[#1c1b1b] border border-white/[0.08]">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#ac8888]">
                    <strong className="text-[#dc143c]">X</strong> · Ancho
                  </span>
                  <span className="block font-mono text-sm font-bold text-white mt-0.5">
                    {activeRow.ancho}
                  </span>
                </div>
                <div className="p-2.5 bg-[#1c1b1b] border border-white/[0.08]">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#ac8888]">
                    <strong className="text-[#dc143c]">Y</strong> · Largo
                  </span>
                  <span className="block font-mono text-sm font-bold text-white mt-0.5">
                    {activeRow.largo}
                  </span>
                </div>
                <div className="p-2.5 bg-[#1c1b1b] border border-white/[0.08]">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#ac8888]">
                    <strong className="text-[#dc143c]">T</strong> · Ancho manga
                  </span>
                  <span className="block font-mono text-sm font-bold text-white mt-0.5">
                    {activeRow.anchoManga}
                  </span>
                </div>
                <div className="p-2.5 bg-[#1c1b1b] border border-white/[0.08]">
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#ac8888]">
                    <strong className="text-[#dc143c]">Θ</strong> · Largo manga
                  </span>
                  <span className="block font-mono text-sm font-bold text-white mt-0.5">
                    {activeRow.largoManga}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla Completa Comparativa (Scroll Horizontal Seguro en Pantallas Muy Estrechas) */}
          <div className="overflow-x-auto border border-white/[0.08]">
            <table className="w-full text-center font-mono text-xs min-w-[420px]">
              <thead className="bg-[#1c1b1b] text-[#dc143c] uppercase text-[11px] border-b border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3 text-left">Talla</th>
                  <th className="py-2.5 px-2.5">
                    <span className="block font-bold">X</span>
                    <span className="block text-[9px] font-normal opacity-80 normal-case">
                      (Ancho)
                    </span>
                  </th>
                  <th className="py-2.5 px-2.5">
                    <span className="block font-bold">Y</span>
                    <span className="block text-[9px] font-normal opacity-80 normal-case">
                      (Largo)
                    </span>
                  </th>
                  <th className="py-2.5 px-2.5">
                    <span className="block font-bold">T</span>
                    <span className="block text-[9px] font-normal opacity-80 normal-case">
                      (Ancho manga)
                    </span>
                  </th>
                  <th className="py-2.5 px-2.5">
                    <span className="block font-bold">Θ</span>
                    <span className="block text-[9px] font-normal opacity-80 normal-case">
                      (Largo manga)
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {OFFICIAL_SIZE_CHART.map((row) => {
                  const isActive = row.size === selectedSize;
                  return (
                    <tr
                      key={row.size}
                      onClick={() => setSelectedSize(row.size)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'size-guide-row-active bg-[#dc143c]/12'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <td
                        className={`py-2.5 px-3 text-left font-bold ${
                          isActive ? 'text-[#dc143c]' : 'text-white'
                        }`}
                      >
                        {row.size}
                      </td>
                      <td className="py-2.5 px-2.5 text-[#e5e2e1]">{row.ancho}</td>
                      <td className="py-2.5 px-2.5 text-[#e5e2e1]">{row.largo}</td>
                      <td className="py-2.5 px-2.5 text-[#e5e2e1]">{row.anchoManga}</td>
                      <td className="py-2.5 px-2.5 text-[#e5e2e1]">{row.largoManga}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Nota Legal de Medición en Plano */}
          <p className="text-[11px] font-mono text-[#ac8888] text-center leading-relaxed">
            {SIZE_CHART_FOOTNOTE}
          </p>
        </div>
      </div>
    </ModalPortal>
  );
}
