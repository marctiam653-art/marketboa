// src/hooks/useModalA11y.js
// Accessibilité des fenêtres modales / tiroirs (panier, menu mobile, filtres, recherche mobile).
// Respecte le motif « dialog modal » du W3C (WAI-ARIA Authoring Practices) :
//   1. À l'ouverture, le focus clavier entre dans la fenêtre ;
//   2. Tab / Maj+Tab restent « piégés » à l'intérieur (focus trap) ;
//   3. Échap ferme la fenêtre ;
//   4. À la fermeture, le focus revient sur l'élément qui l'avait ouverte ;
//   5. Le défilement de la page derrière est bloqué.
import { useEffect, useRef } from 'react';

// Éléments pouvant recevoir le focus
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {boolean}  isOpen   la fenêtre est-elle ouverte ?
 * @param {Function} onClose  fonction qui ferme la fenêtre
 * @param {Object}   panelRef ref React vers le conteneur de la fenêtre
 */
export default function useModalA11y(isOpen, onClose, panelRef) {
  // On garde la dernière fonction onClose dans une ref : l'effet ci-dessous ne se relance donc pas
  // (et ne redonne pas le focus au premier élément) quand le parent recrée sa fonction à chaque rendu.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    // Mémorise l'élément qui avait le focus pour le lui rendre ensuite
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;

    // Bloque le défilement de l'arrière-plan
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Place le focus : d'abord sur un élément marqué data-autofocus (ex. le champ de recherche),
    // sinon sur le premier élément interactif, sinon sur le panneau lui-même.
    const focusables = () => Array.from(panel?.querySelectorAll(FOCUSABLE) ?? []);
    (panel?.querySelector('[data-autofocus]') ?? focusables()[0] ?? panel)?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      // Focus trap : on boucle entre le premier et le dernier élément
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Rend le focus à l'élément déclencheur s'il existe encore dans la page
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, [isOpen, panelRef]);
}
