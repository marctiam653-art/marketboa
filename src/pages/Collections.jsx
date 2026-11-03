// src/pages/Collections.jsx
// Liste des collections (entrée « thématique » du catalogue). Chaque carte mène à /collections/:slug.
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import CatalogCard from '../components/catalog/CatalogCard.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { collections, countByCollection } from '../lib/catalog.js';

export default function Collections() {
  useDocumentMeta({
    title: 'Collections',
    description: 'Aura, Océane, Terre : trois collections d’artisanat africain fait main, chacune portée par un atelier et une histoire.',
    path: '/collections',
  });

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Collections' }]} />

      <h1 className="mb-3 text-4xl md:text-5xl">Nos collections</h1>
      <p className="mb-10 max-w-2xl text-lg text-sand-muted">
        Chaque collection réunit des pièces qui partagent une couleur, un atelier et une histoire. Vous préférez parcourir par
        savoir-faire ? Explorez plutôt les{' '}
        <Link to="/materiaux" className="text-gold underline">
          matériaux et techniques
        </Link>
        .
      </p>

      {/* 1 colonne mobile → 2 tablette → 3 ordinateur */}
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <CatalogCard
              to={`/collections/${collection.slug}`}
              image={{ src: collection.image, alt: collection.imageAlt, aspect: [3, 2] }}
              eyebrow="Collection"
              title={collection.name}
              text={collection.tagline}
              count={countByCollection(collection.slug)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
