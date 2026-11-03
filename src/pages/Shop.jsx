// src/pages/Shop.jsx
// Page « Boutique » (catalogue complet). Elle est construite à partir du gabarit fourni :
//   • titre « Notre collection » centré sous l'en-tête (l'en-tête et le bandeau sont dans <Layout />) ;
//   • barre latérale « Catégories » avec compteurs ;
//   • barre d'outils : nombre de produits, tri, bascule grille / liste ;
//   • cartes produit (composant <ProductCard />).
// Ce qui est ajouté : filtrage et tri réellement fonctionnels, recherche (?q=), et la double entrée du
// catalogue (liens vers les collections ET vers les matériaux dans la barre latérale).
//
// RESPONSIVE :
//   • ORDINATEUR (≥ 1024px) : barre latérale fixe à gauche, grille à droite ;
//   • MOBILE / TABLETTE : la barre latérale devient un TIROIR ouvert par le bouton « Filtres ».
//   Ce changement de STRUCTURE (pas seulement de style) est le seul endroit où l'on utilise le hook
//   useMediaQuery : le tiroir a un comportement différent (focus piégé, bouton d'ouverture, fermeture).
//   Tout le reste de la page est en CSS pur.
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid3X3, List, SlidersHorizontal } from 'lucide-react';
import Drawer from '../components/ui/Drawer.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import useMediaQuery from '../hooks/useMediaQuery.js';
import { SORT_OPTIONS, collections, filterByQuery, getCategories, materials, products, sortProducts } from '../lib/catalog.js';

/**
 * Contenu des filtres : le MÊME composant est affiché dans la barre latérale (ordinateur)
 * ou dans le tiroir (mobile). Il ne connaît pas son conteneur.
 */
