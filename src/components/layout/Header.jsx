// src/components/layout/Header.jsx
// En-tête du site. Reprend la structure du gabarit « Shop » fourni (logo rond doré, navigation,
// recherche, icônes à droite) avec une adaptation responsive :
//
//   • MOBILE / TABLETTE (< 1024px) : bouton hamburger qui ouvre le menu (tiroir) ;
//   • ORDINATEUR (≥ 1024px)        : barre de navigation horizontale ;
//   • champ de recherche visible à partir de la tablette (md:) ; sur mobile, la recherche passe par le micro-dock.
//
// Tout le responsive de cet en-tête est fait en CSS pur (hidden / lg:flex …), sans JavaScript.
//
// Sémantique : <header> + <nav aria-label="Navigation principale">. Le lien actif porte aria-current="page"
// (ajouté automatiquement par NavLink) et un soulignement doré : l'information ne repose pas sur la couleur seule.
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, ShoppingCart } from 'lucide-react';
import SearchBox from './SearchBox.jsx';
import { NAV_LINKS } from '../../config/navigation.js';
import { SITE } from '../../config/site.js';
import { useCart } from '../../context/CartContext.jsx';
import { useFavorites } from '../../context/FavoritesContext.jsx';

/** Pastille de compteur posée sur une icône (masquée aux lecteurs d'écran : le nom du bouton porte déjà le nombre). */
function Badge({ count }) {
  if (count === 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-ink"
    >
      {count}
    </span>
  );
}

export default function Header({ onOpenMenu }) {
  const { count: cartCount, openCart } = useCart();
  const { count: favCount } = useFavorites();

  return (
    // sticky + z-40 : l'en-tête reste visible au défilement, sous les tiroirs (z-60)
    <header className="glass sticky top-0 z-40 border-b border-white/10">
      <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-20">
        <div className="flex items-center gap-1">
          {/* Hamburger : masqué dès 1024px (lg:hidden) où la barre horizontale prend le relais */}
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            aria-haspopup="dialog"
            className="icon-btn -ml-2 lg:hidden"
          >
            <Menu aria-hidden="true" />
          </button>

          {/* Logo : rond doré + nom de la marque (le slogan n'apparaît qu'à partir de sm:) */}
          <Link to="/" className="flex min-h-[44px] items-center gap-2" aria-label={`${SITE.name} : retour à l'accueil`}>
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold font-serif text-lg font-bold text-ink"
            >
              M
            </span>
            <span className="hidden sm:block">
              <span className="block text-lg font-bold uppercase leading-tight tracking-wide">{SITE.name}</span>
              <span className="block text-[10px] uppercase tracking-widest text-gold">{SITE.tagline}</span>
            </span>
          </Link>
        </div>

        {/* Navigation horizontale : visible seulement sur ordinateur */}
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-sm font-medium uppercase tracking-wide">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `inline-flex min-h-[44px] items-center border-b-2 transition-colors hover:text-gold ${
                      isActive ? 'border-gold text-gold' : 'border-transparent'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          {/* Recherche : à partir de la tablette */}
          <div className="hidden md:block">
            <SearchBox variant="header" />
          </div>

          <Link to="/favoris" className="icon-btn" aria-label={`Mes favoris (${favCount})`}>
            <Heart aria-hidden="true" />
            <Badge count={favCount} />
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-haspopup="dialog"
            aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
            className="icon-btn"
          >
            <ShoppingCart aria-hidden="true" />
            <Badge count={cartCount} />
          </button>
        </div>
      </div>
    </header>
  );
}
