// src/components/product/ProductGrid.jsx
// Grille de produits : liste sémantique (<ul>/<li>) de cartes.
//
// RESPONSIVE (mobile-first) — nombre de colonnes selon l'écran :
//   • mobile (par défaut)  : 2 colonnes ;
//   • tablette (md ≥ 768)  : 3 colonnes ;
//   • ordinateur (lg ≥ 1024) : 3 colonnes (avec barre latérale) ou 4 colonnes (pleine largeur).
// En vue « liste », une seule colonne avec des cartes horizontales.
import ProductCard from './ProductCard.jsx';

const COLUMNS = {
  // pleine largeur (accueil, collections, favoris) : jusqu'à 4 colonnes
  full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  // avec barre latérale de filtres (boutique) : 3 colonnes, puis 4 sur grand écran
  sidebar: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
};

/**
 * @param {Array}               products
 * @param {'full'|'sidebar'}    [columns]
 * @param {'grid'|'list'}       [view]
 */
export default function ProductGrid({ products, columns = 'full', view = 'grid' }) {
  return (
    <ul className={`grid gap-3 sm:gap-6 ${view === 'list' ? 'grid-cols-1' : COLUMNS[columns]}`}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} view={view} />
        </li>
      ))}
    </ul>
  );
}
