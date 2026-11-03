// src/pages/Materials.jsx
// Liste des matériaux et techniques (2ᵉ entrée du catalogue : « par savoir-faire »).
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import CatalogCard from '../components/catalog/CatalogCard.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { countByMaterial, materials } from '../lib/catalog.js';

export default function Materials() {
  useDocumentMeta({
    title: 'Matériaux et techniques',
    description:
      'Perles d’améthyste, tissage de perles, verre recyclé soufflé, sculpture sur bois, tissage en bandes : découvrez l’origine des matériaux et les gestes des artisans.',
    path: '/materiaux',
  });

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Matériaux' }]} />

      <h1 className="mb-3 text-4xl md:text-5xl">Matériaux et techniques</h1>
      <p className="mb-10 max-w-2xl text-lg text-sand-muted">
        Comprendre d’où vient une matière et comment elle est travaillée, c’est mesurer la valeur d’une pièce. Vous préférez une
        ambiance ? Parcourez plutôt les{' '}
        <Link to="/collections" className="text-gold underline">
          collections
        </Link>
        .
      </p>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((material) => (
          <li key={material.slug}>
            <CatalogCard
              to={`/materiaux/${material.slug}`}
              image={{ src: material.image, alt: material.imageAlt, aspect: [4, 3] }}
              eyebrow={material.kind}
              title={material.name}
              text={material.summary}
              count={countByMaterial(material.slug)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
