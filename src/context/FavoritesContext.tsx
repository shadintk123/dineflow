import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface FavoritesContextValue {
  favorites: string[];
  toggle: (restaurantId: string) => void;
  isFavorite: (restaurantId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = 'dineflow_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = (f: string[]) => {
    setFavorites(f);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  };

  const toggle = (restaurantId: string) => {
    persist(
      favorites.includes(restaurantId)
        ? favorites.filter((f) => f !== restaurantId)
        : [...favorites, restaurantId]
    );
  };

  const isFavorite = (restaurantId: string) => favorites.includes(restaurantId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
