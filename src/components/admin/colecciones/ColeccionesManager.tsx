import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { ModalPortal } from '../../ui/ModalPortal';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';

export interface ColeccionItem {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  orden: number;
  descripcion?: string | null;
  totalProductos: number;
  productosConStock: number;
  stockTotal: number;
  productosDisponiblesDetalle?: Array<{ id: string; nombre: string; stock: number }>;
}

export function ColeccionesManager() {
  const [colecciones, setColecciones] = useState<ColeccionItem[]>([]);
  const [sinColeccionCount, setSinColeccionCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCol, setEditingCol] = useState<ColeccionItem | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    orden: 0,
    activa: true,
  });
  const [saving, setSaving] = useState<boolean>(false);

  // Modal Eliminación Segura
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    col: ColeccionItem | null;
    loading: boolean;
    errorDetails: {
      message: string;
      productosConStock: number;
      detalles: Array<{ id: string; nombre: string; stock: number }>;
    } | null;
  }>({
    isOpen: false,
    col: null,
    loading: false,
    errorDetails: null,
  });

  const getAuthToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || '';
  };

  const loadColecciones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/colecciones');
      const data = await res.json();
      if (data.success && Array.isArray(data.colecciones)) {
        setColecciones(data.colecciones);
        setSinColeccionCount(data.sinColeccionCount || 0);
      } else {
        toast.error(data.error || 'Error al cargar las colecciones');
      }
    } catch (err: any) {
      toast.error('Error de red al consultar colecciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColecciones();
  }, []);

  const openCreateModal = () => {
    setEditingCol(null);
    setFormData({
      nombre: '',
      slug: '',
      descripcion: '',
      orden: colecciones.length,
      activa: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (col: ColeccionItem) => {
    setEditingCol(col);
    setFormData({
      nombre: col.nombre,
      slug: col.slug,
      descripcion: col.descripcion || '',
      orden: col.orden || 0,
      activa: col.activa,
    });
    setIsModalOpen(true);
  };

  const handleNombreChange = (val: string) => {
    // Si estamos creando o el slug coincide con la versión anterior de nombre, autogenerar
    const prevAutoSlug = formData.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newAutoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!editingCol || formData.slug === prevAutoSlug || !formData.slug) {
      setFormData({ ...formData, nombre: val, slug: newAutoSlug });
    } else {
      setFormData({ ...formData, nombre: val });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la colección es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const token = await getAuthToken();
      const isEdit = Boolean(editingCol);
      const url = '/api/admin/colecciones';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = isEdit
        ? { id: editingCol!.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Error al guardar la colección');
        return;
      }

      toast.success(isEdit ? 'Colección actualizada' : 'Colección creada con éxito');
      setIsModalOpen(false);
      loadColecciones();
    } catch (err: any) {
      toast.error(err?.message || 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActiva = async (col: ColeccionItem) => {
    const nextActiva = !col.activa;
    // Actualización optimista
    setColecciones((prev) =>
      prev.map((c) => (c.id === col.id ? { ...c, activa: nextActiva } : c))
    );

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/colecciones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: col.id, activa: nextActiva }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revertir
        setColecciones((prev) =>
          prev.map((c) => (c.id === col.id ? { ...c, activa: !nextActiva } : c))
        );
        toast.error(data.error || 'Error al cambiar estado de la colección');
        return;
      }

      toast.success(
        nextActiva
          ? `Colección "${col.nombre}" activada`
          : `Colección "${col.nombre}" pausada`
      );
    } catch (err: any) {
      setColecciones((prev) =>
        prev.map((c) => (c.id === col.id ? { ...c, activa: !nextActiva } : c))
      );
      toast.error('Error de red al actualizar estado');
    }
  };

  const openDeleteModal = (col: ColeccionItem) => {
    setDeleteModal({
      isOpen: true,
      col,
      loading: false,
      errorDetails: null,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.col) return;
    setDeleteModal((prev) => ({ ...prev, loading: true, errorDetails: null }));

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/admin/colecciones', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id: deleteModal.col.id }),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Bloqueo de seguridad: tiene prendas con existencias
        setDeleteModal((prev) => ({
          ...prev,
          loading: false,
          errorDetails: {
            message: data.message || 'La colección tiene prendas con stock disponible.',
            productosConStock: data.productosConStock || 0,
            detalles: data.detalles || [],
          },
        }));
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.error || 'No se pudo eliminar la colección');
        setDeleteModal((prev) => ({ ...prev, loading: false }));
        return;
      }

      toast.success(data.message || 'Colección eliminada con éxito');
      setDeleteModal({ isOpen: false, col: null, loading: false, errorDetails: null });
      loadColecciones();
    } catch (err: any) {
      toast.error(err?.message || 'Error de red al eliminar colección');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141416] p-4 sm:p-6 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#dc143c]"></span>
            <h1 className="font-headline text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
              Gestión de Colecciones // Drops
            </h1>
          </div>
          <p className="font-mono text-xs text-[#ac8888]">
            Administra las categorías y lanzamientos oficiales de prendas en la tienda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-[#dc143c]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nueva Colección
          </button>
        </div>
      </div>

      {/* Tarjeta Informativa de Prendas sin Colección */}
      {sinColeccionCount > 0 && (
        <div className="bg-[#1c1b1b] border border-amber-600/30 p-3 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[20px]">
              folder_off
            </span>
            <div>
              <p className="font-mono text-xs text-amber-200 font-bold">
                {sinColeccionCount} {sinColeccionCount === 1 ? 'prenda huérfana' : 'prendas huérfanas'} sin colección asignada
              </p>
              <p className="font-mono text-[11px] text-[#ac8888]">
                Estas prendas aparecen en el catálogo general pero no tienen un drop específico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grilla / Tabla de Colecciones */}
      <div className="bg-[#141416] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#dc143c] border-t-transparent animate-spin mb-2"></div>
            <p className="font-mono text-xs text-[#ac8888]">Cargando colecciones...</p>
          </div>
        ) : colecciones.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
            <span className="material-symbols-outlined text-[36px] text-[#ac8888]">
              category
            </span>
            <p className="font-mono text-sm text-white font-bold">No hay colecciones registradas</p>
            <p className="font-mono text-xs text-[#ac8888] max-w-sm">
              Crea tu primera colección para clasificar tus prendas en el catálogo.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              + Crear Primera Colección
            </button>
          </div>
        ) : (
          <div>
            {/* Vista Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#1c1b1b] text-[#ac8888] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Nombre // Slug</th>
                    <th className="py-3 px-4 text-center">Prendas</th>
                    <th className="py-3 px-4 text-center">Con Stock</th>
                    <th className="py-3 px-4 text-center">Unidades</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {colecciones.map((col) => (
                    <tr key={col.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 text-[#ac8888] font-bold">
                        #{col.orden}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white uppercase tracking-wider">
                          {col.nombre}
                        </div>
                        <div className="text-[10px] text-[#ac8888]">
                          /{col.slug}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-white">
                        {col.totalProductos}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${
                          col.productosConStock > 0
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                            : 'bg-[#201f1f] text-[#ac8888]'
                        }`}>
                          {col.productosConStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {col.stockTotal}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActiva(col)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer border ${
                            col.activa
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/80'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                          }`}
                          title={col.activa ? 'Click para pausar' : 'Click para activar'}
                        >
                          {col.activa ? '● Activa' : '○ En Pausa'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(col)}
                            className="p-1.5 bg-[#201f1f] hover:bg-white hover:text-black text-[#ac8888] transition-colors cursor-pointer"
                            title="Editar colección"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteModal(col)}
                            className="p-1.5 bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white transition-colors cursor-pointer"
                            title="Eliminar colección"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Tarjetas Mobile (< 768px) */}
            <div className="block md:hidden divide-y divide-white/[0.06]">
              {colecciones.map((col) => (
                <div key={col.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#ac8888]">#{col.orden}</span>
                        <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">
                          {col.nombre}
                        </h3>
                      </div>
                      <p className="font-mono text-[10px] text-[#ac8888] mt-0.5">
                        /{col.slug}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleActiva(col)}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                        col.activa
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {col.activa ? 'Activa' : 'Pausa'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-[#1c1b1b] p-2 font-mono text-[11px] text-center border border-white/[0.04]">
                    <div>
                      <div className="text-[9px] text-[#ac8888] uppercase">Prendas</div>
                      <div className="font-bold text-white">{col.totalProductos}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#ac8888] uppercase">Con Stock</div>
                      <div className="font-bold text-emerald-400">{col.productosConStock}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#ac8888] uppercase">Unidades</div>
                      <div className="font-bold text-white">{col.stockTotal}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(col)}
                      className="flex-1 py-1.5 bg-[#201f1f] hover:bg-white hover:text-black text-[#ac8888] font-mono text-xs uppercase font-bold text-center border border-white/[0.08]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(col)}
                      className="px-3 py-1.5 bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white font-mono text-xs uppercase font-bold border border-white/[0.08]"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <ModalPortal>
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden overscroll-contain"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#141416] border border-white/[0.12] w-full max-w-lg p-5 sm:p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#dc143c]"></span>
                <h3 className="font-headline text-base font-bold uppercase text-white tracking-wider">
                  {editingCol ? 'Editar Colección' : 'Nueva Colección // Drop'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-[#ac8888] mb-1">
                  Nombre de la Colección <span className="text-[#dc143c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  placeholder="Ej: Drop Cyber Zero"
                  className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3 py-2 border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ac8888] mb-1">
                  Slug URL <span className="text-[#ac8888]/60">(Identificador en enlaces)</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="ej: drop-cyber-zero"
                  className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3 py-2 border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#ac8888] mb-1">
                  Descripción Corta <span className="text-[#ac8888]/60">(Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve detalle conceptual del drop..."
                  className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3 py-2 border border-white/[0.08] focus:border-[#dc143c] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase text-[#ac8888] mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3 py-2 border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.activa}
                      onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                      className="accent-[#dc143c] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-white uppercase select-none">
                      Colección Activa
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#201f1f] text-[#ac8888] hover:text-white font-mono text-xs uppercase border border-white/[0.08] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold border border-[#dc143c] cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editingCol ? 'Actualizar Colección' : 'Crear Colección'}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Modal Confirmación de Eliminación Segura */}
      {deleteModal.isOpen && deleteModal.col && (
        <ModalPortal>
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => !deleteModal.loading && setDeleteModal({ isOpen: false, col: null, loading: false, errorDetails: null })}
        >
          <div
            className="bg-[#141416] border border-white/[0.12] w-full max-w-md p-5 sm:p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-[#dc143c] mb-3">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-headline text-base font-bold uppercase text-white tracking-wider">
                Eliminar Colección
              </h3>
            </div>

            {deleteModal.errorDetails ? (
              /* Caso de Bloqueo: Existen Prendas con Stock */
              <div className="space-y-4">
                <div className="bg-red-950/40 border border-red-600/40 p-3 text-red-200 font-mono text-xs">
                  <p className="font-bold mb-1">Acción no permitida por seguridad comercial:</p>
                  <p>{deleteModal.errorDetails.message}</p>
                </div>

                {deleteModal.errorDetails.detalles.length > 0 && (
                  <div>
                    <p className="font-mono text-[11px] uppercase text-[#ac8888] mb-1.5 font-bold">
                      Prendas con stock en esta colección ({deleteModal.errorDetails.detalles.length}):
                    </p>
                    <ul className="max-h-36 overflow-y-auto divide-y divide-white/[0.06] bg-[#1c1b1b] border border-white/[0.06] p-2">
                      {deleteModal.errorDetails.detalles.map((p) => (
                        <li key={p.id} className="py-1 font-mono text-[11px] flex items-center justify-between">
                          <span className="text-white truncate pr-2">{p.nombre}</span>
                          <span className="text-emerald-400 font-bold shrink-0">{p.stock} un.</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="font-mono text-[10px] text-[#ac8888]">
                  Para eliminar esta colección, edita cada una de estas prendas y asígnalas a otra colección primero.
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: false, col: null, loading: false, errorDetails: null })}
                    className="px-4 py-2 bg-[#201f1f] hover:bg-white hover:text-black text-white font-mono text-xs uppercase font-bold border border-white/[0.08] cursor-pointer"
                  >
                    Entendido, regresar
                  </button>
                </div>
              </div>
            ) : (
              /* Caso de Confirmación Estándar */
              <div className="space-y-4">
                <p className="font-mono text-xs text-[#ac8888] leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la colección{' '}
                  <strong className="text-white">"{deleteModal.col.nombre}"</strong>?
                </p>

                {deleteModal.col.totalProductos > 0 && (
                  <div className="bg-amber-950/30 border border-amber-600/30 p-2.5 font-mono text-[11px] text-amber-200">
                    Esta colección contiene {deleteModal.col.totalProductos} prenda(s) sin unidades disponibles. Al eliminarla, pasarán automáticamente al estado <strong>"Sin colección"</strong>.
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={() => setDeleteModal({ isOpen: false, col: null, loading: false, errorDetails: null })}
                    className="px-4 py-2 bg-[#201f1f] text-[#ac8888] hover:text-white font-mono text-xs uppercase border border-white/[0.08] cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold border border-[#dc143c] cursor-pointer disabled:opacity-50"
                  >
                    {deleteModal.loading ? 'Eliminando...' : 'Sí, Eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
