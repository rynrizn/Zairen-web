import React, { useState } from 'react';
import { toast } from 'sonner';

export interface PendingOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  timeAgo: string;
  paymentMethod: string;
  itemsSummary: string;
  total: number;
}

const initialOrders: PendingOrder[] = [
  {
    id: 'ord-128',
    orderNumber: '#128',
    clientName: 'Mateo Rojas',
    timeAgo: 'Hace 12 min',
    paymentMethod: 'Efectivo contra entrega',
    itemsSummary: '2 items: Samurai Mecha Kanji XL, Cyber Geisha M',
    total: 280.0,
  },
  {
    id: 'ord-127',
    orderNumber: '#127',
    clientName: 'Lucía Fernández',
    timeAgo: 'Hace 34 min',
    paymentMethod: 'QR Simple / Transferencia',
    itemsSummary: '1 item: Tokyo Vanguard S',
    total: 130.0,
  },
  {
    id: 'ord-126',
    orderNumber: '#126',
    clientName: 'Carlos Mamani',
    timeAgo: 'Hace 1 hora',
    paymentMethod: 'Efectivo contra entrega',
    itemsSummary: '1 item: Zen Kanji Shadow L',
    total: 125.0,
  },
];

export function PedidosPendientes() {
  const [orders, setOrders] = useState<PendingOrder[]>(initialOrders);

  const handleConfirm = (order: PendingOrder) => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    toast.success(`Pedido ${order.orderNumber} confirmado`, {
      description: `Cliente: ${order.clientName} • Total: Bs ${order.total.toFixed(2)}`,
    });
  };

  const handleReject = (order: PendingOrder) => {
    if (confirm(`¿Rechazar y liberar stock para el pedido ${order.orderNumber}?`)) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      toast.info(`Pedido ${order.orderNumber} cancelado`);
    }
  };

  return (
    <section className="relative w-full rounded-none bg-[#1c1b1b]/90 backdrop-blur-xl p-6 border border-white/[0.08] shadow-xl overflow-hidden">
      {/* Indicador sutil carmesí superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc143c] via-[#de0541] to-transparent"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#dc143c]/15 text-[#dc143c] flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base font-bold text-[#e5e2e1] uppercase tracking-tight">
                Pedidos Pendientes por Revisar
              </h2>
              <span className="px-2.5 py-0.5 rounded-none bg-[#dc143c] text-white font-mono text-[10px] tracking-wider font-bold shadow-[0_0_12px_rgba(220,20,60,0.5)]">
                {orders.length} PENDIENTES
              </span>
            </div>
            <p className="text-xs font-mono text-[#ac8888]">
              Confirmar antes de las 18:00 para despacho express local en La Paz, Cochabamba y Santa Cruz.
            </p>
          </div>
        </div>

        <a
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#dc143c] hover:text-[#ffb3b3] transition-colors"
        >
          <span>Ver todos los pedidos</span>
          <span>→</span>
        </a>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid grid-cols-1 gap-3">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-none bg-[#201f1f] hover:bg-[#2a2a2a] transition-all border border-white/[0.04]"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-none bg-[#141416] shrink-0 flex items-center justify-center font-mono font-bold text-[#dc143c] text-sm border border-white/[0.06]">
                  {order.orderNumber}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-bold text-white">
                      {order.clientName}
                    </span>
                    <span className="text-[#ac8888] text-xs font-mono">•</span>
                    <span className="text-xs font-mono text-[#dc143c]">{order.timeAgo}</span>
                    <span className="px-2 py-0.5 rounded-none bg-[#141416] text-[10px] font-mono text-[#e6bdbc] uppercase border border-white/[0.04]">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#ac8888] truncate mt-0.5">
                    {order.itemsSummary}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/[0.04]">
                <div className="flex flex-col text-left lg:text-right">
                  <span className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider">
                    Total Orden
                  </span>
                  <span className="font-mono text-base font-bold text-white tracking-tight">
                    Bs {order.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirm(order)}
                    className="px-4 py-1.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_2px_12px_rgba(220,20,60,0.35)] transition-all cursor-pointer"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(order)}
                    title="Rechazar pedido"
                    className="w-8 h-8 rounded-none bg-[#141416] hover:bg-[#93000a] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.06]"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-xs font-mono text-[#ac8888]">
            ✓ Todos los pedidos han sido revisados y procesados.
          </div>
        )}
      </div>
    </section>
  );
}
