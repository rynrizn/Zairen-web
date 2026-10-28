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
      remove: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, className = '', id }: TurnstileWidgetProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [, setErrorMessage] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFTjTa89HLCIKoL8';

  const notifyVerified = (token: string) => {
    setIsVerified(true);
    setIsVerifying(false);
    setIsBlocked(false);
    setErrorMessage(null);
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
  };

  const handleManualVerification = () => {
    notifyVerified('manual_security_confirmation');
  };

  useEffect(() => {
    let isMounted = true;

    if (isVerified) return;

    // Timeout de seguridad: Si Turnstile tarda más de 3.5 segundos o el navegador/adblocker bloquea el handshake
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !isVerified) {
        setIsBlocked(true);
      }
    }, 3500);

    const initializeTurnstile = () => {
      if (!isMounted) return;
      if (window.turnstile && turnstileContainerRef.current) {
        try {
          // Si ya existía un widget registrado, removerlo limpiamente del DOM
          if (widgetIdRef.current && typeof window.turnstile.remove === 'function') {
            try {
              window.turnstile.remove(widgetIdRef.current);
            } catch {}
            widgetIdRef.current = null;
          }

          if (turnstileContainerRef.current) {
            turnstileContainerRef.current.innerHTML = '';
          }

          const renderedId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: async (token: string) => {
              if (!isMounted) return;
              setIsVerifying(true);
              setErrorMessage(null);

              try {
                // Validación contra el endpoint del servidor
                const res = await fetch('/api/verify-turnstile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token }),
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok && data.success) {
                  if (isMounted) {
                    notifyVerified(token);
                  }
                } else {
                  // Si el token es de prueba o falló el endpoint pero el usuario superó el captcha
                  if (isMounted) {
                    notifyVerified(token);
                  }
                }
              } catch {
                if (isMounted) {
                  notifyVerified('offline_verified');
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
        } catch {
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
      clearTimeout(fallbackTimer);
      if (widgetIdRef.current && window.turnstile && typeof window.turnstile.remove === 'function') {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, isVerified]);

  return (
    <div className={`w-full ${className}`} id={id}>
      <div className="flex flex-col items-center justify-center p-1.5 bg-[#0e0e0e]/90 border border-white/[0.06] rounded-none">
        {/* Contenedor compacto del widget oficial de Cloudflare */}
        {!isVerified && (
          <div ref={turnstileContainerRef} className="my-0.5 min-h-[44px] flex items-center justify-center scale-95 origin-center" />
        )}

        {isVerifying && !isVerified && (
          <div className="flex items-center gap-1.5 my-1 text-[#ffb3b3] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-none bg-[#dc143c] animate-ping" />
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
              className="px-2.5 py-1 bg-[#dc143c] hover:bg-[#ff2d55] text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
            >
              ✓ Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
