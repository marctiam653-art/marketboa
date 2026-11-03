// src/pages/ProductDetail.jsx
// Page produit : /product/:id (ex. /product/vase-maree — une URL propre, lisible, sans « ?id=123 »).
//
// Particularité métier : dans l'artisanat, chaque pièce est unique, l'achat est émotionnel et l'HISTOIRE
// compte plus que la fiche technique. La page doit « remplacer la visite de l'atelier ». L'ordre est donc :
//   1. galerie de photos multi-angles + prix + boutons d'achat (décision rapide) ;
//   2. l'histoire de CETTE pièce ;
//   3. la rencontre avec l'artisan (nom, région, citation) ;
//   4. le matériau / la technique, puis les caractéristiques techniques en dernier.
//
// MISE EN PAGE : galerie en haut sur mobile ; galerie à gauche et informations à droite dès 1024px (lg:).
import { Link, useParams } from 'react-router-dom';
import { MessageCircleQuestion, ShoppingCart, Star, Zap } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import JsonLd from '../components/ui/JsonLd.jsx';
import ResponsiveImage from '../components/ui/ResponsiveImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import FavoriteButton from '../components/product/FavoriteButton.jsx';
import PriceTag from '../components/product/PriceTag.jsx';
import ProductGallery from '../components/product/ProductGallery.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import NotFound from './NotFound.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { SITE } from '../config/site.js';
import { useCart } from '../context/CartContext.jsx';
import { AVAILABILITY, getArtisan, getCollection, getMaterial, getProduct, getRelatedProducts } from '../lib/catalog.js';
import { discountPercent } from '../lib/format.js';
import { buildWhatsAppUrl, productOrderMessage, productQuestionMessage, similarPieceMessage } from '../lib/whatsapp.js';

/** Aiguillage : produit inconnu → page 404. Les hooks vivent dans <ProductContent /> (règle des hooks de React). */
export default function ProductDetail() {
  const { id } = useParams();
  const product = getProduct(id);
  return product ? <ProductContent product={product} /> : <NotFound />;
}

