// src/components/product/ProductGallery.jsx
// Galerie d'images de la page produit : c'est le cœur de l'expérience « atelier à distance ».
// Elle propose plusieurs angles (vue d'ensemble, gros plan, porté, détail…) et réutilise le carrousel
// accessible du projet en mode CONTRÔLÉ : la galerie garde l'index courant dans son propre état
// (useState) afin de le partager avec la rangée de miniatures.
//
// Accessibilité :
//   • carrousel ARIA (region / roledescription / « X sur Y ») géré par <Carousel> ;
//   • miniatures = vrais boutons avec nom accessible (« Photo 2 sur 5 : gros plan… ») et aria-current ;
//   • swipe tactile + flèches clavier gérés par <Carousel> ;
//   • alt descriptif sur chaque image.
//
// Performance : seule la 1ʳᵉ photo est chargée en priorité (LCP) ; les autres et les miniatures sont « lazy ».
import { useState } from 'react';
import Carousel from '../ui/Carousel.jsx';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';
import { getProductImages } from '../../lib/catalog.js';

export default function ProductGallery({ product }) {
  const images = getProductImages(product);
  const [index, setIndex] = useState(0);

  return (
    <div>
      <Carousel
        label={`Photos de ${product.name}`}
        items={images}
        getKey={(img) => img.src}
        index={index}
        onIndexChange={setIndex}
        showDots={false} // les miniatures jouent déjà le rôle de points de navigation
        renderItem={(img, i) => (
          <div className="aspect-[4/5] bg-surface-2">
            <ResponsiveImage
              src={product.images[i].src}
              alt={img.alt}
              // Mobile : pleine largeur ; ordinateur : la galerie occupe environ la moitié de l'écran
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={i === 0} // 1ʳᵉ photo : pas de lazy-loading, pour un affichage rapide
              className="h-full w-full object-cover"
            />
          </div>
        )}
      />

      {/* Miniatures : rangée défilable horizontalement si elles dépassent la largeur */}
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {images.map((img, i) => (
          <li key={img.src} className="shrink-0">
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher la photo ${i + 1} sur ${images.length} : ${product.images[i].view}`}
              aria-current={i === index ? 'true' : undefined}
              // Miniature de 64×80 px : au-dessus du minimum tactile de 44 px
              className={`block h-20 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                i === index ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* alt="" : l'image est décorative ici, le bouton porte déjà le nom accessible */}
              <ResponsiveImage src={product.images[i].src} alt="" sizes="64px" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
