// src/lib/catalog.js
// « Fausse API » : lit les fichiers JSON locaux (/src/data) et expose des fonctions de requête.
// Les composants n'importent JAMAIS les JSON directement : s'il faut un jour brancher une vraie
// API, seul ce fichier change.
import productsData from '../data/products.json';
import collectionsData from '../data/collections.json';
import materialsData from '../data/materials.json';
import artisansData from '../data/artisans.json';

export const products = productsData;
export const collections = collectionsData;
export const materials = materialsData;
export const artisans = artisansData;

// ---------------------------------------------------------------------------
// Disponibilité : libellé affiché + valeur Schema.org correspondante
// ---------------------------------------------------------------------------
export const AVAILABILITY = {
  InStock: { label: 'En stock', schema: 'https://schema.org/InStock', canBuy: true },
  PreOrder: { label: 'Sur commande', schema: 'https://schema.org/PreOrder', canBuy: true },
  SoldOut: { label: 'Vendu', schema: 'https://schema.org/SoldOut', canBuy: false },
};

// ---------------------------------------------------------------------------
// Lecture simple (synchrone)
// ---------------------------------------------------------------------------
export const getProduct = (id) => products.find((p) => p.id === id);
export const getCollection = (slug) => collections.find((c) => c.slug === slug);
export const getMaterial = (slug) => materials.find((m) => m.slug === slug);
export const getArtisan = (id) => artisans.find((a) => a.id === id);

export const getProductsByCollection = (slug) => products.filter((p) => p.collection === slug);
export const getProductsByMaterial = (slug) => products.filter((p) => p.material === slug);
export const getProductsByArtisan = (id) => products.filter((p) => p.artisan === id);

/** Autres produits de la même collection (suggestions en bas de la page produit). */
export function getRelatedProducts(product, limit = 4) {
  return products.filter((p) => p.id !== product.id && p.collection === product.collection).slice(0, limit);
}

/** Compte les produits par collection ou par matériau (pour les compteurs de la barre latérale). */
export const countByCollection = (slug) => getProductsByCollection(slug).length;
export const countByMaterial = (slug) => getProductsByMaterial(slug).length;

/** Les produits les plus récents (section « Nouveautés » de l'accueil). */
export function getNewestProducts(limit = 4) {
  return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Catégories de la boutique (barre latérale « Catégories » avec compteurs)
// ---------------------------------------------------------------------------
// Chaque catégorie = un identifiant d'URL (?categorie=bijoux), un libellé, un compteur
// et une fonction de filtre. Les catégories viennent du champ « type » des produits ;
// on ajoute deux filtres transversaux : Promotions et Pièces uniques.
const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

export function getCategories() {
  const types = [...new Set(products.map((p) => p.type))];
  const make = (slug, label, test) => ({ slug, label, test, count: products.filter(test).length });
  return [
    make('tout', 'Tous les produits', () => true),
    ...types.map((type) => make(slugify(type), type, (p) => p.type === type)),
    make('promotions', 'Promotions', (p) => Boolean(p.originalPrice)),
    make('pieces-uniques', 'Pièces uniques', (p) => p.unique),
  ];
}

/**
 * Images d'un produit avec un texte alternatif DESCRIPTIF, composé du nom/matière/origine
 * (altBase) + de la prise de vue (view). Ex. :
 * « Vase en verre recyclé soufflé à la main, artisanat tanzanien — gros plan sur les bulles »
 */
export function getProductImages(product) {
  return product.images.map((img) => ({
    src: img.src,
    alt: `${product.altBase} — ${img.view}`,
  }));
}

// ---------------------------------------------------------------------------
// Tri
// ---------------------------------------------------------------------------
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'sale', label: 'Promotions' },
];

/** Retourne une NOUVELLE liste triée (on ne mute jamais le tableau d'origine). */
export function sortProducts(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rating':
      return copy.sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0));
    case 'sale':
      // les produits en promotion d'abord, puis par date
      return copy.sort((a, b) => Number(Boolean(b.originalPrice)) - Number(Boolean(a.originalPrice)) || b.createdAt.localeCompare(a.createdAt));
    case 'newest':
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

// ---------------------------------------------------------------------------
// Recherche « AJAX » simulée
// ---------------------------------------------------------------------------
// On normalise (minuscules, sans accents) pour que « ambre » trouve « Ambré » et « verre » trouve « Vérre ».
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Texte dans lequel on cherche pour un produit : nom, type, description, matériau, collection, artisan. */
function searchableText(product) {
  return normalize(
    [
      product.name,
      product.type,
      product.shortDescription,
      getMaterial(product.material)?.name,
      getCollection(product.collection)?.name,
      getArtisan(product.artisan)?.name,
      product.origin,
    ].join(' '),
  );
}

/** Filtre synchrone (utilisé aussi par la page boutique pour le paramètre ?q=). */
export function filterByQuery(list, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  return list.filter((p) => {
    const text = searchableText(p);
    return terms.every((t) => text.includes(t));
  });
}

/**
 * Recherche asynchrone qui imite un appel réseau (latence ~150 ms).
 * Le composant SearchBox l'appelle dans un useEffect après le « debounce » de la saisie.
 * @returns {Promise<Array>} les 6 premiers produits trouvés
 */
export function searchProducts(query) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(filterByQuery(products, query).slice(0, 6)), 150);
  });
}
