// src/pages/Home.jsx
// Page d'accueil : Hero immersif → réassurance → collections phares (carrousel) → d'où viennent les
// matériaux → artisan à la une → nouveautés → comment commander.
//
// Parcours utilisateur visé : Accueil → Collection / Boutique → Page produit → Panier / WhatsApp.
// Un seul <h1> (le hero) ; chaque section a son <h2> ; les sous-éléments sont en <h3>.
import { Link } from 'react-router-dom';
import { BadgeCheck, MessageCircle, Truck } from 'lucide-react';
import Carousel from '../components/ui/Carousel.jsx';
import ResponsiveImage from '../components/ui/ResponsiveImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import CatalogCard from '../components/catalog/CatalogCard.jsx';
import ProductGrid from '../components/product/ProductGrid.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { SITE } from '../config/site.js';
import { collections, materials, getArtisan, getNewestProducts, countByMaterial } from '../lib/catalog.js';

const HERO_WIDTHS = [800, 1200, 1600];

// Les 3 engagements affichés sous le hero (réassurance avant l'achat)
const PROMISES = [
  { icon: BadgeCheck, title: 'Chaque pièce est signée', text: 'Le nom et l’histoire de l’artisan accompagnent chaque produit.' },
  { icon: MessageCircle, title: 'Commande par WhatsApp', text: 'Vous échangez directement avec l’atelier, sans paiement en ligne.' },
  { icon: Truck, title: 'Livraison soignée', text: 'Emballage protecteur et suivi, offerts dès un certain montant.' },
];

const STEPS = [
  { title: 'Choisissez une pièce', text: 'Parcourez les collections ou les matériaux, et lisez l’histoire de ce qui vous touche.' },
  { title: 'Écrivez à l’atelier', text: 'Un clic sur « Achat immédiat » ouvre WhatsApp avec le nom du produit déjà écrit.' },
  { title: 'Recevez votre pièce', text: 'Nous confirmons la disponibilité, le paiement et la livraison avec vous.' },
];

