import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export type UserRole = 'SuperAdmin' | 'Admin' | 'Vendedor POS' | 'Almacenero';

export interface UsuarioRecord {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  location: string;
  lastLogin: string;
  isActive: boolean;
}

export function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<UsuarioRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfiles() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.from('perfil').select('*');
        if (!error && data && data.length > 0) {
          const mapped: UsuarioRecord[] = data.map((p) => {
            const initials = (p.nombre_completo || 'U')
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            let role: UserRole = 'Vendedor POS';
            if (p.rol === 'SUPERADMIN') role = 'SuperAdmin';
            else if (p.rol === 'ADMIN') role = 'Admin';
            else if (p.rol === 'VISOR') role = 'Almacenero';

            return {
              id: p.id,
              name: p.nombre_completo,
              initials,
              email: p.nombre_completo ? `${p.nombre_completo.toLowerCase().replace(/\s+/g, '.')}@zairenlab.com` : 'usuario@zairenlab.com',
              role,
              location: 'Nodo Central',
              lastLogin: 'Registrado en BD',
              isActive: p.activo,
            };
          });
          setUsuarios(mapped);
        } else {
          // Fallback: consultar el usuario actual en sesión
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            const email = authData.user.email || 'admin@zairenlab.com';
            const name = authData.user.user_metadata?.nombre_completo || 'Administrador Central';
            const initials = name.slice(0, 2).toUpperCase();
            setUsuarios([
              {
                id: authData.user.id,
                name,
                initials,
                email,
                role: 'SuperAdmin',
                location: 'Nodo Central',
                lastLogin: 'En línea ahora',
                isActive: true,
              },
            ]);
          } else {
            setUsuarios([]);
          }
        }
      } catch (e) {
        console.warn('Error cargando perfiles:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  // Form fields
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formRole, setFormRole] = useState<UserRole>('Vendedor POS');
  const [formLocation, setFormLocation] = useState<string>('Nodo Central La Paz');
  const [formActive, setFormActive] = useState<boolean>(true);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setShowPassword(false);
    setFormRole('Vendedor POS');
    setFormLocation('Nodo Central La Paz');
    setFormActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UsuarioRecord) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setShowPassword(false);
    setFormRole(user.role);
    setFormLocation(user.location);
    setFormActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Nombre y correo son requeridos');
      return;
    }

    const initials = formName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (selectedUser) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: formName,
                initials,
                email: formEmail,
                role: formRole,
                location: formLocation,
                isActive: formActive,
              }
            : u
        )
      );

      if (isSupabaseConfigured) {
        const dbRol = formRole === 'SuperAdmin' ? 'SUPERADMIN' : formRole === 'Admin' ? 'ADMIN' : 'VENDEDOR';
        supabase
          .from('perfil')
          .update({
            nombre_completo: formName,
            rol: dbRol,
            activo: formActive,
          })
          .eq('id', selectedUser.id)
          .then();
      }

      toast.success(`Operador ${formName} actualizado`);
    } else {
      const newUser: UsuarioRecord = {
        id: `usr-${Date.now()}`,
        name: formName,
        initials,
        email: formEmail,
        role: formRole,
        location: formLocation,
        lastLogin: 'Sin ingresos',
        isActive: formActive,
      };
      setUsuarios((prev) => [...prev, newUser]);
      toast.success(`Nuevo operador ${formName} registrado`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;
    const newStatus = !target.isActive;

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u))
    );

    if (isSupabaseConfigured) {
      supabase.from('perfil').update({ activo: newStatus }).eq('id', id).then();
    }

    toast.info('Estado de acceso actualizado');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Micro KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-wider font-bold">
              ACCESOS & SEGURIDAD // AUTH CORE
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight">
            GESTIÓN DE USUARIOS <span className="text-[#dc143c] text-xl font-mono font-normal">// OPERADORES OS</span>
          </h1>
          <div className="h-0.5 w-60 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent mt-2"></div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(220,20,60,0.35)] transition-all cursor-pointer border border-[#dc143c]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>+ Nuevo Operador</span>
        </button>
      </div>

      {/* 2. Micro KPIs Ortogonales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1c1b1b]/90 p-4 rounded-none border border-[#201f1f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#141416] border border-[#201f1f] flex items-center justify-center text-[#dc143c]">
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#ac8888] uppercase block">Operadores Registrados</span>
            <span className="font-headline text-lg font-bold text-white">{usuarios.length} cuentas</span>
          </div>
        </div>

        <div className="bg-[#1c1b1b]/90 p-4 rounded-none border border-[#201f1f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#141416] border border-[#201f1f] flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#ac8888] uppercase block">Cuentas Activas</span>
            <span className="font-headline text-lg font-bold text-emerald-400">
              {usuarios.filter((u) => u.isActive).length} operativas
            </span>
          </div>
        </div>

        <div className="bg-[#1c1b1b]/90 p-4 rounded-none border border-[#201f1f] flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#141416] border border-[#201f1f] flex items-center justify-center text-[#ffb3b3]">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#ac8888] uppercase block">Nodos Asignados</span>
            <span className="font-headline text-lg font-bold text-[#ffb3b3]">
              {new Set(usuarios.map((u) => u.location)).size} ubicaciones
            </span>
          </div>
        </div>
      </div>

      {/* 3. Tabla Master de Operadores */}
      <div className="w-full overflow-x-auto rounded-none bg-[#1c1b1b]/90 border border-[#201f1f] shadow-xl">
        <table className="w-full text-left font-sans text-xs">
          <thead className="bg-[#141416]/70 font-mono text-[10px] text-[#ac8888] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Operador</th>
              <th className="py-3 px-4">Correo Electrónico</th>
              <th className="py-3 px-3">Rol Asignado</th>
              <th className="py-3 px-4">Ubicación / Sucursal</th>
              <th className="py-3 px-3">Último Acceso</th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-[#e5e2e1]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs font-mono text-[#ac8888] animate-pulse">
                  Verificando operadores autorizados en Supabase...
                </td>
              </tr>
            ) : usuarios.length > 0 ? (
              usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-[#201f1f]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-none bg-[#201f1f] text-white font-headline text-xs font-bold flex items-center justify-center shrink-0 border border-white/[0.08]">
                        {user.initials}
                      </div>
                      <span className="font-bold text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-[#ac8888]">{user.email}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider border ${
                        user.role === 'SuperAdmin'
                          ? 'bg-[#dc143c]/20 text-[#dc143c] border-[#dc143c]/40'
                          : user.role === 'Vendedor POS'
                          ? 'bg-blue-950 text-blue-300 border-blue-800/40'
                          : 'bg-amber-950 text-amber-300 border-amber-800/40'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#e5e2e1]">{user.location}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-[#ac8888]">
                    {user.lastLogin}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                        user.isActive
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                          : 'bg-red-950 text-red-400 border-red-800 hover:bg-red-900'
                      }`}
                    >
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-none bg-[#141416] hover:bg-[#dc143c] text-[#ac8888] hover:text-white transition-colors cursor-pointer border border-[#201f1f]"
                      title="Editar Permisos"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs font-mono text-[#ac8888]">
                  No hay operadores registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Crear / Editar Operador Ortogonal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#201f1f] rounded-none p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-headline text-base text-white font-bold uppercase tracking-tight">
                {selectedUser ? 'Editar Operador' : 'Registrar Nuevo Operador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center cursor-pointer border border-white/[0.08]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Kenji Sato"
                  className="w-full px-3 py-2 bg-[#1c1b1b] text-white font-sans text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="kenji@zairenlab.com"
                  className="w-full px-3 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  required
                />
              </div>

              {/* Campo Contraseña con Ojito (Mostrar / Ocultar) */}
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                  {selectedUser ? 'Nueva Contraseña (Dejar vacío para mantener)' : 'Contraseña de Acceso'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={selectedUser ? '••••••••••••' : 'Introduce contraseña segura'}
                    required={!selectedUser}
                    className="w-full px-3 py-2 pr-10 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ac8888] hover:text-white p-1 cursor-pointer transition-colors"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      /* Icono Ojo Tachado (Ocultar) */
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      /* Icono Ojo Abierto (Ver) */
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                    Rol
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  >
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Vendedor POS">Vendedor POS</option>
                    <option value="Almacenero">Almacenero</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                    Sucursal / Almacén
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1c1b1b] text-white font-sans text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  >
                    <option value="Nodo Central La Paz">Nodo Central La Paz</option>
                    <option value="Showroom Sopocachi">Showroom Sopocachi</option>
                    <option value="Almacén Central El Alto">Almacén Central El Alto</option>
                    <option value="Pop-Up Santa Cruz Equipetrol">Pop-Up Equipetrol</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#e5e2e1]">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
                  />
                  <span>Cuenta activa y autorizada para inicio de sesión</span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-none bg-[#141416] text-[#ac8888] hover:text-white font-mono text-xs uppercase cursor-pointer border border-[#201f1f]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase transition-all cursor-pointer border border-[#dc143c]"
                >
                  Guardar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
