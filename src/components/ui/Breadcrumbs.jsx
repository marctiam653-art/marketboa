// src/components/ui/Breadcrumbs.jsx
// Fil d'Ariane sémantique : <nav aria-label> + liste ordonnée. La page courante porte aria-current="page".
// Aide à l'orientation (accessibilité) et au SEO (structure du site).
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** @param {Array<{label: string, to?: string}>} items le dernier élément est la page courante (sans lien) */
export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-sand-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-sand">
                  {item.label}
                </span>
              ) : (
                // py-3 : agrandit la zone cliquable à ≥ 44px de haut sans changer l'aspect
                <Link to={item.to} className="py-3 hover:text-gold hover:underline">
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight size={14} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
