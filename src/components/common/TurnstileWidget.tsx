import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ShieldCheck, ShieldAlert } from 'lucide-react';

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
          'error-callback'?: (errorCode?: any) => void;
          'expired-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({ onVerify, className = '', id, action = 'checkout_order' }: TurnstileWidgetProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAFTjTa89HLCIKoL8';

  const notifyVerified = (token: string) => {
    setIsVerified(true);
    setIsVerifying(false);
    setIsBlocked(false);
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

  const handleReset = () => {
    setIsBlocked(false);
    setIsVerifying(true);
    if (widgetIdRef.current && window.turnstile && typeof window.turnstile.reset === 'function') {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        renderWidget();
      }
    } else {
      renderWidget();
    }
  };

  const renderWidget = () => {
    if (!turnstileContainerRef.current || !window.turnstile) return;

    try {
      // Limpiar instancia previa si existía
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
        action,
        callback: (token: string) => {
          notifyVerified(token);
        },
        'error-callback': () => {
          setIsBlocked(true);
          setIsVerifying(false);
        },
        'expired-callback': () => {
          setIsVerified(false);
          setIsVerifying(false);
          setIsBlocked(true);
        },
      });

      widgetIdRef.current = renderedId;
      setIsVerifying(false);
    } catch {
      setIsBlocked(true);
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupTurnstile = () => {
      if (!isMounted) return;
      if (window.turnstile) {
        renderWidget();
      } else if (!document.getElementById('cf-turnstile-script')) {
        const script = document.createElement('script');
        script.id = 'cf-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) renderWidget();
        };
        script.onerror = () => {
          if (isMounted) {
            setIsBlocked(true);
            setIsVerifying(false);
          }
        };
        document.head.appendChild(script);
      } else {
        // El script ya está en el DOM, esperar a que window.turnstile esté listo
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            if (isMounted) renderWidget();
          }
        }, 100);
        setTimeout(() => clearInterval(interval), 5000);
      }
    };

    setupTurnstile();

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile && typeof window.turnstile.remove === 'function') {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  return (
    <div className={`w-full ${className}`} id={id}>
      <div className="flex flex-col items-center justify-center p-1.5 bg-[#0e0e0e]/90 border border-white/[0.06] rounded-none">
        {/* Contenedor del widget siempre montado en el DOM para evitar fugas de widget */}
        <div
          ref={turnstileContainerRef}
          className={`my-0.5 min-h-[44px] flex items-center justify-center scale-95 origin-center ${
            isVerified ? 'hidden' : ''
          }`}
        />

        {isVerifying && !isVerified && (
          <div className="flex items-center gap-1.5 my-1 text-[#ffb3b3] text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-none bg-[#dc143c] animate-ping" />
            <span>Verificando conexión segura...</span>
          </div>
        )}

        {isVerified && (
          <div className="flex items-center gap-1.5 my-0.5 text-emerald-400 text-[10px] font-mono font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Seguridad Confirmada</span>
          </div>
        )}

        {isBlocked && !isVerified && (
          <div className="w-full my-1 p-2 bg-[#141416] border border-[#dc143c]/30 text-center flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-left">
              <ShieldAlert className="w-3.5 h-3.5 text-[#dc143c] shrink-0" />
              <span className="text-[10px] font-mono text-[#ffb3b3]">Verificación requerida</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 bg-[#1c1b1b] hover:bg-[#dc143c] text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none border border-white/10 hover:border-[#dc143c] flex items-center gap-1 shrink-0"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reintentar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
