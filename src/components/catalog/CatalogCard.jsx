// src/components/catalog/CatalogCard.jsx
// Carte de présentation d'une COLLECTION ou d'un MATÉRIAU / TECHNIQUE (les deux « entrées » du catalogue).
// Toute la carte est un lien unique (un seul titre cliquable) : simple pour le clavier et les lecteurs d'écran.
import { Link } from 'react-router-dom';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';

/**
 * @param {string} to        destination du lien
 * @param {Object} image     { src, alt, aspect }
 * @param {string} eyebrow   petit surtitre (ex. « Technique », « Collection »)
 * @param {string} title
 * @param {string} text      courte description
 * @param {number} count     nombre de produits associés
 * @param {string} [sizes]   attribut sizes de l'image (pour srcset)
 */
export default function CatalogCard({ to, image, eyebrow, title, text, count, sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw' }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors focus-within:border-gold/60 hover:border-gold/40">
      <div className="overflow-hidden bg-surface-2">
        <ResponsiveImage
          src={image.src}
          alt={image.alt}
          aspect={image.aspect}
          sizes={sizes}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {eyebrow && <p className="mb-1 text-[11px] uppercase tracking-widest text-gold">{eyebrow}</p>}
        <h3 className="mb-2 text-lg sm:text-xl">
          {/* Lien « étiré » sur toute la carte */}
          <Link to={to} className="after:absolute after:inset-0 hover:text-gold">
            {title}
          </Link>
        </h3>
        <p className="mb-3 text-sm text-sand-muted">{text}</p>
        <p className="mt-auto text-xs font-medium text-sand">
          {count} pièce{count > 1 ? 's' : ''}
        </p>
      </div>
    </article>
  );
}
