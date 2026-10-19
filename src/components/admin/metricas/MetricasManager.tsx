import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface MetricPeriodData {
  timeframe: string;
  totalRevenue: number;
  totalRevenueStr: string;
  previousRevenueStr: string;
  revenueChangePercent: string;
  totalOrders: number;
  averageOrderValue: string;
  conversionRate: string;
  salesBars: { label: string; amount: number; orders: number }[];
  topProducts: {
    rank: string;
    name: string;
    sku: string;
    sold: number;
    revenue: number;
    revenueStr: string;
    sharePercent: string;
  }[];
  categoryBreakdown: { category: string; share: number; amount: string }[];
}

const emptyMetrics: Record<'7D' | '30D', MetricPeriodData> = {
  '7D': {
    timeframe: 'Últimos 7 Días',
    totalRevenue: 0,
    totalRevenueStr: 'Bs 0.00',
    previousRevenueStr: 'Bs 0.00',
    revenueChangePercent: '0%',
    totalOrders: 0,
    averageOrderValue: 'Bs 0.00',
    conversionRate: '0.0%',
    salesBars: [
      { label: 'Lun', amount: 0, orders: 0 },
      { label: 'Mar', amount: 0, orders: 0 },
      { label: 'Mié', amount: 0, orders: 0 },
      { label: 'Jue', amount: 0, orders: 0 },
      { label: 'Vie', amount: 0, orders: 0 },
      { label: 'Sáb', amount: 0, orders: 0 },
      { label: 'Dom', amount: 0, orders: 0 },
    ],
    topProducts: [],
    categoryBreakdown: [],
  },
  '30D': {
    timeframe: 'Últimos 30 Días',
    totalRevenue: 0,
    totalRevenueStr: 'Bs 0.00',
    previousRevenueStr: 'Bs 0.00',
    revenueChangePercent: '0%',
    totalOrders: 0,
    averageOrderValue: 'Bs 0.00',
    conversionRate: '0.0%',
    salesBars: [
      { label: 'Sem 1', amount: 0, orders: 0 },
      { label: 'Sem 2', amount: 0, orders: 0 },
      { label: 'Sem 3', amount: 0, orders: 0 },
      { label: 'Sem 4', amount: 0, orders: 0 },
    ],
    topProducts: [],
    categoryBreakdown: [],
  },
};

