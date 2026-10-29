import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { ModalPortal } from '../../ui/ModalPortal';
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock';
import { getOptimizedImageUrl } from '../../../lib/cloudinary';
import { Folder, Globe, X } from 'lucide-react';

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  used_count: number;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  alreadySelectedUrls: string[];
  onSelectImages: (urls: string[]) => void;
  maxSelection?: number;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  alreadySelectedUrls,
  onSelectImages,
  maxSelection = 5,
}: MediaLibraryModalProps) {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all');
  const [folderScope, setFolderScope] = useState<'zairen/' | ''>('zairen/');
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const fetchMedia = async (
    cursor?: string,
    append: boolean = false,
    targetScope: 'zairen/' | '' = folderScope
  ) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setErrorMsg(null);
    }

    try {
      // 1. Obtener JWT de Supabase para autorización del servidor
      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData?.session?.access_token;
      if (!accessToken && typeof document !== 'undefined') {
        const match = document.cookie.match(/sb-access-token=([^;]+)/);
        if (match) accessToken = decodeURIComponent(match[1].trim());
      }

      const params = new URLSearchParams({ limit: '30' });
      if (cursor) {
        params.set('next_cursor', cursor);
      }
      if (targetScope) {
        params.set('prefix', targetScope);
      } else {
        params.set('prefix', 'all');
      }

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const res = await fetch(`/api/media?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson?.error || `Error ${res.status} al consultar mediateca`);
      }

      const data = await res.json();
      if (data.warning) {
        setWarningMsg(data.warning);
      } else {
        setWarningMsg(null);
      }

      if (data.success && Array.isArray(data.resources)) {
        if (append) {
          setResources((prev) => [...prev, ...data.resources]);
        } else {
          setResources(data.resources);
        }
        setNextCursor(data.next_cursor || null);
      } else {
        throw new Error(data.error || 'Respuesta inválida del servidor');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo cargar la mediateca');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleScopeChange = (newScope: 'zairen/' | '') => {
    setFolderScope(newScope);
    fetchMedia(undefined, false, newScope);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrls([]);
      setSearchQuery('');
      setWarningMsg(null);
      fetchMedia(undefined, false, folderScope);
    }
  }, [isOpen]);

  // Filtrado reactivo en cliente por búsqueda y estado de uso
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.public_id.toLowerCase().includes(query) ||
        item.secure_url.toLowerCase().includes(query);

      let matchesFilter = true;
      if (filterUsed === 'used') matchesFilter = item.used_count > 0;
      if (filterUsed === 'unused') matchesFilter = item.used_count === 0;

      return matchesSearch && matchesFilter;
    });
  }, [resources, searchQuery, filterUsed]);

  const toggleSelect = (url: string) => {
    const isAlreadyInProduct = alreadySelectedUrls.includes(url);
    if (isAlreadyInProduct) {
      toast.info('Esta imagen ya forma parte de la galería de la prenda actual');
      return;
    }

    if (selectedUrls.includes(url)) {
      setSelectedUrls((prev) => prev.filter((u) => u !== url));
    } else {
      const totalAllowed = maxSelection - alreadySelectedUrls.length;
      if (selectedUrls.length >= totalAllowed) {
        toast.warning(`Límite de ${maxSelection} imágenes alcanzado`);
        return;
      }
      setSelectedUrls((prev) => [...prev, url]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedUrls.length === 0) {
      onClose();
      return;
    }
    onSelectImages(selectedUrls);
    toast.success(
      selectedUrls.length === 1
        ? 'Foto agregada a la prenda'
        : `${selectedUrls.length} fotos agregadas a la prenda`
    );
    setSelectedUrls([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden overscroll-contain"
        onClick={onClose}
      >
        <div
          className="bg-[#141416] sm:border border-white/[0.12] w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col p-4 sm:p-6 rounded-none shadow-2xl overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Cabecera Ortogonal */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#dc143c]"></span>
            <div>
              <h3 className="font-headline text-sm sm:text-base font-bold uppercase text-white tracking-wider leading-none">
                Mediateca Cloudinary // Reutilizar Fotos
              </h3>
              <p className="font-mono text-[10px] text-[#ac8888] mt-1">
                Catálogo global de fotos sin volver a subirlas ni duplicar almacenamiento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-[#201f1f] hover:bg-[#dc143c] text-[#ac8888] hover:text-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
            title="Cerrar mediateca"
            aria-label="Cerrar mediateca"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner de Advertencia de Diagnóstico */}
        {warningMsg && (
          <div className="bg-amber-950/40 border border-amber-600/40 px-3 py-2.5 my-2 font-mono text-[11px] text-amber-200 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex-1 leading-relaxed">
              <span className="font-bold text-amber-300">Aviso del servidor: </span>
              {warningMsg}
            </div>
          </div>
        )}

        {/* Barra de Filtros, Búsqueda y Estadísticas Rápidas */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 py-3 border-b border-white/[0.06]">
          {/* Input Buscador */}
          <div className="relative flex-1 min-w-0">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#ac8888] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por public_id o archivo..."
              className="w-full bg-[#1c1b1b] text-white font-mono text-xs pl-8 pr-8 py-2 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#ac8888] hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Selector de Carpeta */}
            <div className="flex items-center gap-1 font-mono text-[11px] shrink-0 bg-[#1c1b1b] p-1 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => handleScopeChange('zairen/')}
                className={`px-2 py-1 rounded-none uppercase transition-colors cursor-pointer ${
                  folderScope === 'zairen/'
                    ? 'bg-white text-black font-bold'
                    : 'text-[#ac8888] hover:text-white'
                }`}
                title="Fotos de la marca en carpeta Zairen/products"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>Zairen/products</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleScopeChange('')}
                className={`px-2 py-1 rounded-none uppercase transition-colors cursor-pointer ${
                  folderScope === ''
                    ? 'bg-white text-black font-bold'
                    : 'text-[#ac8888] hover:text-white'
                }`}
                title="Todas las fotos de Cloudinary"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Todo</span>
                </span>
              </button>
            </div>

            {/* Filtros de Uso */}
            <div className="flex items-center gap-1 font-mono text-[11px] shrink-0 bg-[#1c1b1b] p-1 border border-white/[0.06]">
              {(['all', 'used', 'unused'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilterUsed(mode)}
                  className={`px-2.5 py-1 rounded-none uppercase transition-colors cursor-pointer ${
                    filterUsed === mode
                      ? 'bg-[#dc143c] text-white font-bold'
                      : 'text-[#ac8888] hover:text-white'
                  }`}
                >
                  {mode === 'all' ? 'Todas' : mode === 'used' ? 'En Uso' : 'Sin Usar'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Área de Grilla de Miniaturas */}
        <div className="flex-1 overflow-y-auto py-3 pr-1 my-1">
          {isLoading ? (
            /* Skeletons de Carga */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 animate-pulse">
              {Array.from({ length: 15 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] bg-[#1c1b1b] border border-white/[0.04] rounded-none flex items-center justify-center"
                >
                  <span className="w-6 h-6 bg-white/[0.06] rounded-none"></span>
                </div>
              ))}
            </div>
          ) : errorMsg ? (
            /* Estado de Error con Reintento */
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <span className="material-symbols-outlined text-[32px] text-[#dc143c]">
                cloud_off
              </span>
              <p className="font-mono text-xs text-red-400 max-w-md">{errorMsg}</p>
              <button
                type="button"
                onClick={() => fetchMedia()}
                className="px-4 py-2 bg-[#201f1f] hover:bg-[#2a2a2a] text-white font-mono text-xs uppercase border border-white/[0.1] transition-colors cursor-pointer"
              >
                Reintentar Conexión
              </button>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filteredResources.map((res) => {
                const isAlreadyInProduct = alreadySelectedUrls.includes(res.secure_url);
                const isSelectedNow = selectedUrls.includes(res.secure_url);
                const thumbUrl = getOptimizedImageUrl(res.secure_url, 300, 400);

                return (
                  <div
                    key={res.public_id}
                    onClick={() => toggleSelect(res.secure_url)}
                    className={`relative aspect-[3/4] bg-[#0E0F11] border transition-all cursor-pointer overflow-hidden group select-none ${
                      isAlreadyInProduct
                        ? 'border-emerald-600/50 opacity-40 cursor-not-allowed'
                        : isSelectedNow
                        ? 'border-[#dc143c] ring-2 ring-[#dc143c] scale-[0.98]'
                        : 'border-white/[0.08] hover:border-white/30'
                    }`}
                  >
                    <img
                      src={thumbUrl}
                      alt={res.public_id}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge de Uso */}
                    <div className="absolute top-1 left-1 flex flex-col gap-0.5">
                      {res.used_count > 0 ? (
                        <span className="bg-black/80 backdrop-blur-xs text-[#FAF9F6] text-[9px] font-mono px-1 py-0.5 border border-white/10 font-bold">
                          {res.used_count} {res.used_count === 1 ? 'uso' : 'usos'}
                        </span>
                      ) : (
                        <span className="bg-amber-950/80 text-amber-300 text-[9px] font-mono px-1 py-0.5 border border-amber-800/40 font-bold">
                          Sin usar
                        </span>
                      )}
                    </div>

                    {/* Estado de Selección */}
                    {isAlreadyInProduct && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2 text-center">
                        <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">
                          ✓ En esta prenda
                        </span>
                      </div>
                    )}

                    {isSelectedNow && (
                      <div className="absolute inset-0 bg-[#dc143c]/25 flex items-center justify-center">
                        <span className="w-7 h-7 bg-[#dc143c] text-white flex items-center justify-center font-bold text-xs shadow-md">
                          ✓
                        </span>
                      </div>
                    )}

                    {/* Overlay al pasar cursor si no está agregada */}
                    {!isAlreadyInProduct && !isSelectedNow && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2 py-1 bg-white/20 hover:bg-[#dc143c] text-white text-[11px] font-mono uppercase font-bold">
                          + Elegir
                        </span>
                      </div>
                    )}

                    {/* Micro-nombre en pie de foto */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-[#ac8888] truncate">
                      {res.public_id.split('/').pop()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <span className="material-symbols-outlined text-[28px] text-[#ac8888]">
                photo_library
              </span>
              <p className="font-mono text-xs text-[#ac8888]">
                No se encontraron imágenes {folderScope ? 'en la carpeta Zairen/products' : 'en Cloudinary'}.
              </p>
              {folderScope === 'zairen/' && (
                <button
                  type="button"
                  onClick={() => handleScopeChange('')}
                  className="px-3.5 py-1.5 bg-[#201f1f] hover:bg-white hover:text-black text-white font-mono text-xs uppercase border border-white/[0.1] transition-colors cursor-pointer"
                >
                  Explorar todo Cloudinary
                </button>
              )}
            </div>
          )}

          {/* Botón Cargar Más con Cursor */}
          {nextCursor && !isLoading && (
            <div className="pt-4 pb-2 text-center">
              <button
                type="button"
                onClick={() => fetchMedia(nextCursor, true)}
                disabled={isLoadingMore}
                className="px-5 py-2 bg-[#1c1b1b] hover:bg-[#201f1f] text-white font-mono text-xs uppercase tracking-wider border border-white/[0.08] hover:border-[#dc143c] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? 'Cargando más fotos...' : '↓ Cargar más fotos de Cloudinary'}
              </button>
            </div>
          )}
        </div>

        {/* Footer con Acciones Fijo en Móvil */}
        <div className="sticky bottom-0 z-20 bg-[#141416]/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <div className="font-mono text-xs text-[#ac8888]">
            {selectedUrls.length > 0 ? (
              <span className="text-white font-bold">
                {selectedUrls.length} {selectedUrls.length === 1 ? 'foto elegida' : 'fotos elegidas'}
              </span>
            ) : (
              <span>Selecciona una o más fotos para reutilizarlas</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/[0.08]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={selectedUrls.length === 0}
              className="px-5 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-[#dc143c]"
            >
              Agregar a la Prenda ({selectedUrls.length})
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
