import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    setIsVisible(window.scrollY > 400);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('pageshow', checkScroll);
    document.addEventListener('astro:page-load', checkScroll);
    document.addEventListener('astro:after-swap', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('pageshow', checkScroll);
      document.removeEventListener('astro:page-load', checkScroll);
      document.removeEventListener('astro:after-swap', checkScroll);
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      className={`fixed bottom-6 right-6 z-30 w-10 h-10 rounded-none bg-[#141416]/90 hover:bg-[#dc143c] text-[#FAF9F6] border border-[#201f1f] hover:border-[#dc143c] flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer backdrop-blur-sm active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
