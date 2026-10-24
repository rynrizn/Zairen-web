import React, { useEffect, useState } from 'react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const updateTheme = () => {
      const isLight = document.documentElement.classList.contains('light');
      setTheme(isLight ? 'light' : 'dark');
    };
    updateTheme();
    window.addEventListener('pageshow', updateTheme);
    window.addEventListener('storage', updateTheme);
    window.addEventListener('zairen-theme-change', updateTheme);
    return () => {
      window.removeEventListener('pageshow', updateTheme);
      window.removeEventListener('storage', updateTheme);
      window.removeEventListener('zairen-theme-change', updateTheme);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof window !== 'undefined') {
      if (next === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('zairen_theme', 'light'); window.dispatchEvent(new Event('zairen-theme-change'));
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('zairen_theme', 'dark'); window.dispatchEvent(new Event('zairen-theme-change'));
      }
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
      aria-label="Alternar tema claro/oscuro"
      className={`theme-toggle-btn w-9 h-9 flex items-center justify-center transition-colors cursor-pointer border ${className} ${
        theme === 'dark'
          ? 'bg-[#141416] hover:bg-[#201f1f] text-[#8F8F8C] hover:text-[#FAF9F6] border-[#2A2A2A]'
          : 'bg-[#FFFFFF] hover:bg-[#F0EFEB] text-[#141416] border-[#D4D2CD]'
      }`}
    >
      {theme === 'dark' ? (
        // Icono Sol (para pasar a claro)
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        // Icono Luna (para pasar a oscuro)
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
