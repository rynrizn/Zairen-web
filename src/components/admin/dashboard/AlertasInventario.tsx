import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

interface AlertItem {
  id: string;
  name: string;
  sku: string;
  size: string;
  currentStock: number;
  minThreshold: number;
}

export function AlertasInventario() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAlerts() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('inventario')
          .select(`
            id,
            cantidad,
            producto:producto_id (
              id,
              nombre,
              stock_minimo
            )
          `);

        if (error) {
          console.error('Error loading inventory alerts:', error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const critical = data
            .filter((item: any) => {
              const min = item.producto?.stock_minimo ?? 3;
              return (Number(item.cantidad) || 0) <= min;
            })
            .map((item: any) => ({
              id: item.id,
              name: item.producto?.nombre || 'Producto',
              sku: `SKU-${item.id.slice(0, 6).toUpperCase()}`,
              size: 'Estándar',
              currentStock: Number(item.cantidad) || 0,
              minThreshold: item.producto?.stock_minimo ?? 3,
            }));
          setAlerts(critical);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        console.error('Failed to load inventory alerts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  const handleRestock = async (item: AlertItem) => {
    const qty = prompt(`Ingresar unidades a reponer para ${item.name} (${item.size}):`, '10');
    const num = Number(qty);
    if (qty && !isNaN(num) && num > 0) {
      try {
        if (isSupabaseConfigured) {
          await supabase
            .from('inventario')
            .update({ cantidad: item.currentStock + num })
            .eq('id', item.id);
        }
        setAlerts((prev) => prev.filter((a) => a.id !== item.id));
        toast.success(`Se ingresaron +${num} unidades de ${item.name}`, {
          description: 'Inventario actualizado correctamente',
        });
      } catch (err) {
        toast.error('Error al actualizar inventario');
      }
    }
  };

  return (
    <div className="p-6 rounded-none bg-[#1c1b1b]/90 backdrop-blur-md border border-white/[0.08] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-none bg-[#f87171] animate-ping"></span>
          <h3 className="text-sm font-bold font-headline uppercase text-[#e5e2e1]">
            Alertas de Stock Crítico
          </h3>
        </div>
        <a
          href="/admin/inventario"
          className="text-xs font-mono text-[#dc143c] hover:underline"
        >
          Gestionar Matriz →
        </a>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {loading ? (
          <div className="text-center py-6 text-xs font-mono text-[#ac8888] animate-pulse">
            Verificando niveles de inventario...
          </div>
        ) : alerts.length > 0 ? (
          alerts.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-xs font-bold uppercase text-[#e5e2e1]">
                  {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                  <span className="text-[#ac8888]">{item.sku}</span>
                  <span className="text-[#ffb3b3]">TALLA: {item.size}</span>
                  <span className={item.currentStock === 0 ? 'text-[#f87171] font-bold' : 'text-[#fbbf24]'}>
                    {item.currentStock === 0 ? 'AGOTADO (0 uds)' : `${item.currentStock} uds restantes`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRestock(item)}
                className="px-3 py-1.5 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-[#e5e2e1] hover:text-white border border-white/[0.06] text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                + Reponer
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-xs font-mono text-emerald-400">
            ✓ Todos los SKUs tienen stock por encima del umbral mínimo.
          </div>
        )}
      </div>
    </div>
  );
}