export function MetricasManager() {
  const [period, setPeriod] = useState<'7D' | '30D'>('7D');
  const [metrics, setMetrics] = useState<Record<'7D' | '30D', MetricPeriodData>>(emptyMetrics);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMetrics() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        // Consultar productos del catálogo para ranking real
        const { data: prods } = await supabase
          .from('producto')
          .select('id, nombre, precio_venta, coleccion_id')
          .eq('activo', true);

        // Consultar colecciones para desglose real
        const { data: cols } = await supabase
          .from('coleccion')
          .select('id, nombre')
          .eq('activa', true);

        // Consultar ventas
        const { data: ventas } = await supabase
          .from('venta')
          .select('*')
          .order('fecha_hora', { ascending: false });

        // Consultar pedidos entregados/confirmados
        const { data: pedidos } = await supabase
          .from('pedido')
          .select('id, total, estado, created_at, detalle_pedido(cantidad, precio_unitario, producto_id)')
          .in('estado', ['CONFIRMADO', 'ENTREGADO']);

        const catalogProducts = (prods || []).map((p: any, idx: number) => ({
          rank: `#${idx + 1}`,
          name: p.nombre,
          sku: `SKU-${p.id.slice(0, 4).toUpperCase()}`,
          sold: 0,
          revenue: 0,
          revenueStr: 'Bs 0.00',
          sharePercent: '0%',
        }));

        const categories = (cols || []).map((col: any) => ({
          category: col.nombre,
          share: 0,
          amount: 'Bs 0.00',
        }));

        // Calcular totales reales
        const totalVentas = (ventas || []).reduce((acc: number, v: any) => acc + (Number(v.total) || 0), 0);
        const totalPedidosCount = (pedidos || []).length;
        const aov = totalPedidosCount > 0 ? (totalVentas / totalPedidosCount) : 0;

        const updated: Record<'7D' | '30D', MetricPeriodData> = {
          '7D': {
            ...emptyMetrics['7D'],
            totalRevenue: totalVentas,
            totalRevenueStr: `Bs ${totalVentas.toFixed(2)}`,
            totalOrders: totalPedidosCount,
            averageOrderValue: `Bs ${aov.toFixed(2)}`,
            topProducts: catalogProducts,
            categoryBreakdown: categories,
          },
          '30D': {
            ...emptyMetrics['30D'],
            totalRevenue: totalVentas,
            totalRevenueStr: `Bs ${totalVentas.toFixed(2)}`,
            totalOrders: totalPedidosCount,
            averageOrderValue: `Bs ${aov.toFixed(2)}`,
            topProducts: catalogProducts,
            categoryBreakdown: categories,
          },
        };

        setMetrics(updated);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  const current = metrics[period];
  const maxBarValue = Math.max(1, ...current.salesBars.map((b) => b.amount));

  // Exportar a CSV
  const handleExportCSV = () => {
    const csvRows: string[] = [];

    // Metadatos
    csvRows.push(`REPORTE DE VENTAS Y RENDIMIENTO // ZAIREN LAB`);
    csvRows.push(`Periodo:,"${current.timeframe}"`);
    csvRows.push(`Fecha de emision:,"${new Date().toLocaleString()}"`);
    csvRows.push(``);

    // Resumen General
    csvRows.push(`RESUMEN GENERAL`);
    csvRows.push(`Ingresos Totales,${current.totalRevenueStr}`);
    csvRows.push(`Crecimiento,${current.revenueChangePercent}`);
    csvRows.push(`Ordenes Totales,${current.totalOrders}`);
    csvRows.push(`Ticket Promedio (AOV),${current.averageOrderValue}`);
    csvRows.push(`Tasa de Conversion,${current.conversionRate}`);
    csvRows.push(``);

    // Detalle Periodico
    csvRows.push(`DESGLOSE TEMPORAL`);
    csvRows.push(`Intervalo,Ingresos (Bs),Ordenes`);
    current.salesBars.forEach((bar) => {
      csvRows.push(`"${bar.label}",${bar.amount},${bar.orders}`);
    });
    csvRows.push(``);

    // Ranking de Productos
    csvRows.push(`PRODUCTOS MAS VENDIDOS`);
    csvRows.push(`Ranking,SKU,Nombre,Unidades Vendidas,Ingresos Generados,Participacion`);
    current.topProducts.forEach((p) => {
      csvRows.push(`"${p.rank}","${p.sku}","${p.name}",${p.sold},"${p.revenueStr}","${p.sharePercent}"`);
    });

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zairen_metricas_${period.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Exportar a PDF (Impresión del sistema)
  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header con Controles y Exportación */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] print:border-black">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#ac8888] uppercase tracking-wider">
              ANALÍTICA AVANZADA // SISTEMA DE REPORTES
            </span>
          </div>
          <h2 className="font-headline text-2xl lg:text-3xl font-bold text-white tracking-tight uppercase">
            Métricas de Rendimiento Comercial
          </h2>
        </div>

        {/* Acciones y Selectores */}
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          {/* Selector de Período 1 Semana vs 1 Mes */}
          <div className="flex items-center bg-[#141416] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setPeriod('7D')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                period === '7D'
                  ? 'bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                  : 'text-[#ac8888] hover:text-white'
              }`}
            >
              1 Semana (7D)
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30D')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                period === '30D'
                  ? 'bg-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.5)]'
                  : 'text-[#ac8888] hover:text-white'
              }`}
            >
              1 Mes (30D)
            </button>
          </div>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1c1b1b] hover:bg-[#262525] text-white border border-white/[0.1] font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:border-[#dc143c]"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400">table_view</span>
            <span>Exportar CSV</span>
          </button>

          {/* Botón Exportar PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_16px_rgba(220,20,60,0.4)]"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula de KPIs Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos Totales */}
        <div className="p-6 bg-[#141416] border border-[#201f1f] relative overflow-hidden group">
          <div className="text-xs font-mono text-[#8F8F8C] uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Ingresos Brutos</span>
            <span className="material-symbols-outlined text-[#dc143c] text-[18px]">payments</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-[#FAF9F6]">
            {current.totalRevenueStr}
          </div>
          <div className="text-xs font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
            <span>↑ {current.revenueChangePercent}</span>
            <span className="text-[#8F8F8C]">vs ciclo anterior</span>
          </div>
        </div>

        {/* KPI 2: Órdenes Totales */}
        <div className="p-6 bg-[#141416] border border-[#201f1f] relative overflow-hidden group">
          <div className="text-xs font-mono text-[#8F8F8C] uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Pedidos Confirmados</span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">shopping_bag</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-[#FAF9F6]">
            {current.totalOrders} órdenes
          </div>
          <div className="text-xs font-mono text-[#8F8F8C] mt-2">
            <span>En periodo seleccionado</span>
          </div>
        </div>

        {/* KPI 3: Ticket Promedio */}
        <div className="p-6 bg-[#141416] border border-[#201f1f] relative overflow-hidden group">
          <div className="text-xs font-mono text-[#8F8F8C] uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Ticket Promedio (AOV)</span>
            <span className="material-symbols-outlined text-amber-400 text-[18px]">query_stats</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-[#FAF9F6]">
            {current.averageOrderValue}
          </div>
          <div className="text-xs font-mono text-[#8F8F8C] mt-2">
            <span>Gasto medio por cliente</span>
          </div>
        </div>

        {/* KPI 4: Tasa de Conversión */}
        <div className="p-6 bg-[#141416] border border-[#201f1f] relative overflow-hidden group">
          <div className="text-xs font-mono text-[#8F8F8C] uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Conversión del Catálogo</span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">
            {current.conversionRate}
          </div>
          <div className="text-xs font-mono text-[#8F8F8C] mt-2">
            <span>Visitas convertidas a WhatsApp</span>
          </div>
        </div>
      </div>

      {/* 3. Gráfica Interactiva de Ventas */}
      <div className="p-6 bg-[#141416] border border-[#201f1f] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider block">
              COMPORTAMIENTO TEMPORAL
            </span>
            <h3 className="font-headline text-lg font-bold text-white uppercase tracking-wider">
              Flujo de Ventas ({current.timeframe})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#ac8888]">
            Total acumulado: <strong className="text-white">{current.totalRevenueStr}</strong>
          </span>
        </div>

        {/* Barras SVG Dinámicas */}
        <div className="h-56 w-full flex items-end gap-3 pt-6 pb-2 border-b border-white/[0.06]">
          {current.salesBars.map((bar, idx) => {
            const heightPercent = bar.amount > 0 ? Math.max(12, Math.round((bar.amount / maxBarValue) * 100)) : 4;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                {/* Tooltip Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-[10px] font-mono text-white bg-[#0e0e0e] px-2 py-1 border border-white/[0.1] shadow-lg whitespace-nowrap mb-1">
                  <div>Bs {bar.amount}</div>
                  <div className="text-[#ac8888]">{bar.orders} pedidos</div>
                </div>

                {/* Barra */}
                <div className="w-full bg-[#1c1b1b] overflow-hidden h-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-[#dc143c] to-[#ff2d55] transition-all duration-500 group-hover:brightness-125 shadow-[0_0_8px_rgba(220,20,60,0.3)]"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Etiqueta */}
                <span className="text-[11px] font-mono text-[#ac8888] group-hover:text-white transition-colors">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tablas Detalladas: Top Prendas & Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Prendas (2 columnas) */}
        <div className="lg:col-span-2 p-6 bg-[#141416] border border-[#201f1f] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono text-[#dc143c] uppercase tracking-widest font-bold block">
                RANKING COMERCIAL
              </span>
              <h3 className="text-base font-bold font-headline uppercase text-white">
                Prendas Más Vendidas ({current.timeframe})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#ac8888]">Por volumen facturado</span>
          </div>

          <div className="space-y-3">
            {current.topProducts.length > 0 ? (
              current.topProducts.map((p) => (
                <div
                  key={p.sku}
                  className="flex items-center justify-between gap-3 p-3.5 bg-[#1c1b1b] hover:bg-[#242323] transition-all border border-white/[0.04]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#dc143c] w-6 shrink-0">
                      {p.rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-headline text-xs font-bold uppercase text-white truncate">
                        {p.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[#ac8888]">{p.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <span className="font-mono text-xs font-bold text-white block">
                        {p.sold} uds
                      </span>
                      <span className="text-[10px] font-mono text-[#ac8888]">
                        {p.sharePercent}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 block">
                        {p.revenueStr}
                      </span>
                      <span className="text-[10px] font-mono text-[#ac8888]">Subtotal</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-[#ac8888]">
                No hay ventas de prendas registradas en este período.
              </div>
            )}
          </div>
        </div>

        {/* Distribución por Categorías (1 columna) */}
        <div className="p-6 bg-[#141416] border border-[#201f1f] space-y-4">
          <div className="pb-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider block">
              SEGMENTACIÓN
            </span>
            <h3 className="text-base font-bold font-headline uppercase text-white">
              Ventas por Categoría
            </h3>
          </div>

          <div className="space-y-4">
            {current.categoryBreakdown.length > 0 ? (
              current.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-white font-medium">{cat.category}</span>
                    <span className="text-[#ac8888]">{cat.share}%</span>
                  </div>
                  <div className="w-full bg-[#1c1b1b] h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#dc143c]"
                      style={{ width: `${Math.max(cat.share, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#ac8888] block text-right">
                    {cat.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs font-mono text-[#ac8888]">
                Sin datos de categorías registradas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
