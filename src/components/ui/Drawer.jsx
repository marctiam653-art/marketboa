// src/components/ui/Drawer.jsx
// Tiroir / fenêtre modale réutilisable : panier, menu mobile, filtres, recherche mobile.
// Toute la logique d'accessibilité (focus piégé, Échap, retour du focus) est dans useModalA11y.
//
// ⚠️ Un Drawer doit être rendu à la racine de la page (dans Layout), jamais à l'intérieur d'un élément
// possédant backdrop-filter ou transform : ces propriétés « emprisonnent » les éléments en position fixed.
import { useId, useRef } from 'react';
import { X } from 'lucide-react';
import useModalA11y from '../../hooks/useModalA11y.js';

const SIDES = {
  right: 'right-0 top-0 h-full w-full max-w-md animate-slide-in-right',
  left: 'left-0 top-0 h-full w-full max-w-sm animate-slide-in-left',
  top: 'inset-x-0 top-0 max-h-full animate-fade-in',
};

/**
 * @param {boolean}  open     visible ou non
 * @param {Function} onClose  fermeture
 * @param {string}   title    titre visible (sert aussi de nom accessible à la boîte de dialogue)
 * @param {string}   [side]   'right' | 'left' | 'top'
 */
export default function Drawer({ open, onClose, title, side = 'right', children }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useModalA11y(open, onClose, panelRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Fond assombri : cliquer dessus ferme le tiroir (le clavier utilise Échap ou le bouton Fermer) */}
      <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`absolute flex flex-col overflow-y-auto bg-surface shadow-2xl ${SIDES[side]}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <h2 id={titleId} className="text-xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="icon-btn" aria-label={`Fermer : ${title}`}>
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
