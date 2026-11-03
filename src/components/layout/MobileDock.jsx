// src/components/layout/MobileDock.jsx
// MICRO-DOCK mobile : petite barre flottante en bas de l'écran, en « verre dépoli »
// (backdrop-filter: blur), avec 4 raccourcis : Accueil, Boutique, Recherche, Panier.
// Idée reprise du site de référence ; code entièrement réécrit en React.
//
// Composant CONTRÔLÉ PAR L'ÉTAT : il reçoit de Layout les actions (ouvrir la recherche / le panier) et
// le nombre d'articles, et gère lui-même un état « masqué » : quand un champ de saisie reçoit le focus,
// le clavier virtuel prend la moitié de l'écran, et le dock disparaît pour ne pas recouvrir le formulaire.
//
// Mobile / Android / iPhone :
//   • env(safe-area-inset-bottom) ajoute la hauteur de l'encoche ou de la barre gestuelle → le dock
//     n'est jamais coupé ni chevauché par la barre système (nécessite viewport-fit=cover dans index.html) ;
//   • chaque bouton fait au moins 44×44 px ;
//   • visible uniquement en dessous de 1024px (lg:hidden) : sur ordinateur, la barre du haut suffit.
//
// Accessibilité : <nav> avec un nom propre (« Raccourcis mobiles »). Le dock est placé EN FIN de page dans
// le DOM (voir Layout) : les lecteurs d'écran et la tabulation lisent d'abord le contenu, puis ce raccourci ;
// il ne s'intercale donc pas entre l'utilisateur et le contenu.
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingBag, ShoppingCart } from 'lucide-react';

// Balises dans lesquelles on saisit du texte (le clavier virtuel s'ouvre)
const TEXT_FIELDS = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select';

function DockLink({ to, icon: Icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-xs font-medium ${
          isActive ? 'text-gold' : 'text-sand'
        }`
      }
    >
      <Icon size={22} aria-hidden="true" />
      {label}
    </NavLink>
  );
}

export default function MobileDock({ cartCount, onOpenSearch, onOpenCart }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Détecte l'entrée / la sortie d'un champ de saisie n'importe où dans la page
  useEffect(() => {
    const onFocusIn = (event) => setKeyboardOpen(event.target.matches(TEXT_FIELDS));
    const onFocusOut = () => setKeyboardOpen(false);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return (
    <nav
      aria-label="Raccourcis mobiles"
      // pointer-events-none sur le conteneur : seule la « pilule » capte les clics, le reste de la zone laisse passer
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
        keyboardOpen ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      <ul className="glass pointer-events-auto mx-auto flex max-w-sm items-center justify-around rounded-full border border-white/15 px-2 py-1 shadow-lg shadow-black/50">
        <li>
          <DockLink to="/" end icon={Home} label="Accueil" />
        </li>
        <li>
          <DockLink to="/shop" icon={ShoppingBag} label="Boutique" />
        </li>
        <li>
          <button
            type="button"
            onClick={onOpenSearch}
            aria-haspopup="dialog"
            className="flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-xs font-medium"
          >
            <Search size={22} aria-hidden="true" />
            Recherche
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={onOpenCart}
            aria-haspopup="dialog"
            aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
            className="relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-full px-3 text-xs font-medium"
          >
            <ShoppingCart size={22} aria-hidden="true" />
            Panier
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink"
              >
                {cartCount}
              </span>
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
}