function ShopFilters({ categories, activeSlug, onSelect }) {
  return (
    <div className="space-y-8">
      <nav aria-label="Catégories">
        <h2 className="mb-4 font-sans text-lg font-medium">Catégories</h2>
        <ul className="space-y-1">
          {categories.map((category) => {
            const isActive = category.slug === activeSlug;
            return (
              <li key={category.slug}>
                {/* aria-pressed : indique quel filtre est actif (en plus du style doré + gras) */}
                <button
                  type="button"
                  onClick={() => onSelect(category.slug)}
                  aria-pressed={isActive}
                  className={`group flex min-h-[44px] w-full items-center justify-between gap-2 text-left transition-colors hover:text-gold ${
                    isActive ? 'font-semibold text-gold' : 'text-sand'
                  }`}
                >
                  <span className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none">{category.label}</span>
                  {/* Compteur : pastille ronde 32 px, comme dans le gabarit */}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-sand">
                    {category.count}
                    <span className="sr-only"> produit{category.count > 1 ? 's' : ''}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Seconde entrée du catalogue : par collection */}
      <nav aria-label="Par collection">
        <h2 className="mb-2 font-sans text-lg font-medium">Par collection</h2>
        <ul>
          {collections.map((collection) => (
            <li key={collection.slug}>
              <Link to={`/collections/${collection.slug}`} className="inline-flex min-h-[44px] min-w-[44px] items-center text-sand hover:text-gold hover:underline">
                {collection.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Troisième entrée : par matériau / technique */}
      <nav aria-label="Par matériau">
        <h2 className="mb-2 font-sans text-lg font-medium">Par matériau</h2>
        <ul>
          {materials.map((material) => (
            <li key={material.slug}>
              <Link to={`/materiaux/${material.slug}`} className="inline-flex min-h-[44px] min-w-[44px] items-center text-sand hover:text-gold hover:underline">
                {material.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default function Shop() {
  useDocumentMeta({
    title: 'Boutique',
    description:
      'Toute la boutique d’artisanat africain fait main : bijoux, verrerie, mobilier et textiles. Filtrez par catégorie, collection ou matériau.',
    path: '/shop', // canonique : les filtres (?categorie, ?q) ne créent pas de pages dupliquées pour Google
  });

  // La catégorie et la recherche vivent dans l'URL (?categorie=bijoux&q=perle) :
  // les liens sont partageables et le bouton « Retour » du navigateur fonctionne.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get('categorie') ?? 'tout';
  const query = searchParams.get('q') ?? '';

  const [sortBy, setSortBy] = useState('newest');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Structure différente selon l'écran → hook JavaScript (voir l'en-tête du fichier)
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const categories = useMemo(() => getCategories(), []);
  const activeCategory = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  // Filtre par catégorie → filtre par recherche → tri. Aucune mutation : chaque étape crée une nouvelle liste.
  const visibleProducts = useMemo(
    () => sortProducts(filterByQuery(products.filter(activeCategory.test), query), sortBy),
    [activeCategory, query, sortBy],
  );

  function selectCategory(slug) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous); // copie : on ne modifie pas l'objet existant
      if (slug === 'tout') next.delete('categorie');
      else next.set('categorie', slug);
      return next;
    });
    setFiltersOpen(false);
  }

  function clearSearch() {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete('q');
      return next;
    });
  }

  const filters = <ShopFilters categories={categories} activeSlug={activeCategory.slug} onSelect={selectCategory} />;

  return (
    <>
      {/* Titre de la page (unique H1), centré comme dans le gabarit */}
      <section className="py-12 text-center lg:py-20">
        <div className="container-page">
          <h1 className="mb-3 text-4xl md:text-5xl lg:text-6xl">Notre collection</h1>
          <p className="text-lg text-sand-muted">Découvrez l’artisanat africain authentique, pièce par pièce</p>
        </div>
      </section>

      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Barre latérale : présente seulement sur ordinateur ; sur mobile, le même contenu est dans le tiroir */}
          {isDesktop && <aside aria-label="Filtres" className="w-64 shrink-0">{filters}</aside>}

          <section aria-labelledby="results-title" className="min-w-0 flex-1">
            <h2 id="results-title" className="sr-only">
              Produits
            </h2>

            {/* Barre d'outils : empilée sur mobile (flex-col), alignée en ligne dès 640px (sm:) */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* role="status" : le nombre de résultats est annoncé quand on filtre ou trie */}
              <p role="status" className="text-sm text-sand-muted">
                {visibleProducts.length} produit{visibleProducts.length > 1 ? 's' : ''} affiché{visibleProducts.length > 1 ? 's' : ''}
                {activeCategory.slug !== 'tout' && <> · {activeCategory.label}</>}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {!isDesktop && (
                  <button type="button" onClick={() => setFiltersOpen(true)} aria-haspopup="dialog" className="btn btn-outline">
                    <SlidersHorizontal size={16} aria-hidden="true" />
                    Filtres
                  </button>
                )}

                <div className="flex items-center gap-2 text-sm">
                  {/* Label VISIBLE associé au select (htmlFor/id) */}
                  <label htmlFor="sort-select" className="text-sand-muted">
                    Trier par :
                  </label>
                  <select id="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="field w-auto">
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bascule grille / liste : deux boutons à bascule (aria-pressed), 44×44 px chacun */}
                <div role="group" aria-label="Mode d’affichage" className="flex items-center overflow-hidden rounded-lg border border-white/30">
                  <button
                    type="button"
                    onClick={() => setView('grid')}
                    aria-pressed={view === 'grid'}
                    aria-label="Affichage en grille"
                    className={`flex h-11 w-11 items-center justify-center ${view === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  >
                    <Grid3X3 size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    aria-pressed={view === 'list'}
                    aria-label="Affichage en liste"
                    className={`flex h-11 w-11 items-center justify-center ${view === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                  >
                    <List size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {query && (
              <p className="mb-6 text-sm">
                Résultats pour « <strong>{query}</strong> » ·{' '}
                <button type="button" onClick={clearSearch} className="min-h-[44px] text-gold underline">
                  Effacer la recherche
                </button>
              </p>
            )}

            {visibleProducts.length > 0 ? (
              <ProductGrid products={visibleProducts} columns="sidebar" view={view} />
            ) : (
              // État vide : on propose toujours une sortie
              <div className="rounded-2xl border border-white/10 bg-surface p-8 text-center">
                <p className="mb-4 text-sand-muted">Aucun produit ne correspond à votre recherche.</p>
                <Link to="/shop" className="btn btn-primary">
                  Voir tous les produits
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Tiroir des filtres : rendu uniquement hors ordinateur */}
      {!isDesktop && (
        <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtrer" side="left">
          <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{filters}</div>
        </Drawer>
      )}
    </>
  );
}
