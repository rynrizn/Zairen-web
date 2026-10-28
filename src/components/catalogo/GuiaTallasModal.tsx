import React from 'react';
import { ModalPortal } from '../ui/ModalPortal';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { X } from 'lucide-react';

interface GuiaTallasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuiaTallasModal({ isOpen, onClose }: GuiaTallasModalProps) {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const sizeChart = [
    { size: 'S', chest: '56 cm', length: '72 cm', shoulder: '54 cm', sleeve: '22 cm' },
    { size: 'M', chest: '59 cm', length: '75 cm', shoulder: '56 cm', sleeve: '23 cm' },
    { size: 'L', chest: '62 cm', length: '78 cm', shoulder: '58 cm', sleeve: '24 cm' },
    { size: 'XL', chest: '65 cm', length: '81 cm', shoulder: '60 cm', sleeve: '25 cm' },
  ];

  return (
    <ModalPortal>
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden overscroll-contain"
      onClick={onClose}
    >
      <div
        className="bg-[#141416] border border-white/[0.12] w-full max-w-xl p-6 rounded-none shadow-2xl space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#dc143c]"></span>
            <h3 className="font-headline text-base font-bold uppercase text-white tracking-wider">
              Guía de Medidas (cm)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabla Ortogonal Zen con Scroll Horizontal en Móvil */}
        <div className="overflow-x-auto border border-white/[0.08]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#1c1b1b] text-[#dc143c] uppercase text-[11px] border-b border-white/[0.08]">
              <tr>
                <th className="py-2.5 px-3">Talla</th>
                <th className="py-2.5 px-3">Ancho Pecho</th>
                <th className="py-2.5 px-3">Largo Total</th>
                <th className="py-2.5 px-3">Hombro Caído</th>
                <th className="py-2.5 px-3">Manga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sizeChart.map((row) => (
                <tr key={row.size} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white bg-white/[0.02]">
                    {row.size}
                  </td>
                  <td className="py-2.5 px-3 text-[#e5e2e1]">{row.chest}</td>
                  <td className="py-2.5 px-3 text-[#e5e2e1]">{row.length}</td>
                  <td className="py-2.5 px-3 text-[#e5e2e1]">{row.shoulder}</td>
                  <td className="py-2.5 px-3 text-[#e5e2e1]">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
