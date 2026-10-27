import React, { useState, useRef, useEffect, useId } from 'react';

export interface ColeccionItem {
  id: string;
  nombre: string;
  slug: string;
  count: number;
}

interface ColeccionComboboxProps {
  collections: ColeccionItem[];
  selectedSlug: string;
  totalCount: number;
  onSelect: (slug: string) => void;
}

export function ColeccionCombobox({
  collections,
  selectedSlug,
  totalCount,
  onSelect,
}: ColeccionComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  // Filtrar lista de colecciones según búsqueda interna
  const filteredCollections = collections.filter((c) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase().trim();
    return c.nombre.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });

  // Lista combinada: "Todas" como primer elemento + colecciones filtradas
  const allOption: ColeccionItem = {
    id: 'todas',
    nombre: 'Todas las colecciones',
    slug: 'todas',
    count: totalCount,
  };

  const showAllOption =
    !filterText.trim() ||
    'todas las colecciones'.includes(filterText.toLowerCase().trim()) ||
    'todas'.includes(filterText.toLowerCase().trim());

  const displayedOptions: ColeccionItem[] = showAllOption
    ? [allOption, ...filteredCollections]
    : filteredCollections;

  // Colección actualmente seleccionada
  const activeCollection =
    selectedSlug === 'todas'
      ? allOption
      : collections.find((c) => c.slug === selectedSlug) || allOption;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Foco automático en el buscador al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setHighlightedIndex(-1);
    } else {
      setFilterText('');
    }
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    onSelect(slug);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Manejo de teclado accesible
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < displayedOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : displayedOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < displayedOptions.length) {
        handleSelect(displayedOptions[highlightedIndex].slug);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block w-full sm:w-80 text-left select-none max-w-full"
      onKeyDown={handleKeyDown}
    >
      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#ac8888] mb-1.5 font-bold">
        COLECCIÓN ACTIVA
      </label>

      {/* Botón Trigger del Combobox */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined}
        aria-label="Seleccionar colección de prendas"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 bg-[#141416] hover:bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] hover:border-[#dc143c] focus:border-[#dc143c] focus:outline-none transition-all cursor-pointer shadow-md"
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="w-1.5 h-1.5 bg-[#dc143c] shrink-0"></span>
          <span className="truncate uppercase font-bold text-[#FAF9F6] text-[11px] sm:text-xs">
            {activeCollection.nombre}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-1.5 py-0.5 bg-[#201f1f] text-[#ffb3b3] font-mono text-[10px] font-bold">
            {activeCollection.count}
          </span>
          <svg
            className={`w-4 h-4 text-[#ac8888] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#dc143c]' : ''
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Menú Desplegable con Búsqueda */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Lista de colecciones disponibles"
          className="absolute z-40 left-0 right-0 mt-1 bg-[#141416] border border-[#dc143c]/40 shadow-[0_12px_36px_rgba(0,0,0,0.85)] max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Input de filtro interactivo */}
          <div className="p-2.5 border-b border-white/[0.08] bg-[#1a191b] flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#ac8888] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <label htmlFor="combobox-search-input" className="sr-only">
              Filtrar colecciones por nombre
            </label>
            <input
              ref={searchInputRef}
              id="combobox-search-input"
              name="filterColeccion"
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Buscar colección..."
              aria-label="Filtrar colecciones por nombre"
              className="w-full bg-transparent text-white font-mono text-xs placeholder:text-[#666] focus:outline-none"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="text-[#ac8888] hover:text-white font-mono text-xs px-1"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lista de opciones accesibles */}
          <div className="overflow-y-auto py-1 scrollbar-thin-hover">
            {displayedOptions.length > 0 ? (
              displayedOptions.map((col, idx) => {
                const isSelected = selectedSlug === col.slug;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <div
                    key={col.id}
                    id={`${listboxId}-opt-${idx}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(col.slug)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`min-h-[40px] px-3.5 py-2.5 flex items-center justify-between text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#dc143c]/15 text-[#ffb3b3] border-l-2 border-[#dc143c]'
                        : isHighlighted
                        ? 'bg-[#1c1b1b] text-white'
                        : 'text-[#ac8888] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc143c] shrink-0"></span>
                      )}
                      <span className="uppercase font-bold truncate text-[11px] sm:text-xs">
                        {col.nombre}
                      </span>
                    </div>

                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#dc143c] text-white font-bold'
                          : 'bg-[#201f1f] text-[#888]'
                      }`}
                    >
                      {col.count} {col.count === 1 ? 'prenda' : 'prendas'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs font-mono text-[#ac8888]">
                No se encontraron colecciones con "{filterText}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
