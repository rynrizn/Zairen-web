import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface ColeccionItem {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  totalProductos: number;
  productosConStock: number;
  stockTotal: number;
  productosDisponiblesDetalle: Array<{ id: string; nombre: string; stock: number }>;
}

interface GestionColeccionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function GestionColeccionesModal({
  isOpen,
  onClose,
  onChanged,
}: GestionColeccionesModalProps) {
  const [colecciones, setColecciones] = useState<ColeccionItem[]>([]);
  const [sinColeccionCount, setSinColeccionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Estado para modal de bloqueo o advertencia detallada
  const [bloqueoData, setBloqueoData] = useState<{
    nombre: string;
    detalles: Array<{ id: string; nombre: string; stock: number }>;
  } | null>(null);

  const fetchColecciones = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/colecciones');
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.colecciones)) {
        setColecciones(data.colecciones);
        setSinColeccionCount(data.sinColeccionCount || 0);
      }
    } catch (e) {
      toast.error('Error al cargar colecciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchColecciones();
      setBloqueoData(null);
    }
  }, [isOpen]);

  const handleDelete = async (col: ColeccionItem) => {
    // 1. Si tiene productos con stock disponible > 0 -> Bloqueo con explicación clara
    if (col.productosConStock > 0) {
      setBloqueoData({
        nombre: col.nombre,
        detalles: col.productosDisponiblesDetalle,
      });
      return;
    }

    // 2. Si tiene productos pero todos están agotados (stock = 0)
    if (col.totalProductos > 0 && col.productosConStock === 0) {
      const confirmaAgotados = confirm(
        `AVISO DE ELIMINACIÓN:\n\nLa colección "${col.nombre}" contiene ${col.totalProductos} producto(s) sin unidades (agotados).\n\nAl eliminar la colección, estos productos pasarán al estado "Sin colección": serán visibles ÚNICAMENTE en el panel admin con su respectiva insignia y NO aparecerán en el catálogo público hasta que les asignes una nueva colección.\n\n¿Deseas continuar con la eliminación?`
      );
      if (!confirmaAgotados) return;
    } else {
      // 3. Colección vacía
      const confirmaVacia = confirm(
        `¿Confirmas la eliminación de la colección vacía "${col.nombre}"?`
      );
      if (!confirmaVacia) return;
    }

    setIsDeletingId(col.id);
    const toastLoading = toast.loading(`Eliminando colección "${col.nombre}"...`);

    try {
      const res = await fetch('/api/admin/colecciones', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: col.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.dismiss(toastLoading);
        if (data.error === 'TIENE_PRODUCTOS_DISPONIBLES') {
          setBloqueoData({
            nombre: col.nombre,
            detalles: data.detalles || [],
          });
        } else {
          toast.error(data.error || 'No se pudo eliminar la colección.');
        }
        return;
      }

      toast.dismiss(toastLoading);
      toast.success(data.message || 'Colección eliminada con éxito.');
      fetch('/api/admin/revalidar-catalogo', { method: 'POST' })
        .then(() => toast.info('Catálogo actualizado'))
        .catch(() => {});
      await fetchColecciones();
      onChanged();
      window.dispatchEvent(new CustomEvent('inventory-changed'));
    } catch (e: any) {
      toast.dismiss(toastLoading);
      toast.error('Error de conexión: ' + (e?.message || 'desconocido'));
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl bg-[#0e0e10] border border-[#201f1f] shadow-2xl p-6 text-white max-h-[90vh] flex flex-col">
        {/* Acento superior carmesí */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#dc143c] via-[#ff2d55] to-[#dc143c]"></div>

        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-[#201f1f]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#dc143c] inline-block"></span>
            <h2 className="font-display text-base font-bold uppercase tracking-tight">
              Gestión y Eliminación Segura de Colecciones
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-[#1c1b1b] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Resumen de estado de prendas huérfanas */}
        <div className="py-3 px-4 my-4 bg-[#141416] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-[#ac8888]">Prendas en estado "Sin colección":</span>
          <span className="px-2 py-0.5 font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40">
            {sinColeccionCount} prendas (Ocultas del catálogo público)
          </span>
        </div>

        {/* Lista de colecciones con scroll */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-[#ac8888] animate-pulse">
              Cargando colecciones y existencias...
            </div>
          ) : colecciones.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#ac8888]">
              No existen colecciones registradas.
            </div>
          ) : (
            colecciones.map((col) => {
              const tieneDisponibles = col.productosConStock > 0;
              const tieneAgotados = col.totalProductos > 0 && col.productosConStock === 0;
              const estaVacia = col.totalProductos === 0;

              return (
                <div
                  key={col.id}
                  className="p-3.5 bg-[#141416] border border-[#201f1f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/10 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-sm font-bold uppercase tracking-tight text-[#FAF9F6]">
                        {col.nombre}
                      </h3>
                      {tieneDisponibles && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
                          {col.productosConStock} con stock ({col.stockTotal} uds)
                        </span>
                      )}
                      {tieneAgotados && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40">
                          {col.totalProductos} agotadas (0 stock)
                        </span>
                      )}
                      {estaVacia && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#1f1f23] text-[#8F8F8C] border border-white/[0.08]">
                          Vacía
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-[#ac8888]">
                      Slug: <span className="text-white/60">{col.slug}</span> • Total prendas: {col.totalProductos}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isDeletingId === col.id}
                      onClick={() => handleDelete(col)}
                      className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                        tieneDisponibles
                          ? 'bg-[#1c1b1b] hover:bg-[#7f1d1d] text-[#f87171] border-[#7f1d1d]/60'
                          : 'bg-[#7f1d1d] hover:bg-[#b91c1c] text-white border-[#ef4444]'
                      }`}
                      title={
                        tieneDisponibles
                          ? 'Bloqueada por stock disponible (clic para ver prendas)'
                          : 'Eliminar colección de forma segura'
                      }
                    >
                      <span>{tieneDisponibles ? 'Bloqueada' : 'Eliminar'}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {tieneDisponibles ? 'lock' : 'delete'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Advertencia / Bloqueo Detallado */}
        {bloqueoData && (
          <div className="mt-4 p-4 bg-[#1f1212] border border-[#dc143c]/60 space-y-3">
            <div className="flex items-center gap-2 text-[#f87171]">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <h4 className="font-display text-xs font-bold uppercase tracking-tight">
                Eliminación Bloqueada: Colección "{bloqueoData.nombre}"
              </h4>
            </div>
            <p className="text-xs font-body text-[#e5e2e1] leading-relaxed">
              Esta colección no se puede eliminar porque contiene prendas con stock disponible para la venta. Para mantener la integridad del catálogo, mueve las siguientes prendas a otra colección antes de intentar eliminarla:
            </p>
            <div className="max-h-28 overflow-y-auto bg-black/40 p-2 border border-white/[0.04] space-y-1">
              {bloqueoData.detalles.map((p) => (
                <div key={p.id} className="flex justify-between text-xs font-mono text-[#ac8888]">
                  <span className="truncate pr-2">• {p.nombre}</span>
                  <span className="text-emerald-400 font-bold shrink-0">{p.stock} uds disponibles</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBloqueoData(null)}
                className="px-3 py-1 bg-[#2a2a2a] hover:bg-white text-white hover:text-black font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Pie */}
        <div className="pt-4 border-t border-[#201f1f] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF9F6] hover:bg-[#dc143c] text-black hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
