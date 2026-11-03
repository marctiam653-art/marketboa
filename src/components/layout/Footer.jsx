// src/components/layout/Footer.jsx
// Pied de page : <footer> avec plusieurs blocs de navigation.
//
// RESPONSIVE : 1 colonne sur mobile → 2 colonnes (sm) → 4 colonnes sur ordinateur (lg).
// Le grand padding-bas sur mobile (pb-[…]) réserve la place du micro-dock flottant, afin que
// le dernier contenu ne soit jamais caché derrière lui ; il disparaît sur ordinateur (lg:pb-8).
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { NAV_LINKS } from '../../config/navigation.js';
import { SITE } from '../../config/site.js';
import { collections } from '../../lib/catalog.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';

// Style commun des liens du pied de page (py-2 + min-h : zone tactile ≥ 44 px)
const linkClass = 'inline-flex min-h-[44px] min-w-[44px] items-center text-sand-muted hover:text-gold hover:underline';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-surface pb-[calc(6rem+env(safe-area-inset-bottom))] pt-12 lg:pb-8">
      <div className="container-page">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-xl font-bold uppercase tracking-wide">{SITE.name}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-gold">{SITE.tagline}</p>
            <p className="mt-4 text-sm text-sand-muted">
              Chaque pièce est signée par un artisan identifié. Nous racontons leur histoire et reversons à l’atelier
              une part juste du prix de vente.
            </p>
          </div>

          <nav aria-label="Navigation du pied de page">
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest">Explorer</h2>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Collections">
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest">Collections</h2>
            <ul>
              {collections.map((collection) => (
                <li key={collection.slug}>
                  <Link to={`/collections/${collection.slug}`} className={linkClass}>
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-widest">Contact</h2>
            <ul>
              <li>
                <a href={`mailto:${SITE.email}`} className={`${linkClass} gap-2`}>
                  <Mail size={16} aria-hidden="true" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppUrl(`Bonjour ${SITE.name}, j'ai une question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} gap-2`}
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                  <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-sand-muted">
          © {new Date().getFullYear()} {SITE.name}. Projet académique : les produits, artisans et avis sont fictifs, et les
          images sont des illustrations.
        </p>
      </div>
    </footer>
  );
}
