// src/pages/Favorites.jsx
// Liste des favoris de l'utilisateur (stockés dans son navigateur). Page privée : exclue des moteurs de recherche.
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { getProduct } from '../lib/catalog.js';

export default function Favorites() {
  useDocumentMeta({
    title: 'Mes favoris',
    description: 'Retrouvez les pièces d’artisanat africain que vous avez mises de côté.',
    path: '/favoris',
    noindex: true, // contenu personnel : aucune valeur pour le référencement
  });

  const { ids } = useFavorites();
  // On retrouve les produits à partir des identifiants (et on écarte ceux qui n'existent plus)
  const favorites = ids.map(getProduct).filter(Boolean);

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Mes favoris' }]} />
      <h1 className="mb-8 text-4xl md:text-5xl">Mes favoris</h1>

      {favorites.length > 0 ? (
        <ProductGrid products={favorites} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
          <p className="mb-4 text-sand-muted">Vous n’avez pas encore de favoris. Touchez le cœur d’une pièce pour la retrouver ici.</p>
          <Link to="/shop" className="btn btn-primary">
            Parcourir la boutique
          </Link>
        </div>
      )}
    </div>
  );
}
