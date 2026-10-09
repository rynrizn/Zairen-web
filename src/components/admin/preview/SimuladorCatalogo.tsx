import React, { useState } from 'react';
import { toast } from 'sonner';

export function SimuladorCatalogo() {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState<'100%' | '75%' | '50%'>('100%');
  const [iframeKey, setIframeKey] = useState<number>(0);

  const getWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[400px] h-[820px]';
      case 'tablet':
        return 'max-w-[768px] h-[900px]';
      case 'desktop':
      default:
        return 'max-w-[1440px] h-[900px]';
    }
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    toast.success('Simulador recargado');
  };

  const handlePurgeCdn = () => {
    toast.success('Caché CDN purgada en nodos EDGE', {
      description: 'Los cambios de catálogo están disponibles inmediatamente.',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barra de Controles del Simulador */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1c1b1b]/90 backdrop-blur-xl p-4 rounded-none border border-white/[0.08] shadow-xl">
        {/* Izquierda: Título y Estado */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-none bg-[#dc143c] shadow-[0_0_10px_rgba(220,20,60,0.8)] animate-pulse"></span>
            <h2 className="font-headline text-base text-white font-bold tracking-tight uppercase">
              VISTA PREVIA DEL CATÁLOGO <span className="font-mono text-xs text-[#dc143c]">// LIVE SIMULATOR</span>
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-emerald-950/60 text-emerald-400 font-mono text-[10px] border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-400"></span>
            PRODUCCIÓN ACTIVA
          </span>
        </div>

        {/* Centro: Selector de Viewport */}
        <div className="flex items-center gap-1 bg-[#141416] p-1 rounded-none border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                : 'text-[#ac8888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">desktop_windows</span>
            <span>Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                : 'text-[#ac8888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">tablet</span>
            <span>Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase transition-all cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                : 'text-[#ac8888] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">smartphone</span>
            <span>Móvil</span>
          </button>
        </div>

        {/* Derecha: Acciones */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePurgeCdn}
            className="px-3 py-1.5 rounded-none bg-[#141416] hover:bg-[#201f1f] text-white font-mono text-xs uppercase flex items-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px] text-[#dc143c]">bolt</span>
            <span>Purgar CDN</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-[0_4px_16px_rgba(220,20,60,0.35)]"
          >
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            <span>Abrir Tienda</span>
          </a>
        </div>
      </div>

      {/* Marco de Simulación del Navegador */}
      <div className="w-full flex justify-center items-start pb-12">
        <div
          className={`w-full ${getWidthClass()} bg-[#141416] rounded-none shadow-[0_24px_64px_rgba(0,0,0,0.7)] border border-white/[0.08] overflow-hidden transition-all duration-300 relative flex flex-col`}
        >
          {/* Barra Superior estilo Navegador */}
          <div className="h-10 w-full bg-[#1c1b1b] px-4 flex items-center justify-between border-b border-white/[0.06] select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-none bg-[#ff5f56] inline-block opacity-80"></span>
              <span className="w-3 h-3 rounded-none bg-[#ffbd2e] inline-block opacity-80"></span>
              <span className="w-3 h-3 rounded-none bg-[#27c93f] inline-block opacity-80"></span>
            </div>

            {/* Barra de Dirección URL */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-none bg-[#141416] text-[#ac8888] w-1/2 max-w-sm justify-between border border-white/[0.04]">
              <div className="flex items-center gap-1.5 truncate">
                <span className="material-symbols-outlined text-[13px] text-emerald-400">lock</span>
                <span className="font-mono text-[11px] truncate tracking-wide text-white">
                  https://zairenlab.com/
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="hover:text-white transition-colors cursor-pointer"
                title="Recargar página"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-[#ac8888]">
              <span>ZRN-NODE-BOLIVIA</span>
              <span className="w-2 h-2 rounded-none bg-emerald-400"></span>
            </div>
          </div>

          {/* Iframe con la Tienda Real */}
          <div className="w-full flex-1 bg-[#131313] relative overflow-hidden">
            <iframe
              key={iframeKey}
              src="/"
              title="Zairen Lab Public Storefront"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
