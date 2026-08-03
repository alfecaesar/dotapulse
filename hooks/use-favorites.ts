'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FavoriteItem } from '@/types';
import { FAVORITES_STORAGE_KEY } from '@/utils/constants';

function readFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavorites(items: FavoriteItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('dotapulse:favorites-changed'));
  } catch {
    // ignore quota errors
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setHydrated(true);

    const handler = () => setFavorites(readFavorites());
    window.addEventListener('dotapulse:favorites-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('dotapulse:favorites-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const addFavorite = useCallback(
    (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
      const current = readFavorites();
      const id = `${item.type}:${item.refId}`;
      if (current.some((f) => f.id === id)) return;
      const next: FavoriteItem[] = [
        { ...item, id, addedAt: Date.now() },
        ...current,
      ];
      writeFavorites(next);
    },
    []
  );

  const removeFavorite = useCallback((id: string) => {
    const current = readFavorites();
    writeFavorites(current.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'id' | 'addedAt'>) => {
      const id = `${item.type}:${item.refId}`;
      const current = readFavorites();
      if (current.some((f) => f.id === id)) {
        writeFavorites(current.filter((f) => f.id !== id));
      } else {
        writeFavorites([
          { ...item, id, addedAt: Date.now() },
          ...current,
        ]);
      }
    },
    []
  );

  const isFavorite = useCallback(
    (type: 'hero' | 'player', refId: number): boolean => {
      const id = `${type}:${refId}`;
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  const clearAll = useCallback(() => {
    writeFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAll,
    hydrated,
  };
}
