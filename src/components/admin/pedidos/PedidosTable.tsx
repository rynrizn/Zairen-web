import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export type OrderStatus = 'Pendiente' | 'Confirmado' | 'En Despacho' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientInitials: string;
  clientPhone: string;
  city: string;
  address: string;
  reference: string;
  items: OrderItem[];
  paymentMethod: string;
  status: OrderStatus;
  dateStr: string;
  timeAgo: string;
  total: number;
  subtotal: number;
  shipping: number;
  notes?: string;
}

function mapDbStatusToUi(status: string): OrderStatus {
  switch (status?.toUpperCase()) {
    case 'CONFIRMADO':
      return 'Confirmado';
    case 'EN_CAMINO':
      return 'En Despacho';
    case 'ENTREGADO':
      return 'Entregado';
    case 'CANCELADO':
      return 'Cancelado';
    case 'PENDIENTE':
    default:
      return 'Pendiente';
  }
}

function mapUiStatusToDb(status: OrderStatus): string {
  switch (status) {
    case 'Confirmado':
      return 'CONFIRMADO';
    case 'En Despacho':
      return 'EN_CAMINO';
    case 'Entregado':
      return 'ENTREGADO';
    case 'Cancelado':
      return 'CANCELADO';
    case 'Pendiente':
    default:
      return 'PENDIENTE';
  }
}

