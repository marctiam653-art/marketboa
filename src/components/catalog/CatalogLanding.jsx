// src/components/catalog/CatalogLanding.jsx
// Page « d'atterrissage » d'une collection OU d'un matériau / technique.
// Ces pages sont indexables : chacune a son URL propre (/collections/aura, /materiaux/perles-amethyste),
// son <title>, sa meta description et son contenu textuel → elles deviennent des pages d'entrée SEO durables.
//
// Un seul composant sert les deux types de page : même mise en page, contenus différents.
import { Link } from 'react-router-dom';
import Breadcrumbs from '../ui/Breadcrumbs.jsx';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';
import ProductGrid from '../product/ProductGrid.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import useDocumentMeta from '../../hooks/useDocumentMeta.js';

/**
 * @param {Object} meta         { title, description, path } pour le SEO
 * @param {Array}  breadcrumbs  éléments du fil d'Ariane
 * @param {string} eyebrow      surtitre (« Collection », « Matériau »…)
 * @param {string} title        titre H1
 * @param {string} lead         phrase d'accroche
 * @param {string} intro        paragraphe de présentation
 * @param {Object} image        { src, alt, aspect }
 * @param {Node}   [extra]      bloc supplémentaire (origine, conseils d'entretien…)
 * @param {Array}  products     produits à lister
 * @param {Object} explore      { title, links: [{ to, label }] } liens vers les autres pages du même type
 */
export default function CatalogLanding({ meta, breadcrumbs, eyebrow, title, lead, intro, image, extra, products, explore }) {
  // L'image de la page sert aussi d'aperçu lors d'un partage (Open Graph)
  useDocumentMeta({ ...meta, image: `${image.src}-1200.webp` });

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Présentation : image sous le texte sur mobile, à droite dès la tablette (md:) */}
      <section aria-labelledby="landing-title" className="grid items-center gap-8 md:grid-cols-2 lg:gap-14">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          {/* Un SEUL h1 par page */}
          <h1 id="landing-title" className="mb-4 text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mb-4 font-serif text-xl text-sand">{lead}</p>
          <p className="text-sand-muted">{intro}</p>
          {extra}
        </div>
        <div className="overflow-hidden rounded-2xl bg-surface-2">
          {/* Première image visible de la page : chargée en priorité (pas de lazy) pour le LCP */}
          <ResponsiveImage
            src={image.src}
            alt={image.alt}
            aspect={image.aspect}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="landing-products" className="mt-16">
        <SectionHeading id="landing-products" title={`Les pièces (${products.length})`} />
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <p className="text-sand-muted">Aucune pièce disponible pour le moment.</p>
        )}
      </section>

      {explore && (
        <nav aria-label={explore.title} className="mt-16 border-t border-white/10 pt-8">
          <h2 className="mb-4 text-2xl">{explore.title}</h2>
          <ul className="flex flex-wrap gap-3">
            {explore.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="btn btn-outline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
