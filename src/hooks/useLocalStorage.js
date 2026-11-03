// src/hooks/useLocalStorage.js
// useState persistant : la valeur survit au rechargement de la page (panier, favoris…).
// Les accès au stockage sont protégés par try/catch : en navigation privée ou quand le
// stockage est plein/bloqué, l'application continue de fonctionner (sans persistance).
import { useEffect, useState } from 'react';

export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* stockage indisponible : on ignore volontairement */
    }
  }, [key, value]);

  return [value, setValue];
}