export default function Home() {
  useDocumentMeta({
    title: 'Accueil',
    description:
      'Bijoux en perles d’améthyste, verre recyclé soufflé, sculpture sur bois et tissages : des pièces uniques d’artisanat africain, avec le nom et l’histoire de chaque artisan.',
    path: '/',
  });

  const featuredCollections = collections.filter((c) => c.featured);
  const spotlight = getArtisan('esther-mbarga'); // « artisan à la une »

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* HERO immersif                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
        {/* Image de fond : c'est l'élément le plus grand de l'écran → c'est lui qui détermine le LCP.
            On la charge donc en priorité (priority = pas de lazy-loading + fetchpriority="high"). */}
        <ResponsiveImage
          src="/images/hero/hero"
          widths={HERO_WIDTHS}
          aspect={[3, 2]}
          sizes="100vw"
          priority
          alt="Mains d'une artisane enfilant des perles d'améthyste sur un fil doré dans un atelier lumineux (image d'illustration)"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Dégradé sombre : garantit un texte lisible (contraste ≥ 4,5:1) quelle que soit la photo */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />

        {/* Hauteur du hero : croissante mobile → tablette → ordinateur */}
        <div className="container-page flex min-h-[30rem] flex-col justify-end py-12 md:min-h-[36rem] lg:min-h-[42rem] lg:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">Artisanat africain fait main</p>
          <h1 id="hero-title" className="mb-4 max-w-3xl text-4xl leading-tight md:text-5xl lg:text-6xl">
            Des pièces uniques, signées par celles et ceux qui les fabriquent
          </h1>
          <p className="mb-8 max-w-xl text-lg text-sand">
            Perles d’améthyste, verre recyclé soufflé, bois sculpté, tissages : chaque objet porte l’histoire de son atelier.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className="btn btn-primary px-8 py-3 text-base">
              Découvrir la boutique
            </Link>
            <Link to="/about" className="btn btn-outline bg-ink/40 px-8 py-3 text-base">
              Rencontrer les artisans
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Réassurance                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section aria-label="Nos engagements" className="border-b border-white/10 bg-surface">
        <ul className="container-page grid gap-6 py-8 md:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <Icon aria-hidden="true" className="mt-1 shrink-0 text-gold" />
              <div>
                <h2 className="font-sans text-base font-semibold">{title}</h2>
                <p className="text-sm text-sand-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Collections phares : carrousel accessible avec bouton Pause         */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="collections-title" className="container-page mt-16 md:mt-24">
        <SectionHeading
          id="collections-title"
          eyebrow="Entrée par collection"
          title="Nos collections phares"
          actionTo="/collections"
          actionLabel="Toutes les collections"
        />
        {/* autoPlay : le défilement automatique est activé, MAIS le bouton Pause est visible, l'auto-défilement
            s'arrête au survol et au focus clavier, et il est désactivé si l'utilisateur préfère « réduire les animations ». */}
        <Carousel
          label="Collections phares"
          items={featuredCollections}
          getKey={(collection) => collection.slug}
          autoPlay
          interval={8000}
          renderItem={(collection) => (
            <article className="grid bg-surface md:grid-cols-2">
              <div className="relative aspect-[3/2] bg-surface-2 md:aspect-auto md:min-h-[24rem]">
                <ResponsiveImage
                  src={collection.image}
                  alt={collection.imageAlt}
                  aspect={[3, 2]}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-10">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Collection</p>
                <h3 className="mb-2 text-3xl md:text-4xl">{collection.name}</h3>
                <p className="mb-3 font-serif text-lg text-sand">{collection.tagline}</p>
                <p className="mb-6 text-sand-muted">{collection.description}</p>
                <div>
                  <Link to={`/collections/${collection.slug}`} className="btn btn-primary">
                    Découvrir la collection
                    <span className="sr-only"> {collection.name}</span>
                  </Link>
                </div>
              </div>
            </article>
          )}
        />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* D'où viennent les matériaux (2ᵉ entrée du catalogue)                */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="materials-title" className="container-page mt-16 md:mt-24">
        <SectionHeading
          id="materials-title"
          eyebrow="Entrée par matériau et technique"
          title="D’où viennent nos matériaux, qui les travaille"
          actionTo="/materiaux"
          actionLabel="Tous les matériaux"
        />
        {/* 2 colonnes mobile → 3 tablette → 5 ordinateur */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {materials.map((material) => (
            <li key={material.slug}>
              <CatalogCard
                to={`/materiaux/${material.slug}`}
                image={{ src: material.image, alt: material.imageAlt, aspect: [4, 3] }}
                eyebrow={material.kind}
                title={material.name}
                text={material.origin}
                count={countByMaterial(material.slug)}
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Artisan à la une : l'histoire avant le produit                      */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="artisan-title" className="mt-16 bg-earth-dark py-16 md:mt-24 md:py-24">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-surface-2 lg:mx-0">
            <ResponsiveImage
              src={spotlight.portrait}
              alt={spotlight.portraitAlt}
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Artisane à la une</p>
            <h2 id="artisan-title" className="mb-2 text-3xl md:text-4xl">
              {spotlight.name}
            </h2>
            <p className="mb-6 text-sand-muted">
              {spotlight.craft} · {spotlight.region}, {spotlight.country}
            </p>
            {/* <blockquote> : citation de l'artisane */}
            <blockquote className="mb-6 border-l-4 border-gold pl-4 font-serif text-xl italic text-sand">
              « {spotlight.quote} »
            </blockquote>
            <p className="mb-8 text-sand-muted">{spotlight.story[0]}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={`/about#${spotlight.id}`} className="btn btn-primary">
                Lire son histoire
              </Link>
              <Link to="/collections/aura" className="btn btn-outline">
                Voir ses créations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Nouveautés                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="new-title" className="container-page mt-16 md:mt-24">
        <SectionHeading id="new-title" eyebrow="Fraîchement arrivées" title="Nouveautés" actionTo="/shop" actionLabel="Voir toute la boutique" />
        <ProductGrid products={getNewestProducts(4)} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Comment commander : liste ordonnée (l'ordre des étapes compte)      */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="steps-title" className="container-page mt-16 md:mt-24">
        <SectionHeading id="steps-title" eyebrow="Simple et humain" title="Comment commander ?" />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-white/10 bg-surface p-6">
              <span aria-hidden="true" className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold font-serif text-lg font-bold text-ink">
                {i + 1}
              </span>
              <h3 className="mb-2 text-xl">{step.title}</h3>
              <p className="text-sm text-sand-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-sand-muted">
          Code de bienvenue : <strong className="text-gold">{SITE.promo.code}</strong> pour −{SITE.promo.percent} % sur votre première commande.
        </p>
      </section>
    </>
  );
}
