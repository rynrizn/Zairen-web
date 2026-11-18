import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
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
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (next === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('zairen_theme', 'light');
        if (themeMeta) themeMeta.setAttribute('content', '#F6F4EE');
        window.dispatchEvent(new Event('zairen-theme-change'));
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('zairen_theme', 'dark');
        if (themeMeta) themeMeta.setAttribute('content', '#0A0A0A');
        window.dispatchEvent(new Event('zairen-theme-change'));
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
      className={`theme-toggle-btn w-9 h-9 rounded-none flex items-center justify-center transition-colors cursor-pointer border ${className} ${
        theme === 'dark'
          ? 'bg-[#141416] hover:bg-[#201f1f] text-[#8F8F8C] hover:text-[#FAF9F6] border-[#2A2A2A]'
          : 'bg-[#FFFFFF] hover:bg-[#F0EFEB] text-[#141416] border-[#D4D2CD]'
      }`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#FAF9F6]" />
      ) : (
        <Moon className="w-4 h-4 text-[#141416]" />
      )}
    </button>
  );
}
