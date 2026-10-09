import React from 'react';

export interface MorphIconProps {
  active?: boolean;
  state?: 'A' | 'B' | string;
  IconA: React.ComponentType<{ className?: string }>;
  IconB: React.ComponentType<{ className?: string }>;
  className?: string;
}

/**
 * Micro-animación fluida de icono morphing (+ rota a ✓)
 * Basado en la especificación técnica de Zairen Lab
 */
export function MorphIcon({
  active,
  state,
  IconA,
  IconB,
  className = 'w-4 h-4',
}: MorphIconProps) {
  const isBActive = active !== undefined ? active : state === 'B';

  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5 overflow-hidden">
      <span
        className={`absolute transition-all duration-200 ease-out transform ${
          isBActive ? 'opacity-0 scale-50 rotate-45' : 'opacity-100 scale-100 rotate-0'
        }`}
      >
        <IconA className={className} />
      </span>
      <span
        className={`absolute transition-all duration-200 ease-out transform ${
          isBActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'
        }`}
      >
        <IconB className={className} />
      </span>
    </span>
  );
}
