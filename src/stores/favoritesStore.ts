import { atom } from 'nanostores';
import { toast } from 'sonner';

function getInitialFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('zairen_favorites');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export const $favorites = atom<string[]>(getInitialFavorites());

if (typeof window !== 'undefined') {
  $favorites.subscribe((list) => {
    try {
      localStorage.setItem('zairen_favorites', JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent('zairen-favorites-updated', { detail: { count: list.length } })
      );
    } catch {}
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'zairen_favorites') {
      $favorites.set(getInitialFavorites());
    }
  });
}

export function isFavorite(id: string, slug?: string): boolean {
  const current = $favorites.get();
  return current.includes(id) || (!!slug && current.includes(slug));
}

export function toggleFavorite(id: string, slug?: string, nombre?: string): boolean {
  const current = $favorites.get();
  const exists = current.includes(id) || (!!slug && current.includes(slug));

  let updated: string[];
  if (exists) {
    updated = current.filter((item) => item !== id && item !== slug);
    $favorites.set(updated);
    if (nombre) {
      toast.info(`${nombre} quitado de tus favoritos`);
    }
    return false;
  } else {
    updated = [...current, id];
    $favorites.set(updated);
    if (nombre) {
      toast.success(`${nombre} guardado en tus favoritos`);
    }
    return true;
  }
}
