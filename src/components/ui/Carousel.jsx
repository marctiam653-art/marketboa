// src/components/ui/Carousel.jsx
// Carrousel ACCESSIBLE écrit à la main (sans bibliothèque).
//
// POURQUOI UNE IMPLÉMENTATION MANUELLE plutôt que @cloudimage/carousel ?
//   → un seul composant sert les deux usages du projet (bannières d'accueil ET galerie produit),
//     sans dépendance supplémentaire (bundle plus léger), avec un contrôle total de l'ARIA, du swipe
//     tactile et de la pause, et sans risque d'incompatibilité de version avec React 18.
//
// CONFORMITÉ W3C (WAI-ARIA Authoring Practices — « Carousel pattern ») :
//   • conteneur role="region" + aria-roledescription="carousel" + aria-label ;
//   • chaque diapositive : role="group" + aria-roledescription="slide" + aria-label="X sur Y" ;
//   • les diapositives non visibles sont « inert » (hors navigation clavier et lecteurs d'écran) ;
//   • défilement automatique OFF par défaut. S'il est activé (autoPlay) :
//       – bouton Pause/Lecture toujours visible ;
//       – arrêt dès que la souris survole ou que le FOCUS CLAVIER entre dans le carrousel ;
//       – jamais d'auto-défilement si l'utilisateur a demandé « réduire les animations » ;
//   • flèches ← → du clavier, boutons précédent/suivant et points (≥ 44×44 px) ;
//   • swipe tactile (touchstart / touchmove / touchend).
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import useMediaQuery from '../../hooks/useMediaQuery.js';

const SWIPE_THRESHOLD = 50; // distance minimale (px) pour qu'un glissement compte comme un swipe

/**
 * @param {string}   label          nom du carrousel pour les lecteurs d'écran
 * @param {Array}    items          éléments à afficher (une diapositive par élément)
 * @param {Function} getKey         (item) => clé unique React
 * @param {Function} renderItem     (item, index, isActive) => contenu de la diapositive
 * @param {boolean}  [autoPlay]     défilement automatique (désactivé par défaut)
 * @param {number}   [interval]     délai entre deux diapositives en ms
 * @param {number}   [index]        mode CONTRÔLÉ : index courant géré par le parent (ex. galerie + miniatures)
 * @param {Function} [onIndexChange] appelé avec le nouvel index
 * @param {boolean}  [showDots]     afficher les points de navigation
 */
export default function Carousel({
  label,
  items,
  getKey,
  renderItem,
  autoPlay = false,
  interval = 7000,
  index,
  onIndexChange,
  showDots = true,
  className = '',
}) {
  const count = items.length;

  // Mode contrôlé (index fourni par le parent) ou non contrôlé (état interne)
  const isControlled = index !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const current = isControlled ? index : internalIndex;

  // Ici le hook ne sert pas à la mise en page mais au COMPORTEMENT : pas de défilement automatique
  // si le système demande de réduire les animations.
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [userPaused, setUserPaused] = useState(false); // pause demandée via le bouton
  const [interacting, setInteracting] = useState(false); // survol souris ou focus clavier dans le carrousel
  const canAutoPlay = autoPlay && !prefersReducedMotion && count > 1;
  const isRotating = canAutoPlay && !userPaused && !interacting;

  // Aller à une diapositive (avec retour au début / à la fin : navigation circulaire)
  const goTo = useCallback(
    (target) => {
      const next = ((target % count) + count) % count;
      if (!isControlled) setInternalIndex(next);
      if (onIndexChange) onIndexChange(next);
    },
    [count, isControlled, onIndexChange],
  );

  // Défilement automatique : un minuteur relancé à chaque changement de diapositive
  useEffect(() => {
    if (!isRotating) return undefined;
    const timer = setTimeout(() => goTo(current + 1), interval);
    return () => clearTimeout(timer); // nettoyage obligatoire
  }, [isRotating, current, goTo, interval]);

  // --- Swipe tactile -------------------------------------------------------
  // On mémorise le doigt dans une ref (pas dans le state : inutile de re-rendre à chaque mouvement).
  const touch = useRef(null);
  const onTouchStart = (event) => {
    const t = event.touches[0];
    touch.current = { startX: t.clientX, startY: t.clientY, dx: 0, dy: 0 };
  };
  const onTouchMove = (event) => {
    if (!touch.current) return;
    const t = event.touches[0];
    touch.current.dx = t.clientX - touch.current.startX;
    touch.current.dy = t.clientY - touch.current.startY;
  };
  const onTouchEnd = () => {
    if (!touch.current) return;
    const { dx, dy } = touch.current;
    touch.current = null;
    // Geste surtout horizontal et assez long → suivant / précédent. Un geste vertical reste un défilement de page.
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
  };

  // Flèches gauche/droite du clavier (sauf si l'utilisateur est dans un champ de saisie)
  const onKeyDown = (event) => {
    if (event.target.closest('input, textarea, select')) return;
    if (event.key === 'ArrowRight') goTo(current + 1);
    if (event.key === 'ArrowLeft') goTo(current - 1);
  };

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`flex flex-col ${className}`}
      onKeyDown={onKeyDown}
      // Arrêt de l'auto-défilement au survol OU quand le focus clavier entre dans le carrousel (W3C 2.2.2)
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      {/* Contrôles : placés AVANT les diapositives dans le DOM (ordre de tabulation recommandé par le W3C :
          le bouton pause est le premier élément), mais affichés SOUS les diapositives grâce à « order-2 ». */}
      {count > 1 && (canAutoPlay || showDots) && (
        <div className="order-2 mt-3 flex items-center justify-center gap-1">
          {canAutoPlay && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              className="icon-btn border border-white/30"
              aria-label={userPaused ? 'Reprendre le défilement automatique' : 'Mettre le défilement automatique en pause'}
            >
              {userPaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            </button>
          )}
          {showDots && (
            <div role="group" aria-label="Choisir une diapositive" className="flex items-center">
              {items.map((item, i) => (
                <button
                  key={getKey(item)}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Aller à la diapositive ${i + 1}`}
                  aria-current={i === current ? 'true' : undefined}
                  // Bouton de 44×44 px (zone tactile) contenant un petit point visuel
                  className="flex h-11 w-11 items-center justify-center"
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all motion-reduce:transition-none ${
                      i === current ? 'w-6 bg-gold' : 'w-2.5 bg-white/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="relative order-1">
        {/* touch-pan-y : le navigateur gère le défilement vertical, nous gérons le glissement horizontal */}
        <div
          className="touch-pan-y overflow-hidden rounded-2xl"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* « Piste » : toutes les diapositives côte à côte, décalée de -100 % × index */}
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${current * 100}%)` }}
            // En défilement automatique on évite d'annoncer chaque changement (nuisance sonore)
            aria-live={isRotating ? 'off' : 'polite'}
          >
            {items.map((item, i) => (
              <div
                key={getKey(item)}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} sur ${count}`}
                // Les diapositives hors champ sont exclues du clavier et des lecteurs d'écran
                inert={i === current ? undefined : ''}
                aria-hidden={i === current ? undefined : 'true'}
                className="w-full shrink-0"
              >
                {renderItem(item, i, i === current)}
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(current - 1)}
              aria-label="Diapositive précédente"
              className="icon-btn glass absolute left-2 top-1/2 -translate-y-1/2 border border-white/20"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              aria-label="Diapositive suivante"
              className="icon-btn glass absolute right-2 top-1/2 -translate-y-1/2 border border-white/20"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
