import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export interface ClienteRecord {
  id: string;
  name: string;
  initials: string;
  phone: string;
  city: string;
  address: string;
  category: 'VIP' | 'Recurrente' | 'Nuevo';
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
  notes?: string;
  orders: {
    id: string;
    ticketNumber: string;
    date: string;
    items: string;
    total: number;
    status: string;
  }[];
}

export function ClientesTable() {
  const [clientes, setClientes] = useState<ClienteRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedCliente, setSelectedCliente] = useState<ClienteRecord | null>(null);

  useEffect(() => {
    async function loadClientes() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('cliente')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching clientes:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const mapped: ClienteRecord[] = data.map((c: any) => {
            const rawName = c.nombre || 'Cliente Particular';
            const initials = rawName
              .split(' ')
              .map((w: string) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'CP';

            const purchases = Number(c.cantidad_compras) || 0;
            const category: 'VIP' | 'Recurrente' | 'Nuevo' =
              c.tipo_cliente === 'VIP' ? 'VIP' : purchases > 1 ? 'Recurrente' : 'Nuevo';

            const lastDate = c.ultimo_contacto
              ? new Date(c.ultimo_contacto).toLocaleDateString('es-BO')
              : c.created_at
              ? new Date(c.created_at).toLocaleDateString('es-BO')
              : 'Reciente';

            return {
              id: c.id,
              name: rawName,
              initials,
              phone: c.telefono || '+591 00000000',
              city: c.ciudad || 'Bolivia',
              address: c.direccion || 'Sin dirección registrada',
              category,
              totalSpent: Number(c.total_gastado) || 0,
              ordersCount: purchases,
              lastOrderDate: lastDate,
              notes: c.notas || undefined,
              orders: [],
            };
          });

          setClientes(mapped);
        } else {
          setClientes([]);
        }
      } catch (err) {
        console.error('Failed to load clientes from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadClientes();
  }, []);

  // Estadísticas
  const totalClientes = clientes.length;
  const vipCount = clientes.filter((c) => c.category === 'VIP').length;
  const totalFacturadoLtv = useMemo(() => {
    return clientes.reduce((acc, c) => acc + c.totalSpent, 0);
  }, [clientes]);

  // Filtrado
  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.city.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        selectedCategory === 'Todos' || c.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [clientes, search, selectedCategory]);

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header & Micro KPIs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-none bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-wider font-bold">
              CRM // DIRECTORIO CENTRAL
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight">
            CLIENTES Y AUDIENCIA <span className="text-[#dc143c] text-xl font-mono font-normal">// STREETWEAR LAB</span>
          </h1>
          <div className="h-0.5 w-60 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent mt-2"></div>
        </div>

        {/* Micro KPIs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#141416] p-3 rounded-none border border-white/[0.06] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#dc143c] text-[20px]">groups</span>
            <div>
              <span className="font-mono text-[10px] text-[#ac8888] uppercase block">Total Clientes</span>
              <span className="font-headline text-base text-white font-bold">{totalClientes} usuarios</span>
            </div>
          </div>

          <div className="bg-[#141416] p-3 rounded-none border border-white/[0.06] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb3b3] text-[20px]">diamond</span>
            <div>
              <span className="font-mono text-[10px] text-[#ac8888] uppercase block">Clientes VIP</span>
              <span className="font-headline text-base text-[#ffb3b3] font-bold">{vipCount} leales</span>
            </div>
          </div>

          <div className="bg-[#141416] p-3 rounded-none border border-white/[0.06] flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">account_balance_wallet</span>
            <div>
              <span className="font-mono text-[10px] text-[#ac8888] uppercase block">LTV Acumulado</span>
              <span className="font-price text-base text-emerald-400 font-bold">Bs {totalFacturadoLtv.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1c1b1b]/80 backdrop-blur-xl p-3 rounded-none border border-white/[0.08] shadow-lg">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ac8888] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, celular (+591...) o ciudad..."
            className="w-full bg-[#141416] text-white font-sans text-xs pl-9 pr-3 py-2 rounded-none border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['Todos', 'VIP', 'Recurrente', 'Nuevo'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-none font-mono text-xs uppercase transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#dc143c] text-white font-bold shadow-sm'
                  : 'bg-[#141416] text-[#ac8888] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tabla Master de Clientes */}
      <div className="w-full overflow-x-auto rounded-none bg-[#1c1b1b]/90 border border-white/[0.08] shadow-xl">
        <table className="w-full text-left font-sans text-xs">
          <thead className="bg-[#141416]/70 font-mono text-[10px] text-[#ac8888] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-3">Segmento</th>
              <th className="py-3 px-4">Contacto Directo</th>
              <th className="py-3 px-4">Ubicación / Ciudad</th>
              <th className="py-3 px-3 text-right">LTV (Total)</th>
              <th className="py-3 px-3 text-center">Órdenes</th>
              <th className="py-3 px-3">Última Compra</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-[#e5e2e1]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs font-mono text-[#ac8888] animate-pulse">
                  Cargando directorio de clientes desde Supabase...
                </td>
              </tr>
            ) : filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => {
                const cleanPhone = cliente.phone.replace(/\D/g, '');
                const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hola ${cliente.name}, te escribimos de ZAIREN LAB.`
                )}`;

                return (
                  <tr key={cliente.id} className="hover:bg-[#201f1f]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-none bg-[#201f1f] text-white font-headline text-xs font-bold flex items-center justify-center shrink-0 border border-white/[0.08]">
                          {cliente.initials}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{cliente.name}</span>
                          {cliente.notes && (
                            <span className="font-mono text-[10px] text-[#ac8888] truncate max-w-xs block">
                              {cliente.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider ${
                          cliente.category === 'VIP'
                            ? 'bg-[#dc143c]/20 text-[#dc143c] border border-[#dc143c]/40'
                            : cliente.category === 'Recurrente'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                            : 'bg-[#201f1f] text-[#ac8888] border border-white/[0.06]'
                        }`}
                      >
                        {cliente.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#ffb3b3]">{cliente.phone}</span>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 rounded-none bg-emerald-950 text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[14px]">chat</span>
                        </a>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#ac8888]">{cliente.city}</td>
                    <td className="py-3.5 px-3 text-right font-price font-bold text-white">
                      Bs {cliente.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-white">
                      {cliente.ordersCount}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-[#ac8888]">
                      {cliente.lastOrderDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedCliente(cliente)}
                        className="px-3 py-1 rounded-none bg-[#141416] hover:bg-[#dc143c] text-[#e5e2e1] hover:text-white font-mono text-[11px] uppercase transition-all cursor-pointer border border-white/[0.06]"
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs font-mono text-[#ac8888]">
                  No hay clientes registrados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Historial de Pedidos del Cliente */}
      {selectedCliente && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-white/[0.1] rounded-none p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-[#dc143c] text-white font-headline text-sm font-bold flex items-center justify-center">
                  {selectedCliente.initials}
                </div>
                <div>
                  <h3 className="font-headline text-base text-white font-bold">
                    {selectedCliente.name}
                  </h3>
                  <span className="font-mono text-xs text-[#ac8888]">
                    {selectedCliente.phone} • {selectedCliente.city}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCliente(null)}
                className="w-8 h-8 rounded-none bg-[#141416] text-[#ac8888] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs text-[#dc143c] uppercase font-bold tracking-wider block">
                Historial de Órdenes ({selectedCliente.orders.length})
              </span>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedCliente.orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-none bg-[#141416] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#dc143c]">{ord.ticketNumber}</span>
                        <span className="text-[#ac8888]">• {ord.date}</span>
                      </div>
                      <p className="font-sans text-[#e5e2e1] mt-1">{ord.items}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-price font-bold text-white block">
                        Bs {ord.total.toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#ac8888] uppercase block">LTV Total Gastado</span>
                <span className="font-price text-lg font-bold text-[#dc143c]">
                  Bs {selectedCliente.totalSpent.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCliente(null)}
                className="px-5 py-2 rounded-none bg-[#141416] hover:bg-[#201f1f] text-white font-mono text-xs uppercase cursor-pointer border border-white/[0.06]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
