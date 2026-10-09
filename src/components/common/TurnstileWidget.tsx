import React, { useState, useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, className = '' }: TurnstileWidgetProps) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [useFallbackSlider, setUseFallbackSlider] = useState<boolean>(false);
  const [sliderProgress, setSliderProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  // Intentar inicializar Cloudflare Turnstile oficial
  useEffect(() => {
    let isMounted = true;

    // Si ya está verificado, no re-ejecutar
    if (isVerified) return;

    const initializeTurnstile = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        try {
          window.turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => {
              if (isMounted) {
                setIsVerified(true);
                onVerify(token);
              }
            },
            'error-callback': () => {
              if (isMounted) {
                setUseFallbackSlider(true);
              }
            },
          });
        } catch {
          if (isMounted) setUseFallbackSlider(true);
        }
      } else {
        // Si después de 2.5s no cargó Turnstile oficial (red local o sin clave), activar Slide-to-Verify
        setTimeout(() => {
          if (isMounted && !window.turnstile) {
            setUseFallbackSlider(true);
          }
        }, 2000);
      }
    };

    // Verificar si el script ya existe
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = initializeTurnstile;
      script.onerror = () => {
        if (isMounted) setUseFallbackSlider(true);
      };
      document.head.appendChild(script);
    } else {
      initializeTurnstile();
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, onVerify, isVerified]);

  // Manejo del control interactivo Slide-to-Verify (Fallback Humano)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isVerified || !sliderTrackRef.current) return;
    const touch = e.touches[0];
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const width = rect.width - 40; // Restar ancho del tirador
    const progress = Math.max(0, Math.min(100, (offsetX / width) * 100));
    setSliderProgress(progress);

    if (progress >= 95) {
      completeHumanVerification();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isVerified || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const width = rect.width - 40;
    const progress = Math.max(0, Math.min(100, (offsetX / width) * 100));
    setSliderProgress(progress);

    if (progress >= 95) {
      completeHumanVerification();
    }
  };

  const handleMouseUp = () => {
    if (!isVerified) {
      setIsDragging(false);
      setSliderProgress(0);
    }
  };

  const completeHumanVerification = () => {
    setIsVerified(true);
    setSliderProgress(100);
    setIsDragging(false);
    onVerify(`human-verified-${Date.now()}`);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Contenedor Cloudflare Turnstile */}
      {!useFallbackSlider && !isVerified && (
        <div className="flex flex-col items-center justify-center p-3 bg-[#0e0e0e] border border-white/[0.08] rounded-none">
          <div ref={turnstileContainerRef} className="my-1" />
          <div className="flex items-center gap-1.5 mt-2 opacity-60">
            <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
            </svg>
            <span className="text-[10px] font-mono uppercase text-[#ac8888]">
              Verificación Cloudflare Anti-Bot
            </span>
          </div>
        </div>
      )}

      {/* Control Interactivo Humano (Slide-to-Verify) */}
      {(useFallbackSlider || isVerified) && (
        <div
          ref={sliderTrackRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`relative w-full h-11 bg-[#0e0e0e] border ${
            isVerified ? 'border-[#10b981]/50' : 'border-[#201f1f]'
          } flex items-center select-none overflow-hidden transition-colors`}
        >
          {/* Barra de progreso coloreada */}
          <div
            className={`absolute top-0 bottom-0 left-0 transition-all ${
              isVerified ? 'bg-[#047857]/40 w-full' : 'bg-[#dc143c]/30'
            }`}
            style={{ width: isVerified ? '100%' : `${sliderProgress}%` }}
          />

          {/* Texto de instrucción centrado */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 px-10">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold truncate">
              {isVerified ? (
                <span className="text-[#a7f3d0] flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#10b981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verificado // Humano Confirmado
                </span>
              ) : (
                <span className="text-[#ac8888]">Desliza para verificar ➔</span>
              )}
            </span>
          </div>

          {/* Tirador Deslizable */}
          {!isVerified && (
            <div
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              style={{ left: `${sliderProgress}%` }}
              className={`absolute top-0 bottom-0 w-11 bg-[#FAF9F6] hover:bg-[#dc143c] hover:text-white text-[#0A0A0A] flex items-center justify-center font-bold text-sm cursor-grab active:cursor-grabbing z-20 transition-colors shadow-md border-r border-[#201f1f] ${
                isDragging ? 'scale-105 bg-[#dc143c] text-white' : ''
              }`}
              title="Arrastra para comprobar que no eres un bot"
            >
              ➔
            </div>
          )}
        </div>
      )}
    </div>
  );
}
