// src/context/FavoritesContext.jsx
// Liste de favoris (cœur sur les cartes produit), persistée dans localStorage.
// Chaque ajout/retrait est annoncé aux lecteurs d'écran via une région aria-live.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useLocalStorage('mboa-favorites', []);
  const [announcement, setAnnouncement] = useState('');

  const toggle = useCallback(
    (product) => {
      const isFav = ids.includes(product.id);
      // Tableau recréé (jamais muté) pour que React détecte le changement
      setIds(isFav ? ids.filter((id) => id !== product.id) : [...ids, product.id]);
      setAnnouncement(isFav ? `${product.name} retiré des favoris` : `${product.name} ajouté aux favoris`);
    },
    [ids, setIds],
  );

  const value = useMemo(
    () => ({ ids, count: ids.length, toggle, isFavorite: (id) => ids.includes(id) }),
    [ids, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
      {/* Région « polie » invisible : annonce les changements sans déplacer le focus */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites doit être utilisé à l’intérieur de <FavoritesProvider>');
  return ctx;
}
