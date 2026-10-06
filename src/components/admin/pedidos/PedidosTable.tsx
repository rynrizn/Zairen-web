import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';

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

const initialOrders: Order[] = [
  {
    id: 'ord-128',
    orderNumber: '#0128',
    clientName: 'Mateo Rojas',
    clientInitials: 'MR',
    clientPhone: '+591 78945612',
    city: 'La Paz - Sopocachi',
    address: 'Calle 20 #410, Edificio Solaris, Apto 4B',
    reference: 'Frente a Plaza Abaroa / Portería 24h',
    items: [
      {
        id: 'i-1',
        name: 'Samurai Mecha Kanji // Oversized Tee',
        size: 'XL',
        color: 'Blanco Hueso',
        quantity: 1,
        price: 145.0,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'i-2',
        name: 'Cyber Geisha // Oversized Wireframe Tee',
        size: 'M',
        color: 'Negro Mate',
        quantity: 1,
        price: 135.0,
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'QR Simple / Transferencia',
    status: 'Pendiente',
    dateStr: 'Hoy 14:26',
    timeAgo: 'Hace 12m',
    subtotal: 280.0,
    shipping: 0.0,
    total: 280.0,
  },
  {
    id: 'ord-127',
    orderNumber: '#0127',
    clientName: 'Lucía Fernández',
    clientInitials: 'LF',
    clientPhone: '+591 60129481',
    city: 'Cochabamba - Cala Cala',
    address: 'Av. Libertador Bolívar #1420',
    reference: 'Casa de dos pisos portón negro',
    items: [
      {
        id: 'i-3',
        name: 'Tokyo Vanguard // Boxy Tee Acid Wash',
        size: 'S',
        color: 'Acid Charcoal',
        quantity: 1,
        price: 130.0,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'Efectivo contra entrega',
    status: 'Pendiente',
    dateStr: 'Hoy 14:04',
    timeAgo: 'Hace 34m',
    subtotal: 130.0,
    shipping: 0.0,
    total: 130.0,
  },
  {
    id: 'ord-126',
    orderNumber: '#0126',
    clientName: 'Carlos Mamani',
    clientInitials: 'CM',
    clientPhone: '+591 76543210',
    city: 'Santa Cruz - Equipetrol',
    address: 'Calle 8 Este #45, Edificio Platinum Penthouse 2',
    reference: 'Llamar antes de llegar',
    items: [
      {
        id: 'i-4',
        name: 'Zen Kanji Shadow // Box Cut Heavy Tee',
        size: 'L',
        color: 'Negro Profundo',
        quantity: 1,
        price: 125.0,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'Efectivo contra entrega',
    status: 'Pendiente',
    dateStr: 'Hoy 13:30',
    timeAgo: 'Hace 1h',
    subtotal: 125.0,
    shipping: 0.0,
    total: 125.0,
  },
  {
    id: 'ord-125',
    orderNumber: '#0125',
    clientName: 'Alejandro Cruz',
    clientInitials: 'AC',
    clientPhone: '+591 71549920',
    city: 'La Paz - San Miguel',
    address: 'Calle 21 Calacoto #850, Torre Cesur 3A',
    reference: 'Entregar en recepción con portero',
    items: [
      {
        id: 'i-5',
        name: 'Void Modular // Tactical Cargo Pant',
        size: 'M',
        color: 'Negro Táctico',
        quantity: 1,
        price: 310.0,
        image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'i-6',
        name: 'Tokyo Vanguard // Boxy Tee Acid Wash',
        size: 'L',
        color: 'Acid Charcoal',
        quantity: 1,
        price: 130.0,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'QR Simple / Transferencia',
    status: 'Confirmado',
    dateStr: 'Hoy 11:20',
    timeAgo: 'Hace 3h',
    subtotal: 440.0,
    shipping: 0.0,
    total: 440.0,
  },
  {
    id: 'ord-124',
    orderNumber: '#0124',
    clientName: 'Valentina Paz',
    clientInitials: 'VP',
    clientPhone: '+591 79901412',
    city: 'Cochabamba - Recoleta',
    address: 'Av. América Este #320',
    reference: 'Al lado de la cafetería',
    items: [
      {
        id: 'i-7',
        name: 'Cyber-Spine 420GSM // Heavy Hoodie',
        size: 'S',
        color: 'Gris Washed',
        quantity: 1,
        price: 280.0,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'Transferencia Bancaria',
    status: 'Confirmado',
    dateStr: 'Ayer 18:40',
    timeAgo: 'Ayer',
    subtotal: 280.0,
    shipping: 0.0,
    total: 280.0,
  },
  {
    id: 'ord-120',
    orderNumber: '#0120',
    clientName: 'Daniel Choque',
    clientInitials: 'DC',
    clientPhone: '+591 72088193',
    city: 'La Paz - Miraflores',
    address: 'Av. Saavedra #1230, Edif. Illimani',
    reference: 'Piso 7',
    items: [
      {
        id: 'i-8',
        name: 'Samurai Mecha Kanji // Oversized Tee',
        size: 'L',
        color: 'Negro Washed',
        quantity: 1,
        price: 145.0,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=400&auto=format&fit=crop',
      },
      {
        id: 'i-9',
        name: 'Zen Kanji Shadow // Box Cut Heavy Tee',
        size: 'L',
        color: 'Negro Profundo',
        quantity: 1,
        price: 125.0,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'QR Simple / Transferencia',
    status: 'Entregado',
    dateStr: '24 Oct 16:15',
    timeAgo: '24 Oct',
    subtotal: 270.0,
    shipping: 0.0,
    total: 270.0,
  },
  {
    id: 'ord-118',
    orderNumber: '#0118',
    clientName: 'Esteban Morales',
    clientInitials: 'EM',
    clientPhone: '+591 67812903',
    city: 'Santa Cruz - Villa 1ro de Mayo',
    address: 'Calle 4 #12',
    reference: 'Frente al parque',
    items: [
      {
        id: 'i-10',
        name: 'Cyber Geisha // Oversized Wireframe Tee',
        size: 'XL',
        color: 'Negro Mate',
        quantity: 1,
        price: 140.0,
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop',
      },
    ],
    paymentMethod: 'Efectivo contra entrega',
    status: 'Cancelado',
    dateStr: '23 Oct 12:00',
    timeAgo: '23 Oct',
    subtotal: 140.0,
    shipping: 0.0,
    total: 140.0,
  },
];

export function PedidosTable() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order>(initialOrders[0]);
  const [activeTab, setActiveTab] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');

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

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
    }

    if (newStatus === 'Confirmado') {
      toast.success(`Pedido ${selectedOrder.orderNumber} confirmado`, {
        description: 'Stock reservado definitivamente y notificación enviada al cliente.',
      });
    } else if (newStatus === 'En Despacho') {
      toast.info(`Pedido ${selectedOrder.orderNumber} marcado en despacho`, {
        description: 'Asignado a motorizado para entrega urbana.',
      });
    } else if (newStatus === 'Entregado') {
      toast.success(`Pedido ${selectedOrder.orderNumber} completado exitosamente`, {
        description: 'Venta cerrada y registrada en Kardex contable.',
      });
    } else if (newStatus === 'Cancelado') {
      toast.error(`Pedido ${selectedOrder.orderNumber} cancelado`, {
        description: 'Se liberó la reserva de stock a disponibilidad pública.',
      });
    }
  };

  const handleExportCsv = () => {
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

  const cleanPhone = selectedOrder.clientPhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${selectedOrder.clientName}, te escribimos de ZAIREN LAB sobre tu orden ${selectedOrder.orderNumber}.`
  )}`;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Encabezado */}
      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.8)] animate-pulse"></span>
            <p className="font-mono text-xs text-[#dc143c] uppercase tracking-widest font-bold">
              LOGÍSTICA URBANA // NODO CENTRAL
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#ac8888]">
            <span className="px-2.5 py-0.5 rounded-full bg-[#201f1f] text-white border border-white/[0.04]">
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#1c1b1b]/90 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] shadow-xl">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-xs uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#dc143c] text-white font-bold shadow-[0_0_16px_rgba(220,20,60,0.4)]'
                      : 'bg-[#141416] text-[#ac8888] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {tab === 'Pendientes' && count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
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
              className="w-full bg-[#141416] text-white font-sans text-xs pl-9 pr-3 py-2 rounded-full border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#141416] hover:bg-[#dc143c] hover:text-white text-[#e5e2e1] font-mono text-xs uppercase transition-all border border-white/[0.06] cursor-pointer shadow-sm"
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
          <div className="bg-[#1c1b1b]/80 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-2xl flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#ac8888] font-mono text-[10px] tracking-widest uppercase bg-[#141416]/60 rounded-lg">
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
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const isSelected = selectedOrder.id === order.id;
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
                              <div className="w-7 h-7 rounded-full bg-[#dc143c] text-white font-headline text-[11px] font-bold flex items-center justify-center shrink-0">
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
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#141416] text-[#ffb3b3] uppercase border border-white/[0.04]">
                              {order.paymentMethod.includes('QR') ? 'QR Pago' : 'Efectivo'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider ${
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
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
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
                              className="w-7 h-7 rounded-full bg-[#141416] hover:bg-[#dc143c] hover:text-white inline-flex items-center justify-center transition-colors text-[#ac8888]"
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
          <div className="bg-[#1c1b1b]/80 backdrop-blur-md p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#dc143c]/15 flex items-center justify-center text-[#dc143c]">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              </div>
              <div>
                <span className="font-mono text-[11px] text-[#ac8888] uppercase tracking-wider block">
                  Despachos Express Hoy
                </span>
                <span className="font-headline text-base font-bold text-white">
                  18 Pedidos Completados
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold">
                Motorizados en Ruta: 3
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Inspector Panel - Order Detail (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-[#1c1b1b]/95 backdrop-blur-2xl p-6 rounded-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col gap-5">
            {/* Ambient Accent Glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#dc143c]/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Detail */}
            <div className="flex items-start justify-between gap-3 relative">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#ac8888] tracking-wider uppercase">
                    INSPECTOR DE ORDEN
                  </span>
                  <span className="px-1.5 py-0.2 bg-[#dc143c] text-white text-[9px] font-mono rounded uppercase font-bold">
                    LIVE
                  </span>
                </div>
                <h2 className="font-headline text-xl font-bold text-[#e5e2e1] uppercase tracking-tight mt-1">
                  DETALLE {selectedOrder.orderNumber}
                </h2>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs uppercase font-bold tracking-widest ${
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
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
                {selectedOrder.status}
              </span>
            </div>

            {/* Customer Data Bento Card */}
            <div className="bg-[#141416] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#ac8888] uppercase tracking-wider">
                  Información del Cliente
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#ac8888]">badge</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#201f1f] text-white font-headline text-sm font-bold flex items-center justify-center shrink-0 border border-white/[0.08]">
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

              <div className="pt-2 flex flex-col gap-1 text-xs bg-[#1c1b1b]/80 p-3 rounded-lg border border-white/[0.04]">
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
                    className="flex items-center gap-3 bg-[#141416] p-3 rounded-xl border border-white/[0.04]"
                  >
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-[#201f1f] shrink-0 border border-white/[0.06]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-headline text-xs font-bold text-[#e5e2e1] truncate">
                        {item.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-[11px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#201f1f] text-white font-bold border border-white/[0.06]">
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
            <div className="flex flex-col gap-2 bg-[#141416] p-4 rounded-xl border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs text-[#ac8888]">
                <span>Subtotal Productos</span>
                <span className="font-price text-xs text-white">Bs {selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#ac8888]">
                <span className="flex items-center gap-1.5">
                  <span>Envío Express Urbano</span>
                  <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-300 font-mono text-[10px] rounded uppercase font-bold">
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
                  className="w-full py-3 px-6 rounded-full bg-[#dc143c] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(220,20,60,0.35)] hover:bg-[#ff2d55] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Confirmar Pedido & Validar Pago</span>
                </button>
              )}

              {selectedOrder.status === 'Confirmado' && (
                <button
                  type="button"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'En Despacho')}
                  className="w-full py-3 px-6 rounded-full bg-blue-600 text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-blue-500 transition-all cursor-pointer"
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
                className="w-full py-2.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)]"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Contactar por WhatsApp</span>
              </a>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => updateOrderStatus(selectedOrder.id, 'Entregado')}
                  className="py-2.5 px-3 rounded-full bg-[#141416] hover:bg-[#201f1f] text-[#e5e2e1] font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
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
                  className="py-2.5 px-3 rounded-full bg-[#141416] hover:bg-[#93000a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border border-white/[0.06] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">cancel</span>
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
