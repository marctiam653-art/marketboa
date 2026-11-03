// src/components/layout/Layout.jsx
// Gabarit commun à toutes les pages : bandeau, en-tête, contenu (<Outlet />), pied de page,
// et tous les éléments « flottants » (micro-dock, WhatsApp, tiroirs).
//
// Structure sémantique d'une page : <header> → <nav> → <main> (un seul par page) → <footer>.
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import MobileDock from './MobileDock.jsx';
import MobileMenu from './MobileMenu.jsx';
import SearchBox from './SearchBox.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';
import Drawer from '../ui/Drawer.jsx';
import { useCart } from '../../context/CartContext.jsx';

/**
 * Application d'une navigation « SPA » :
 *  - remonte en haut de page quand on change de page (sinon on garderait la position de scroll précédente) ;
 *  - si l'URL contient une ancre (#esther-mbarga), fait défiler jusqu'à l'élément correspondant ;
 *  - annonce le changement de page aux lecteurs d'écran (une SPA ne recharge pas la page : sans cela,
 *    un utilisateur de lecteur d'écran ne saurait pas que la navigation a eu lieu).
 */
function RouteEffects() {
  const { pathname, hash } = useLocation();
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const timers = [];
    if (hash) {
      // La page est chargée à la demande (lazy) : la section ciblée peut ne pas exister encore.
      // On réessaie donc le défilement à quelques reprises, le temps que le contenu et les images se posent.
      [0, 250, 600].forEach((delay) =>
        timers.push(setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), delay)),
      );
    } else {
      window.scrollTo(0, 0);
    }

    // Petit délai : la page (chargée à la demande) doit avoir eu le temps de mettre à jour document.title
    timers.push(setTimeout(() => setAnnouncement(`Page chargée : ${document.title}`), 400));
    return () => timers.forEach(clearTimeout);
  }, [pathname, hash]);

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {announcement}
    </p>
  );
}

export default function Layout() {
  const { count: cartCount, openCart } = useCart();
  const { key } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Chaque navigation referme le menu et la recherche mobile
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [key]);

  return (
    <>
      {/* Lien d'évitement (WCAG 2.4.1) : premier élément focusable de la page. Invisible, il apparaît au focus
          clavier et permet de sauter l'en-tête pour aller directement au contenu. */}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:font-semibold focus:text-ink"
      >
        Aller au contenu principal
      </a>

      <AnnouncementBar />
      <Header onOpenMenu={() => setMenuOpen(true)} />

      {/* tabIndex=-1 : la cible du lien d'évitement peut recevoir le focus */}
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />

      {/* ---- Éléments flottants et tiroirs : placés en fin de DOM, à la racine (pas dans l'en-tête, dont le
          backdrop-filter « emprisonnerait » les éléments en position fixed) ---- */}
      <MobileDock cartCount={cartCount} onOpenSearch={() => setSearchOpen(true)} onOpenCart={openCart} />
      <WhatsAppButton />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer />
      <Drawer open={searchOpen} onClose={() => setSearchOpen(false)} title="Rechercher" side="top">
        <div className="p-4 pb-6">
          <SearchBox variant="overlay" onNavigate={() => setSearchOpen(false)} />
        </div>
      </Drawer>

      <RouteEffects />
    </>
  );
}