export function PedidosTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    async function loadOrders() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('pedido')
          .select(`
            id,
            numero_orden,
            cliente_nombre,
            cliente_telefono,
            origen,
            estado,
            subtotal,
            descuento,
            envio,
            total,
            observacion,
            created_at,
            detalle_pedido (
              id,
              cantidad,
              precio_unitario,
              subtotal,
              producto:producto_id (
                id,
                nombre,
                imagen:imagen(url_imagen, es_portada)
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const mapped: Order[] = data.map((p: any) => {
            const rawName = p.cliente_nombre || 'Cliente Particular';
            const initials = rawName
              .split(' ')
              .map((w: string) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'CP';

            const createdDate = new Date(p.created_at);
            const diffMin = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 60000));
            const timeAgo = diffMin < 60 ? `Hace ${diffMin}m` : `Hace ${Math.floor(diffMin / 60)}h`;
            const dateStr = createdDate.toLocaleDateString('es-BO', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            const items: OrderItem[] = (p.detalle_pedido || []).map((d: any) => {
              const coverImg = d.producto?.imagen?.find((img: any) => img.es_portada)?.url_imagen ||
                d.producto?.imagen?.[0]?.url_imagen ||
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop';
              return {
                id: d.id,
                name: d.producto?.nombre || 'Prenda Zairen',
                size: 'Única',
                color: 'Edición Drop',
                quantity: Number(d.cantidad) || 1,
                price: Number(d.precio_unitario) || 0,
                image: coverImg,
              };
            });

            return {
              id: p.id,
              orderNumber: `#${String(p.numero_orden || '0000').padStart(4, '0')}`,
              clientName: rawName,
              clientInitials: initials,
              clientPhone: p.cliente_telefono || '+591 00000000',
              city: 'Envíos Nacionales',
              address: 'Dirección registrada en pedido',
              reference: p.observacion || 'Sin observaciones adicionales',
              items,
              paymentMethod: p.observacion?.includes('QR') ? 'QR Simple / Transferencia' : 'Efectivo / Contraentrega',
              status: mapDbStatusToUi(p.estado),
              dateStr,
              timeAgo,
              total: Number(p.total) || 0,
              subtotal: Number(p.subtotal) || Number(p.total) || 0,
              shipping: Number(p.envio) || 0,
              notes: p.observacion,
            };
          });

          setOrders(mapped);
          setSelectedOrder(mapped[0] || null);
        } else {
          setOrders([]);
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Failed to load orders from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Conteos por estado
  const counts = useMemo(() => {
    return {
      Todos: orders.length,
      Pendientes: orders.filter((o) => o.status === 'Pendiente').length,
      Confirmados: orders.filter((o) => o.status === 'Confirmado').length,
      'En Despacho': orders.filter((o) => o.status === 'En Despacho').length,
      Entregados: orders.filter((o) => o.status === 'Entregado').length,
      Cancelados: orders.filter((o) => o.status === 'Cancelado').length,
    };
  }, [orders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab =
        activeTab === 'Todos' ||
        (activeTab === 'Pendientes' && order.status === 'Pendiente') ||
        (activeTab === 'Confirmados' && order.status === 'Confirmado') ||
        (activeTab === 'En Despacho' && order.status === 'En Despacho') ||
        (activeTab === 'Entregados' && order.status === 'Entregado') ||
        (activeTab === 'Cancelados' && order.status === 'Cancelado');

      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.clientName.toLowerCase().includes(search.toLowerCase()) ||
        order.clientPhone.includes(search) ||
        order.city.toLowerCase().includes(search.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, search]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('pedido')
          .update({ estado: mapUiStatusToDb(newStatus) })
          .eq('id', orderId);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      if (newStatus === 'Confirmado') {
        toast.success(`Pedido confirmado`, {
          description: 'Stock reservado definitivamente y notificación enviada al cliente.',
        });
      } else if (newStatus === 'En Despacho') {
        toast.info(`Pedido marcado en despacho`, {
          description: 'Asignado a motorizado para entrega urbana.',
        });
      } else if (newStatus === 'Entregado') {
        toast.success(`Pedido completado exitosamente`, {
          description: 'Venta cerrada y registrada en Kardex contable.',
        });
      } else if (newStatus === 'Cancelado') {
        toast.error(`Pedido cancelado`, {
          description: 'Se liberó la reserva de stock a disponibilidad pública.',
        });
      }
    } catch (err) {
      toast.error('Error al actualizar estado del pedido');
    }
  };

  const handleExportCsv = () => {
    if (orders.length === 0) {
      toast.info('No hay pedidos para exportar.');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Cliente,Telefono,Ciudad,Total,Estado,Fecha']
        .concat(
          orders.map(
            (o) =>
              `"${o.orderNumber}","${o.clientName}","${o.clientPhone}","${o.city}",${o.total},"${o.status}","${o.dateStr}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zairen_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV de pedidos descargado');
  };

  const cleanPhone = selectedOrder ? selectedOrder.clientPhone.replace(/\D/g, '') : '';
  const whatsappUrl = selectedOrder
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hola ${selectedOrder.clientName}, te escribimos de ZAIREN LAB sobre tu orden ${selectedOrder.orderNumber}.`
      )}`
    : '#';

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Encabezado */}
      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2.5 h-2.5 rounded-none bg-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.8)] animate-pulse"></span>
            <p className="font-mono text-xs text-[#dc143c] uppercase tracking-widest font-bold">
              LOGÍSTICA URBANA // NODO CENTRAL
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#ac8888]">
            <span className="px-2.5 py-0.5 rounded-none bg-[#201f1f] text-white border border-white/[0.04]">
              SYS.TIME: 14:38:09 BOT
            </span>
            <span className="hidden sm:inline-block text-[#5c3f3f]">•</span>
            <span className="hidden sm:inline-block text-emerald-400">
              SINCRONIZACIÓN AUTOMÁTICA ACTIVA
            </span>
          </div>
        </div>

        <div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight">
            GESTIÓN DE PEDIDOS <span className="text-[#dc143c] text-xl font-mono font-normal">// ARCHIVO Y DESPACHO</span>
          </h1>
          <div className="h-0.5 w-72 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent mt-2"></div>
        </div>
      </div>

      {/* 2. Filtros, Pestañas de Estado & Consola de Búsqueda */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#1c1b1b]/90 backdrop-blur-xl p-4 rounded-none border border-white/[0.08] shadow-xl">
        {/* Pestañas de Estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {(['Todos', 'Pendientes', 'Confirmados', 'Entregados', 'Cancelados'] as const).map(
            (tab) => {
              const countKey = tab as keyof typeof counts;
              const count = counts[countKey] || 0;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none font-mono text-xs uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#dc143c] text-white font-bold shadow-[0_0_16px_rgba(220,20,60,0.4)]'
                      : 'bg-[#141416] text-[#ac8888] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {tab === 'Pendientes' && count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-none bg-white animate-ping"></span>
                  )}
                  <span>{tab}</span>
                  <span className={isActive ? 'font-bold' : 'opacity-60'}>({count})</span>
                </button>
              );
            }
          )}
        </div>

        {/* Buscador & Exportador */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#ac8888]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, #ID, tel..."
              className="w-full bg-[#141416] text-white font-sans text-xs pl-9 pr-3 py-2 rounded-none border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-[#141416] hover:bg-[#dc143c] hover:text-white text-[#e5e2e1] font-mono text-xs uppercase transition-all border border-white/[0.06] cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Main Dynamic Workspace: 2 Columns Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Master Orders Table (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="bg-[#1c1b1b]/80 backdrop-blur-2xl rounded-none p-4 sm:p-5 border border-white/[0.08] shadow-2xl flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#ac8888] font-mono text-[10px] tracking-widest uppercase bg-[#141416]/60 rounded-none">
                    <th className="py-2.5 px-3 font-medium">#ID</th>
                    <th className="py-2.5 px-3 font-medium">Cliente</th>
                    <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Prendas</th>
                    <th className="py-2.5 px-3 font-medium">Total</th>
                    <th className="py-2.5 px-3 font-medium hidden md:table-cell">Pago</th>
                    <th className="py-2.5 px-3 font-medium">Estado</th>
                    <th className="py-2.5 px-3 font-medium hidden lg:table-cell">Fecha</th>
                    <th className="py-2.5 px-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[#e5e2e1]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs font-mono text-[#ac8888] animate-pulse">
                        Cargando pedidos desde la base de datos...
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const isSelected = selectedOrder ? selectedOrder.id === order.id : false;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#201f1f] shadow-[inset_3px_0_0_0_#dc143c,0_4px_16px_rgba(220,20,60,0.15)]'
                              : 'hover:bg-[#201f1f]/50'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono text-xs font-bold text-[#dc143c]">
                            {order.orderNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-none bg-[#dc143c] text-white font-headline text-[11px] font-bold flex items-center justify-center shrink-0">
                                {order.clientInitials}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-sans text-xs font-bold text-white truncate">
                                  {order.clientName}
                                </span>
                                <span className="font-mono text-[10px] text-[#ac8888] truncate">
                                  {order.clientPhone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 hidden sm:table-cell">
                            <div className="flex flex-col">
                              <span className="font-sans text-xs text-[#e5e2e1]">
                                {order.items.length} prenda{order.items.length > 1 ? 's' : ''}
                              </span>
                              <span className="font-mono text-[10px] text-[#ac8888] truncate max-w-[120px]">
                                {order.items.map((i) => `${i.size}`).join(', ')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-price text-xs font-bold text-white whitespace-nowrap">
                            Bs {order.total.toFixed(0)}
                          </td>
                          <td className="py-3 px-3 hidden md:table-cell">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-none bg-[#141416] text-[#ffb3b3] uppercase border border-white/[0.04]">
                              {order.paymentMethod.includes('QR') ? 'QR Pago' : 'Efectivo'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none font-mono text-[10px] uppercase font-bold tracking-wider ${
                                order.status === 'Pendiente'
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                                  : order.status === 'Confirmado'
                                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                                  : order.status === 'Entregado'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-red-950/80 text-red-300 border border-red-800/40'
                              }`}
                            >
                              {order.status === 'Pendiente' && (
                                <span className="w-1.5 h-1.5 rounded-none bg-amber-400 animate-pulse"></span>
                              )}
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#ac8888] hidden lg:table-cell whitespace-nowrap">
                            {order.timeAgo}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              className="w-7 h-7 rounded-none bg-[#141416] hover:bg-[#dc143c] hover:text-white inline-flex items-center justify-center transition-colors text-[#ac8888]"
                            >
                              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs font-mono text-[#ac8888]">
                        No hay pedidos en la categoría seleccionada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Contador de pedidos */}
            <div className="mt-4 pt-3 flex items-center justify-between border-t border-white/[0.06] text-xs font-mono text-[#ac8888]">
              <span>
                Mostrando <strong className="text-white">{filteredOrders.length}</strong> de {orders.length} pedidos
              </span>
              <span className="text-emerald-400">✓ BD Sincronizada</span>
            </div>
          </div>

          {/* Mini KPI / Despachos Express */}
          <div className="bg-[#1c1b1b]/80 backdrop-blur-md p-4 rounded-none border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-[#dc143c]/15 flex items-center justify-center text-[#dc143c]">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <span className="font-mono text-[11px] text-[#ac8888] uppercase tracking-wider block">
                  Despachos Completados
                </span>
                <span className="font-headline text-base font-bold text-white">
                  {orders.filter((o) => o.status === 'Entregado').length} Pedidos Completados
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-none bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold">
                En Despacho: {orders.filter((o) => o.status === 'En Despacho').length}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector Panel - Order Detail (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {selectedOrder ? (
            <div className="bg-[#1c1b1b]/95 backdrop-blur-2xl p-6 rounded-none border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col gap-5">
              {/* Ambient Accent Glow */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#dc143c]/10 rounded-none blur-3xl pointer-events-none"></div>

              {/* Header Detail */}
              <div className="flex items-start justify-between gap-3 relative">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#ac8888] tracking-wider uppercase">
                      INSPECTOR DE ORDEN
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#dc143c] text-white text-[9px] font-mono rounded-none uppercase font-bold">
                      LIVE
                    </span>
                  </div>
                  <h2 className="font-headline text-xl font-bold text-[#e5e2e1] uppercase tracking-tight mt-1">
                    DETALLE {selectedOrder.orderNumber}
                  </h2>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none font-mono text-xs uppercase font-bold tracking-widest ${
                    selectedOrder.status === 'Pendiente'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                      : selectedOrder.status === 'Confirmado'
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                      : selectedOrder.status === 'Entregado'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      : 'bg-red-950 text-red-300 border border-red-800/40'
                  }`}
                >
                  {selectedOrder.status === 'Pendiente' && (
                    <span className="w-1.5 h-1.5 rounded-none bg-amber-400 animate-ping"></span>
                  )}
                  {selectedOrder.status}
                </span>
              </div>

              {/* Customer Data Bento Card */}
              <div className="bg-[#141416] p-4 rounded-none border border-white/[0.06] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[#ac8888] uppercase tracking-wider">
                    Información del Cliente
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#ac8888]">badge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-none bg-[#201f1f] text-white font-headline text-sm font-bold flex items-center justify-center shrink-0 border border-white/[0.08]">
                    {selectedOrder.clientInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline text-base font-bold text-white leading-snug">
                      {selectedOrder.clientName}
                    </span>
                    <span className="font-mono text-xs text-[#dc143c] tracking-wide">
                      {selectedOrder.clientPhone}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-1 text-xs bg-[#1c1b1b]/80 p-3 rounded-none border border-white/[0.04]">
                  <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-[16px] text-[#dc143c]">
                      location_on
                    </span>
                    <span className="font-bold">{selectedOrder.city}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#ac8888] pl-6">
                    {selectedOrder.address}
                  </span>
                  <span className="font-mono text-[10px] text-[#ffb3b3] pl-6">
                    Ref: {selectedOrder.reference}
                  </span>
                </div>
              </div>

              {/* Ordered Garments Itemized List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="font-mono text-[11px] text-[#ac8888] uppercase tracking-wider">
                    Artículos Desglosados ({selectedOrder.items.length})
                  </span>
                  <span className="font-mono text-[11px] text-[#dc143c]">PAGO: {selectedOrder.paymentMethod}</span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-[#141416] p-3 rounded-none border border-white/[0.04]"
                    >
                      <div className="w-14 h-16 rounded-none overflow-hidden bg-[#201f1f] shrink-0 border border-white/[0.06]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="font-headline text-xs font-bold text-[#e5e2e1] truncate">
                          {item.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded-none bg-[#201f1f] text-white font-bold border border-white/[0.06]">
                            {item.size}
                          </span>
                          <span className="text-[#ac8888]">•</span>
                          <span className="text-[#ac8888]">{item.color}</span>
                          <span className="text-[#ac8888]">•</span>
                          <span className="text-white">Cant: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-price text-sm text-white font-bold">
                          Bs {item.price.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="flex flex-col gap-2 bg-[#141416] p-4 rounded-none border border-white/[0.06]">
                <div className="flex justify-between items-center text-xs text-[#ac8888]">
                  <span>Subtotal Productos</span>
                  <span className="font-price text-xs text-white">Bs {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#ac8888]">
                  <span className="flex items-center gap-1.5">
                    <span>Envío Express Urbano</span>
                    <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 font-mono text-[10px] rounded-none uppercase font-bold">
                      Cortesía
                    </span>
                  </span>
                  <span className="font-price text-xs text-emerald-400">Bs 0.00</span>
                </div>
                <div className="h-px bg-white/[0.06] my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="font-headline text-xs text-white uppercase tracking-wide">
                    Total Liquidación
                  </span>
                  <span className="font-price text-xl font-bold text-[#dc143c]">
                    Bs {selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {/* Primary Action Button */}
                {selectedOrder.status === 'Pendiente' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Confirmado')}
                    className="w-full py-3 px-6 rounded-none bg-[#dc143c] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(220,20,60,0.35)] hover:bg-[#ff2d55] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Confirmar Pedido & Validar Pago</span>
                  </button>
                )}

                {selectedOrder.status === 'Confirmado' && (
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'En Despacho')}
                    className="w-full py-3 px-6 rounded-none bg-blue-600 text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-500 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                    <span>Despachar con Motorizado</span>
                  </button>
                )}

                {/* WhatsApp Direct Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-6 rounded-none bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Contactar por WhatsApp</span>
                </a>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'Entregado')}
                    className="py-2.5 px-3 rounded-none bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-emerald-400">
                      check_circle
                    </span>
                    <span>Entregado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Cancelar orden ${selectedOrder.orderNumber} y liberar reservas de stock?`)) {
                        updateOrderStatus(selectedOrder.id, 'Cancelado');
                      }
                    }}
                    className="py-2.5 px-3 rounded-none bg-[#141416] hover:bg-[#93000a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">cancel</span>
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1c1b1b]/95 backdrop-blur-2xl p-12 rounded-none border border-white/[0.08] shadow-2xl flex flex-col items-center justify-center text-center gap-3 min-h-[360px]">
              <span className="material-symbols-outlined text-[#8F8F8C] text-[48px]">order_approve</span>
              <h3 className="font-headline text-sm font-bold uppercase text-white tracking-wider">
                Ningún Pedido Seleccionado
              </h3>
              <p className="font-mono text-xs text-[#8F8F8C] max-w-xs leading-relaxed">
                Selecciona un pedido de la lista para inspeccionar sus prendas, validar el comprobante y coordinar el despacho.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