function ProductContent({ product }) {
  const { addItem, inCart } = useCart();
  const artisan = getArtisan(product.artisan);
  const material = getMaterial(product.material);
  const collection = getCollection(product.collection);
  const availability = AVAILABILITY[product.availability];
  const percent = discountPercent(product.price, product.originalPrice);
  const alreadyInCart = inCart(product.id) && product.unique;
  const url = `${SITE.url}/product/${product.id}`;

  // SEO : title « [Nom du produit] – Artisanat africain fait main | [Marque] » (le suffixe est ajouté par le hook)
  useDocumentMeta({
    title: product.name,
    description: `${product.shortDescription} Fait main par ${artisan.name} (${product.origin}).`,
    path: `/product/${product.id}`,
    image: `${product.images[0].src}-1200.webp`,
  });

  // Données structurées Schema.org « Product » : prix, disponibilité, note — affichables dans Google.
  // ⚠️ La note et le nombre d'avis du JSON sont des données de DÉMONSTRATION : à remplacer par de vrais avis clients.
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `${product.shortDescription} ${product.story}`,
    sku: product.id,
    image: product.images.map((img) => `${SITE.url}${img.src}-1200.webp`),
    material: material?.name,
    brand: { '@type': 'Brand', name: SITE.name },
    creator: { '@type': 'Person', name: artisan.name },
    // Une pièce sans avis (nouvelle, ou sur commande) n'a pas de note : on n'invente jamais une note
    ...(product.rating && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating.value, reviewCount: product.rating.count },
    }),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: SITE.currency,
      price: product.price,
      availability: availability.schema,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  };

  // Fil d'Ariane structuré (BreadcrumbList) : Google peut l'afficher à la place de l'URL dans les résultats
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Boutique', item: `${SITE.url}/shop` },
      { '@type': 'ListItem', position: 3, name: product.name, item: url },
    ],
  };

  const related = getRelatedProducts(product);

  return (
    <div className="container-page py-8 md:py-12">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Boutique', to: '/shop' }, { label: product.name }]} />

      {/* ------------------------------------------------------------------ */}
      {/* Galerie + informations d'achat                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {product.type}
            {collection && <> · Collection {collection.name}</>}
          </p>
          <h1 className="mb-3 text-3xl md:text-4xl">{product.name}</h1>

          {/* Note : les étoiles sont décoratives ; le texte « 4,9/5 · 14 avis » porte l'information */}
          {product.rating ? (
            <p className="mb-4 flex items-center gap-2 text-sm text-sand-muted">
              <span aria-hidden="true" className="flex text-gold">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={16} className={i < Math.round(product.rating.value) ? 'fill-gold' : ''} />
                ))}
              </span>
              {product.rating.value.toString().replace('.', ',')}/5 · {product.rating.count} avis
            </p>
          ) : (
            <p className="mb-4 text-sm text-sand-muted">Pas encore d’avis pour cette pièce.</p>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <PriceTag price={product.price} originalPrice={product.originalPrice} size="lg" />
            {percent > 0 && availability.canBuy && (
              <span className="rounded-full bg-sale px-3 py-1 text-sm font-semibold text-white">Promo −{percent} %</span>
            )}
          </div>

          <p className="mb-6 text-lg text-sand">{product.shortDescription}</p>

          {/* Disponibilité : texte explicite (jamais seulement une couleur) */}
          <div className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
            <p className="font-semibold text-gold">
              {availability.label}
              {product.unique && availability.canBuy && ' · Pièce unique'}
            </p>
            <p className="text-sand-muted">
              {product.unique && availability.canBuy && 'Il n’en existe qu’un seul exemplaire : une fois vendue, elle ne sera pas refaite à l’identique. '}
              {availability.canBuy ? product.leadTime : 'Cette pièce a trouvé son foyer. Écrivez-nous : l’atelier peut proposer une pièce proche.'}
            </p>
          </div>

          {/* Boutons d'achat : « Achat immédiat » est crucial pour les pièces uniques (risque qu'elles partent) */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {availability.canBuy ? (
              <>
                <a
                  href={buildWhatsAppUrl(productOrderMessage(product))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex-1 py-3 text-base"
                >
                  <Zap size={18} aria-hidden="true" />
                  Achat immédiat
                  <span className="sr-only"> via WhatsApp (s'ouvre dans un nouvel onglet)</span>
                </a>
                <button
                  type="button"
                  onClick={() => addItem(product)}
                  disabled={alreadyInCart}
                  className="btn btn-outline flex-1 py-3 text-base"
                >
                  <ShoppingCart size={18} aria-hidden="true" />
                  {alreadyInCart ? 'Dans le panier' : 'Ajouter au panier'}
                </button>
              </>
            ) : (
              <a
                href={buildWhatsAppUrl(similarPieceMessage(product))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1 py-3 text-base"
              >
                Demander une pièce similaire
                <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
              </a>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <FavoriteButton product={product} variant="inline" />
            <a
              href={buildWhatsAppUrl(productQuestionMessage(product))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <MessageCircleQuestion size={18} aria-hidden="true" />
              Poser une question
              <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
            </a>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* L'histoire de la pièce + l'artisan                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-14">
        <section aria-labelledby="story-title">
          <h2 id="story-title" className="mb-4 text-2xl md:text-3xl">
            L’histoire de cette pièce
          </h2>
          <p className="text-lg leading-relaxed text-sand">{product.story}</p>
        </section>

        <section aria-labelledby="artisan-title" className="rounded-2xl border border-white/10 bg-surface p-5 md:p-6">
          <h2 id="artisan-title" className="mb-4 text-2xl md:text-3xl">
            Rencontrez l’artisan
          </h2>
          <div className="flex gap-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              <ResponsiveImage src={artisan.portrait} alt={artisan.portraitAlt} sizes="96px" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl">{artisan.name}</h3>
              <p className="text-sm text-sand-muted">
                {artisan.craft} · {artisan.region}, {artisan.country}
              </p>
              <p className="mt-1 text-sm text-sand-muted">{artisan.yearsOfPractice} ans de pratique</p>
            </div>
          </div>
          <blockquote className="my-4 border-l-4 border-gold pl-4 font-serif italic text-sand">« {artisan.quote} »</blockquote>
          <Link to={`/about#${artisan.id}`} className="inline-flex min-h-[44px] items-center font-semibold text-gold hover:underline">
            Lire l’histoire de {artisan.name.split(' ')[0]}
          </Link>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Matériau + caractéristiques (placés après l'histoire, volontairement) */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
        {material && (
          <section aria-labelledby="material-title">
            <h2 id="material-title" className="mb-4 text-2xl md:text-3xl">
              Matériau et technique
            </h2>
            <p className="mb-1 font-semibold text-gold">{material.name}</p>
            <p className="mb-3 text-sand-muted">{material.description}</p>
            <Link to={`/materiaux/${material.slug}`} className="inline-flex min-h-[44px] items-center font-semibold text-gold hover:underline">
              Voir toutes les pièces en {material.name.toLowerCase()}
            </Link>
          </section>
        )}

        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="mb-4 text-2xl md:text-3xl">
            Caractéristiques
          </h2>
          {/* Liste de définitions : le nom de chaque caractéristique est lié à sa valeur */}
          <dl className="divide-y divide-white/10 text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-sand-muted">Origine</dt>
              <dd className="text-right">{product.origin}</dd>
            </div>
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-4 py-3">
                <dt className="text-sand-muted">{spec.label}</dt>
                <dd className="text-right">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20">
          <SectionHeading id="related-title" title="Dans la même collection" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
