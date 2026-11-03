// src/pages/About.jsx
// Histoire de la marque et des artisans. Chaque artisan a une ancre (id) : les liens « Lire son histoire »
// des pages produit pointent directement vers sa section (/about#esther-mbarga).
//
// Sémantique : un H1, puis des H2 par grande section, puis un H2 par artisan (<article> + titre).
import { Link } from 'react-router-dom';
import { Handshake, Leaf, MessageCircle, Recycle } from 'lucide-react';
import ResponsiveImage from '../components/ui/ResponsiveImage.jsx';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { SITE } from '../config/site.js';
import { artisans, getProductsByArtisan } from '../lib/catalog.js';
import { buildWhatsAppUrl } from '../lib/whatsapp.js';

const VALUES = [
  { icon: Handshake, title: 'Un prix juste', text: 'Les ateliers fixent eux-mêmes leurs prix. Nous ne négocions jamais à la baisse.' },
  { icon: Recycle, title: 'Des matières responsables', text: 'Verre récupéré, bois d’arbres tombés, perles dont l’origine est connue.' },
  { icon: Leaf, title: 'Des pièces faites pour durer', text: 'Chaque objet est conçu pour se patiner, se réparer et se transmettre.' },
];

export default function About() {
  useDocumentMeta({
    title: 'Notre histoire et nos artisans',
    description:
      'Rencontrez Esther, Juma et Kwame : trois artisans du Cameroun, de Tanzanie et du Ghana, et découvrez comment naissent les pièces de Mboa Atelier.',
    path: '/about',
  });

  return (
    <>
      {/* Introduction */}
      <section aria-labelledby="about-title" className="container-page py-12 md:py-20">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">À propos</p>
        <h1 id="about-title" className="mb-6 max-w-3xl text-4xl leading-tight md:text-5xl lg:text-6xl">
          Chaque objet commence par une main, une matière, un lieu
        </h1>
        <div className="grid gap-6 text-lg text-sand-muted md:grid-cols-2 md:gap-12">
          <p>
            {SITE.name} est née d’un constat simple : les plus belles pièces d’artisanat africain arrivent trop souvent sans
            visage et sans histoire. Derrière chaque bracelet, chaque vase, chaque tabouret, il y a une personne, un village et
            des heures de patience.
          </p>
          <p>
            Notre rôle est de relier ces ateliers à celles et ceux qui apprécieront leur travail. Nous photographions chaque
            pièce sous plusieurs angles, nous racontons son origine, et nous vous mettons en contact direct avec l’atelier
            pour commander.
          </p>
        </div>
      </section>

      {/* Valeurs */}
      <section aria-labelledby="values-title" className="bg-surface py-16">
        <div className="container-page">
          <SectionHeading id="values-title" eyebrow="Nos engagements" title="Ce en quoi nous croyons" />
          <ul className="grid gap-6 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-white/10 bg-ink p-6">
                <Icon aria-hidden="true" className="mb-4 text-gold" />
                <h3 className="mb-2 text-xl">{title}</h3>
                <p className="text-sm text-sand-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Les artisans : une section par personne, avec son ancre */}
      <section aria-labelledby="artisans-title" className="container-page mt-16 md:mt-24">
        <SectionHeading id="artisans-title" eyebrow="Les mains derrière les pièces" title="Nos artisans" />

        <div className="space-y-20">
          {artisans.map((artisan, index) => {
            const works = getProductsByArtisan(artisan.id);
            // Sur ordinateur, on alterne la position du portrait (gauche / droite) pour rythmer la page
            const reversed = index % 2 === 1;
            return (
              // scroll-mt-28 : décalage au défilement pour que l'en-tête collant ne masque pas le titre après un clic sur une ancre
              <article key={artisan.id} id={artisan.id} className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-2 lg:gap-16">
                <div className={`mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-surface-2 lg:mx-0 ${reversed ? 'lg:order-2' : ''}`}>
                  <ResponsiveImage
                    src={artisan.portrait}
                    alt={artisan.portraitAlt}
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="mb-1 text-3xl md:text-4xl">{artisan.name}</h3>
                  <p className="mb-6 text-sand-muted">
                    {artisan.craft} · {artisan.region}, {artisan.country} · {artisan.yearsOfPractice} ans de pratique
                  </p>
                  <blockquote className="mb-6 border-l-4 border-gold pl-4 font-serif text-xl italic text-sand">« {artisan.quote} »</blockquote>
                  <div className="space-y-4 text-sand-muted">
                    {artisan.story.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                  <h4 className="mb-1 mt-6 font-sans text-sm font-semibold uppercase tracking-widest text-gold">
                    Ses créations ({works.length})
                  </h4>
                  {/* Liste de liens (et non phrase avec liens en ligne) : chaque lien garde une zone tactile de 44 px */}
                  <ul className="flex flex-wrap gap-x-5">
                    {works.map((work) => (
                      <li key={work.id}>
                        <Link to={`/product/${work.id}`} className="inline-flex min-h-[44px] items-center text-sm text-sand underline hover:text-gold">
                          {work.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section aria-labelledby="contact-title" className="container-page mt-24">
        <div className="rounded-2xl bg-earth px-6 py-12 text-center md:px-12">
          <h2 id="contact-title" className="mb-3 text-3xl md:text-4xl">
            Une question, une commande sur mesure ?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sand">
            Écrivez directement à l’atelier : nous répondons en général dans la journée, avec plaisir.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl(`Bonjour ${SITE.name}, j'aimerais en savoir plus sur vos pièces.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-8 py-3 text-base"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Écrire sur WhatsApp
              <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
            </a>
            <a href={`mailto:${SITE.email}`} className="btn btn-outline px-8 py-3 text-base">
              {SITE.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
