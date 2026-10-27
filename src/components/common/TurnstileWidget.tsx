import React, { useState, useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify?: ((token: string) => void) | string;
  className?: string;
  id?: string;
  action?: string;
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

export function TurnstileWidget({ onVerify, className = '', id }: TurnstileWidgetProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFTjTa89HLCIKoL8';

  const handleManualVerification = () => {
    setIsVerified(true);
    setIsBlocked(false);
    setErrorMessage(null);
    if (typeof onVerify === 'function') {
      onVerify('manual_adblock_fallback');
    } else if (typeof onVerify === 'string') {
      const fnName = onVerify.replace(/^window\./, '');
      if (typeof (window as any)[fnName] === 'function') {
        (window as any)[fnName]('manual_adblock_fallback');
      }
    }
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('turnstile:verified', { detail: { token: 'manual_adblock_fallback' } }));
    }
  };

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

          const renderedId = window.turnstile.render(turnstileContainerRef.current, {
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
                    if (typeof onVerify === 'function') {
                      onVerify(token);
                    } else if (typeof onVerify === 'string') {
                      const fnName = onVerify.replace(/^window\./, '');
                      if (typeof (window as any)[fnName] === 'function') {
                        (window as any)[fnName](token);
                      }
                    }
                    if (typeof document !== 'undefined') {
                      document.dispatchEvent(new CustomEvent('turnstile:verified', { detail: { token } }));
                    }
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
                setIsBlocked(true);
              }
            },
            'expired-callback': () => {
              if (isMounted) {
                setIsVerified(false);
                setErrorMessage('El desafío ha expirado. Por favor, reintenta.');
              }
            },
          });
          widgetIdRef.current = renderedId;
        } catch (e) {
          if (isMounted) {
            setIsBlocked(true);
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
          setIsBlocked(true);
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
    <div className={`w-full ${className}`} id={id}>
      <div className="flex flex-col items-center justify-center p-1.5 bg-[#0e0e0e]/90 border border-white/[0.06] rounded-none">
        {/* Contenedor compacto del widget oficial de Cloudflare (<45px) */}
        <div ref={turnstileContainerRef} className="my-0.5 min-h-[44px] flex items-center justify-center scale-95 origin-center" />

        {isVerifying && (
          <div className="flex items-center gap-1.5 my-1 text-[#ffb3b3] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c] animate-ping" />
            <span>Verificando conexión segura...</span>
          </div>
        )}

        {isVerified && (
          <div className="flex items-center gap-1.5 my-0.5 text-emerald-400 text-[10px] font-mono font-bold">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Seguridad Confirmada</span>
          </div>
        )}

        {isBlocked && !isVerified && (
          <div className="w-full my-1 p-1.5 bg-[#141416] border border-white/10 text-center flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[#8F8F8C]">Seguridad de pedido</span>
            <button
              type="button"
              onClick={handleManualVerification}
              className="px-2.5 py-1 bg-[#dc143c] hover:bg-[#ff2d55] text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              ✓ Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
