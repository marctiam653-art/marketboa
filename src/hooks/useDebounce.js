// src/hooks/useDebounce.js
// « Debounce » : renvoie la valeur seulement après un délai sans changement.
// Utilisé par la recherche en direct : on n'interroge l'« API » que lorsque l'utilisateur
// s'arrête de taper (pas à chaque touche), ce qui évite des requêtes inutiles.
import { useEffect, useState } from 'react';

export default function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Si la valeur change avant la fin du délai, on annule le minuteur précédent
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
