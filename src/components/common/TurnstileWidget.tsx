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
          'expired-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, className = '' }: TurnstileWidgetProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFTjTa89HLCIKoL8';

  useEffect(() => {
    let isMounted = true;

    if (isVerified) return;

    const initializeTurnstile = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        try {
          // Si ya había un widget renderizado, limpiarlo
          if (widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current);
          }

          const id = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: async (token: string) => {
              if (!isMounted) return;
              setIsVerifying(true);
              setErrorMessage(null);

              try {
                // Validación real contra el endpoint backend del servidor
                const res = await fetch('/api/verify-turnstile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                  if (isMounted) {
                    setIsVerified(true);
                    setIsVerifying(false);
                    onVerify(token);
                  }
                } else {
                  if (isMounted) {
                    setIsVerifying(false);
                    setErrorMessage('Verificación de seguridad fallida. Reintenta.');
                    if (window.turnstile && widgetIdRef.current) {
                      window.turnstile.reset(widgetIdRef.current);
                    }
                  }
                }
              } catch (err) {
                if (isMounted) {
                  setIsVerifying(false);
                  setErrorMessage('Error al conectar con el servidor de seguridad.');
                }
              }
            },
            'error-callback': () => {
              if (isMounted) {
                setErrorMessage('No se pudo cargar el desafío de seguridad Cloudflare.');
              }
            },
            'expired-callback': () => {
              if (isMounted) {
                setIsVerified(false);
                setErrorMessage('El desafío ha expirado. Por favor, reintenta.');
              }
            },
          });
          widgetIdRef.current = id;
        } catch (e) {
          if (isMounted) {
            setErrorMessage('Error al inicializar Cloudflare Turnstile.');
          }
        }
      }
    };

    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = initializeTurnstile;
      script.onerror = () => {
        if (isMounted) {
          setErrorMessage('Error de red al conectar con Cloudflare Turnstile.');
        }
      };
      document.head.appendChild(script);
    } else {
      initializeTurnstile();
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, onVerify, isVerified]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center justify-center p-3 bg-[#0e0e0e] border border-white/[0.08] rounded-none">
        {/* Contenedor del widget oficial de Cloudflare */}
        <div ref={turnstileContainerRef} className="my-1 min-h-[65px] flex items-center justify-center" />

        {isVerifying && (
          <div className="flex items-center gap-2 mt-2 text-[#ffb3b3] text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#dc143c] animate-ping" />
            <span>Validando token con Cloudflare...</span>
          </div>
        )}

        {isVerified && (
          <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-[11px] font-mono font-bold">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Verificación Exitosa // Humano Confirmado</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-2 text-xs font-mono text-[#ff5449] text-center">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-2 opacity-60">
          <svg className="w-3.5 h-3.5 fill-amber-500" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
          </svg>
          <span className="text-[10px] font-mono uppercase text-[#ac8888]">
            Protección Cloudflare Turnstile Oficial
          </span>
        </div>
      </div>
    </div>
  );
}
