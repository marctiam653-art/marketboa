// src/hooks/useMediaQuery.js
// Hook complémentaire au CSS responsive.
//
// ⚠️ RÈGLE DU PROJET : le responsive se fait d'abord en CSS pur (media queries via les préfixes
// Tailwind md:/lg:). Ce hook n'est utilisé QUE lorsque la STRUCTURE du composant change
// fondamentalement : ici, la barre latérale de filtres (visible en permanence sur ordinateur)
// devient un tiroir (drawer) ouvert à la demande sur mobile/tablette. Un simple « hidden lg:block »
// ne suffirait pas, car le tiroir a un comportement différent (focus piégé, bouton d'ouverture, etc.).
import { useEffect, useState } from 'react';

/**
 * @param {string} query une media query CSS, ex. '(min-width: 1024px)'
 * @returns {boolean} true si la media query correspond actuellement
 */
export default function useMediaQuery(query) {
  // Valeur initiale lue de façon synchrone pour éviter un « flash » du mauvais affichage
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    setMatches(mql.matches); // resynchronise si la query a changé
    mql.addEventListener('change', onChange);
    // Nettoyage : on retire l'écouteur quand le composant disparaît ou que la query change
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
