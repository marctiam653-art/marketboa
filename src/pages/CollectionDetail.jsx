// src/pages/CollectionDetail.jsx
// Produits d'une collection : /collections/aura, /collections/oceane, /collections/terre.
// Le contenu est rendu par <CatalogLanding />, partagé avec les pages de matériaux.
import { useParams } from 'react-router-dom';
import CatalogLanding from '../components/catalog/CatalogLanding.jsx';
import NotFound from './NotFound.jsx';
import { collections, getCollection, getProductsByCollection } from '../lib/catalog.js';

export default function CollectionDetail() {
  const { slug } = useParams();
  const collection = getCollection(slug);

  // URL inconnue → page 404 (et non une page blanche)
  if (!collection) return <NotFound />;

  return (
    <CatalogLanding
      meta={{ title: `Collection ${collection.name}`, description: collection.description, path: `/collections/${collection.slug}` }}
      breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Collections', to: '/collections' }, { label: collection.name }]}
      eyebrow="Collection"
      title={collection.name}
      lead={collection.tagline}
      intro={collection.intro}
      image={{ src: collection.image, alt: collection.imageAlt, aspect: [3, 2] }}
      products={getProductsByCollection(collection.slug)}
      explore={{
        title: 'Explorer les autres collections',
        links: collections.filter((c) => c.slug !== collection.slug).map((c) => ({ to: `/collections/${c.slug}`, label: c.name })),
      }}
    />
  );
}
