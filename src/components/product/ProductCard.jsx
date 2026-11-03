// src/components/product/ProductCard.jsx
// Carte produit réutilisable (grille de la boutique, accueil, collections, favoris, suggestions).
// Elle reprend la structure du gabarit « Shop » fourni : badge de promo rouge, catégorie, nom,
// prix barré, boutons AJOUTER + ACHAT IMMÉDIAT, en adaptant :
//   • les textes en français ;
//   • les boutons : « AJOUTER » alimente le panier ; « ACHAT IMMÉDIAT » ouvre WhatsApp avec le nom du produit ;
//   • l'accessibilité : titre cliquable, images avec alt descriptif, contrastes ≥ 4,5:1.
//
// RESPONSIVE (mobile-first, CSS pur) :
//   • mobile : deux colonnes (c'est la grille parente qui décide) → les boutons s'empilent (flex-col) ;
//   • ≥ 640px (sm:) : les boutons passent côte à côte et les marges internes augmentent.
import { Link } from 'react-router-dom';
import { ShoppingCart, Zap } from 'lucide-react';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';
import PriceTag from './PriceTag.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { AVAILABILITY, getProductImages } from '../../lib/catalog.js';
import { discountPercent } from '../../lib/format.js';
import { buildWhatsAppUrl, productOrderMessage, similarPieceMessage } from '../../lib/whatsapp.js';

/**
 * @param {Object}          product
 * @param {'grid'|'list'}   [view]  'list' = carte horizontale (bascule « liste » de la boutique)
 */
export default function ProductCard({ product, view = 'grid' }) {
  const { addItem, inCart } = useCart();
  const isList = view === 'list';
  const availability = AVAILABILITY[product.availability];
  const percent = discountPercent(product.price, product.originalPrice);
  const alreadyInCart = inCart(product.id) && product.unique; // une pièce unique ne s'ajoute qu'une fois
  const [cover] = getProductImages(product); // première image = vue d'ensemble
  const productPath = `/product/${product.id}`;

  return (
    <article
      className={`group relative flex h-full overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors duration-300 focus-within:border-gold/60 hover:border-gold/40 ${
        isList ? 'flex-row' : 'flex-col'
      }`}
    >
      {/* ---------- Image ---------- */}
      <div className={`relative aspect-[4/5] shrink-0 overflow-hidden bg-surface-2 ${isList ? 'w-32 sm:w-56' : 'w-full'}`}>
        {/* Badges : promotion (rouge, texte blanc ≥ 4,5:1) ou statut « Vendu » */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1.5">
          {percent > 0 && availability.canBuy && (
            <span className="rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white">Promo −{percent} %</span>
          )}
          {!availability.canBuy && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">{availability.label}</span>
          )}
          {product.availability === 'PreOrder' && (
            <span className="rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">{availability.label}</span>
          )}
        </div>

        <FavoriteButton product={product} />

        {/* Le lien de l'image est masqué aux technologies d'assistance et au clavier : le titre (ci-dessous)
            mène à la même page. Évite un doublon de lien pour chaque carte. */}
        <Link to={productPath} tabIndex={-1} aria-hidden="true" className="block h-full">
          <ResponsiveImage
            src={product.images[0].src}
            alt={cover.alt}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
            className={`h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none ${
              availability.canBuy ? 'group-hover:scale-105' : 'opacity-70 grayscale'
            }`}
          />
        </Link>
      </div>

      {/* ---------- Informations ---------- */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
        <p className="mb-1 text-[11px] uppercase tracking-widest text-sand-muted">
          {product.type}
          {product.unique && <span className="ml-2 text-gold">· Pièce unique</span>}
        </p>

        <h3 className="mb-2 text-base leading-snug sm:text-lg">
          {/* Lien « étiré » : after:absolute after:inset-0 rend toute la carte cliquable sans imbriquer de liens */}
          <Link to={productPath} className="transition-colors after:absolute after:inset-0 after:z-[1] hover:text-gold">
            {product.name}
          </Link>
        </h3>

        {/* En vue liste, on ajoute la description courte (plus de place disponible) */}
        {isList && <p className="mb-3 hidden text-sm text-sand-muted sm:block">{product.shortDescription}</p>}

        <div className="mb-4 mt-auto">
          <PriceTag price={product.price} originalPrice={product.originalPrice} />
        </div>

        
        {/* Boutons empilés dans la grille (cartes étroites : 2 à 4 colonnes) ; côte à côte en vue liste (carte large) */}
        <div className={`relative z-[2] flex flex-col gap-2 ${isList ? 'sm:flex-row sm:gap-3' : ''}`}>
          {availability.canBuy ? (
            <>
              <button
                type="button"
                onClick={() => addItem(product)}
                disabled={alreadyInCart}
                aria-label={alreadyInCart ? `${product.name} est déjà dans le panier` : `Ajouter au panier : ${product.name}`}
                className="btn btn-outline flex-1 px-3 text-sm"
              >
                <ShoppingCart size={16} aria-hidden="true" />
                {alreadyInCart ? 'Dans le panier' : 'Ajouter'}
              </button>
              {/* « Achat immédiat » : lien WhatsApp avec le nom du produit pré-rempli */}
              <a
                href={buildWhatsAppUrl(productOrderMessage(product))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Achat immédiat de ${product.name} via WhatsApp (s'ouvre dans un nouvel onglet)`}
                className="btn btn-primary flex-1 px-3 text-sm"
              >
                <Zap size={16} aria-hidden="true" />
                Achat immédiat
              </a>
            </>
          ) : (
            <a
              href={buildWhatsAppUrl(similarPieceMessage(product))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex-1 px-3 text-sm"
            >
              Demander une pièce similaire
              <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
