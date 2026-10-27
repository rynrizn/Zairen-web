import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { siteConfig } from '../../../config/site';

interface AdminSidebarProps {
  activePath?: string;
}

export function AdminSidebar({ activePath = 'panel' }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>('ADMIN');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('zairen_user_role') || 'ADMIN';
      setUserRole(storedRole.toUpperCase());
    }
  }, []);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const { count, error } = await supabase
          .from('pedido')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'PENDIENTE');
        if (!error && count !== null) {
          setPendingOrdersCount(count);
        }
      } catch (e) {}
    }
    fetchPendingCount();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zairen_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zairen_admin_sidebar_collapsed', String(next));
      // Disparar evento para que el contenido principal ajuste su padding si es necesario
      window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { isCollapsed: next } }));
    }
  };

  const handleLogout = async () => {
    if (confirm('¿Deseas cerrar la sesión administrativa de Zairen Lab?')) {
      await supabase.auth.signOut();
      document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
  };

  const navItems = [
    {
      label: 'Panel General',
      path: '/admin',
      id: 'panel',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      label: 'Pedidos',
      path: '/admin/pedidos',
      id: 'pedidos',
      badge: pendingOrdersCount > 0 ? String(pendingOrdersCount) : undefined,
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: 'Inventario',
      path: '/admin/inventario',
      id: 'inventario',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m7.5 4.27 9 5.15" />
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      label: 'Registrar Ventas',
      path: '/admin/ventas',
      id: 'registrar-ventas',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Usuarios & Roles',
      path: '/admin/usuarios',
      id: 'usuarios',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Clientes',
      path: '/admin/clientes',
      id: 'clientes',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      label: 'Interfaz Web',
      path: '/admin/interfaz-web',
      id: 'interfaz-web',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      label: 'Métricas & Reportes',
      path: '/admin/metricas',
      id: 'metricas',
      icon: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
    },
  ];

  const isOperator = userRole === 'OPERADOR' || userRole === 'VENDEDOR';
  const visibleNavItems = navItems.filter((item) => {
    if (isOperator) {
      return ['pedidos', 'registrar-ventas', 'panel'].includes(item.id);
    }
    return true;
  });

  return (
    <>
      {/* ======================================================== */}
      {/* 1. BARRA SUPERIOR MÓVIL (Con botón de 3 líneas horizontales) */}
      {/* ======================================================== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-[#141416]/95 backdrop-blur-xl border-b border-[#2A2A2A] px-4 flex items-center justify-between">
        {/* Botón 3 Líneas Horizontales (Hamburguesa) */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú de navegación de administración"
          className="w-10 h-10 rounded-none bg-[#1c1b1b] border border-[#2A2A2A] flex items-center justify-center text-white cursor-pointer active:scale-95 transition-transform"
        >
          {/* 3 Líneas Horizontales */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Logo Móvil Sin Cajas */}
        <div className="flex items-center gap-2.5">
          <img src="https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp" alt="Logo" className="w-7 h-7 object-contain shrink-0" />
          <span className="font-display font-bold text-sm tracking-wider uppercase text-white">
            {siteConfig.name} <span className="text-[#dc143c] text-[10px] font-mono">// CORE</span>
          </span>
        </div>

        {/* Acciones Móviles */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Ver tienda web"
            className="w-9 h-9 rounded-none bg-[#1c1b1b] border border-[#2A2A2A] text-[#ac8888] hover:text-white flex items-center justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="w-9 h-9 rounded-none bg-[#1c1b1b] hover:bg-[#dc143c] border border-[#2A2A2A] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. DRAWER MÓVIL DESLIZABLE (Backdrop + Menú lateral)      */}
      {/* ======================================================== */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#141416] border-r border-[#2A2A2A] p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Encabezado Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <img src="https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
                  <div>
                    <div className="font-display font-bold text-sm uppercase text-white leading-none">
                      {siteConfig.name}
                    </div>
                    <div className="font-mono text-[9px] text-[#ffb3b3] uppercase tracking-wider">
                      ADMIN CORE // 2026
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-none bg-[#1c1b1b] text-[#ac8888] hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Lista Enlaces Móvil */}
              <nav className="flex flex-col gap-1.5">
                {visibleNavItems.map((item) => {
                  const isActive = activePath === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-none text-xs font-mono uppercase tracking-wider transition-all border ${
                        isActive
                          ? 'bg-[#dc143c] text-white font-bold border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.4)]'
                          : 'text-[#ac8888] hover:bg-[#1c1b1b] hover:text-white border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-none ${
                            isActive ? 'bg-white text-[#dc143c]' : 'bg-[#dc143c] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Footer Drawer */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-none bg-[#1c1b1b] text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#201f1f] border border-[#2A2A2A]"
              >
                <span>Ver Tienda Web</span>
                <span className="text-[10px]">↗</span>
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-none bg-[#7f1d1d]/30 text-[#fca5a5] hover:bg-[#dc143c] hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border border-[#7f1d1d]/50"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SIDEBAR LATERAL PROFESIONAL DESKTOP / TABLET          */}
      {/* ======================================================== */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed top-0 left-0 bottom-0 z-40 bg-[#141416]/95 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          {/* Cabecera Sidebar con Botón Colapsar */}
          <div className="h-20 px-4 flex items-center justify-between border-b border-white/[0.06]">
            {!isCollapsed ? (
              <a href="/admin" className="flex items-center gap-3 overflow-hidden">
                <img src="https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp" alt="Logo" className="w-9 h-9 object-contain shrink-0 filter drop-shadow-[0_0_8px_rgba(220,20,60,0.3)]" />
                <div className="flex flex-col truncate">
                  <span className="font-display font-bold text-sm tracking-wider uppercase text-white truncate">
                    {siteConfig.name}
                  </span>
                  <span className="font-mono text-[9px] text-[#ffb3b3] uppercase tracking-widest leading-none">
                    CONTROL // 2026
                  </span>
                </div>
              </a>
            ) : (
              <a href="/admin" title="Panel General" className="mx-auto block p-1 hover:opacity-80 transition-opacity">
                <img src="https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp" alt="Logo" className="w-8 h-8 object-contain shrink-0 filter drop-shadow-[0_0_8px_rgba(220,20,60,0.3)]" />
              </a>
            )}

            {/* Botón Contraer / Expandir */}
            <button
              type="button"
              onClick={toggleCollapsed}
              title={isCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
              className={`w-8 h-8 rounded-none bg-[#1c1b1b] hover:bg-[#201f1f] text-[#ac8888] hover:text-white border border-white/[0.06] flex items-center justify-center cursor-pointer transition-colors ${
                isCollapsed ? 'hidden' : 'flex'
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Botón Expandir cuando está colapsado (en barra colapsada) */}
          {isCollapsed && (
            <div className="p-3 flex justify-center border-b border-white/[0.04]">
              <button
                type="button"
                onClick={toggleCollapsed}
                title="Expandir barra lateral"
                className="w-9 h-9 rounded-none bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#ac8888] hover:text-white border border-white/[0.06] flex items-center justify-center cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Menú de Enlaces */}
          <nav className="p-3 flex flex-col gap-1.5 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive = activePath === item.id;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-none text-xs font-mono uppercase tracking-wider transition-all border ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    isActive
                      ? 'bg-[#dc143c] text-white font-bold border-[#dc143c] shadow-[0_4px_16px_rgba(220,20,60,0.45)]'
                      : 'text-[#8F8F8C] hover:bg-[#1c1b1b] hover:text-white border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-none ${
                        isActive ? 'bg-white text-[#dc143c]' : 'bg-[#dc143c] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip en modo colapsado */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 rounded-none bg-[#0a0a0a] text-white text-xs font-mono uppercase tracking-wider whitespace-nowrap border border-[#2A2A2A] shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                      {item.badge && ` (${item.badge})`}
                    </div>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Pie de Barra Lateral */}
        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {/* Enlace Tienda Web */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir tienda web pública"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-none bg-[#1c1b1b] hover:bg-[#201f1f] text-[#8F8F8C] hover:text-white border border-[#2A2A2A] text-xs font-mono uppercase tracking-wider transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
            {!isCollapsed && <span className="truncate">Ver Tienda</span>}
          </a>

          {/* Botón Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión administrativa"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-none bg-[#1c1b1b] hover:bg-[#7f1d1d] text-[#8F8F8C] hover:text-white border border-[#2A2A2A] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
