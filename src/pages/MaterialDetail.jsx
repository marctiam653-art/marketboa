// src/pages/MaterialDetail.jsx
// Page d'un matériau ou d'une technique : /materiaux/perles-amethyste, /materiaux/sculpture-sur-bois…
// C'est une « landing page » SEO durable : elle répond à des recherches comme « perles d'améthyste artisanat ».
import { useParams } from 'react-router-dom';
import CatalogLanding from '../components/catalog/CatalogLanding.jsx';
import NotFound from './NotFound.jsx';
import { getMaterial, getProductsByMaterial, materials } from '../lib/catalog.js';

export default function MaterialDetail() {
  const { slug } = useParams();
  const material = getMaterial(slug);

  if (!material) return <NotFound />;

  return (
    <CatalogLanding
      meta={{ title: material.name, description: `${material.summary} ${material.description}`.slice(0, 158), path: `/materiaux/${material.slug}` }}
      breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Matériaux', to: '/materiaux' }, { label: material.name }]}
      eyebrow={material.kind}
      title={material.name}
      lead={material.summary}
      intro={material.description}
      image={{ src: material.image, alt: material.imageAlt, aspect: [4, 3] }}
      extra={
        // <dl> : liste de définitions (terme / valeur) pour l'origine et l'entretien
        <dl className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-surface p-5 text-sm">
          <div>
            <dt className="font-semibold text-gold">Origine</dt>
            <dd className="text-sand-muted">{material.origin}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gold">Entretien</dt>
            <dd className="text-sand-muted">{material.care}</dd>
          </div>
        </dl>
      }
      products={getProductsByMaterial(material.slug)}
      explore={{
        title: 'Explorer les autres matériaux',
        links: materials.filter((m) => m.slug !== material.slug).map((m) => ({ to: `/materiaux/${m.slug}`, label: m.name })),
      }}
    />
  );
}
