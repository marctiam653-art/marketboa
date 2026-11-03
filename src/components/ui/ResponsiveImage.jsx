// src/components/ui/ResponsiveImage.jsx
// Image responsive et performante, au format WebP, avec srcset + sizes.
//
// Convention de nommage : pour src="/images/products/p01-1", les fichiers attendus sont
//   p01-1-400.webp, p01-1-800.webp, p01-1-1200.webp
// Le navigateur choisit lui-même la bonne taille : un mobile ne télécharge pas l'image desktop.
//
// PERFORMANCE
// - Par défaut : loading="lazy" (l'image ne se charge que lorsqu'elle approche de l'écran).
// - Pour l'image principale visible au chargement (hero, 1ʳᵉ photo produit) : priority=true →
//   loading="eager" + fetchpriority="high" afin de ne pas retarder le LCP (Largest Contentful Paint).
// - width/height sont toujours renseignés : le navigateur réserve la place avant le chargement
//   (pas de saut de mise en page → bon score CLS).
//
// ACCESSIBILITÉ : `alt` est obligatoire et doit décrire l'image ; alt="" n'est réservé qu'aux images
// purement décoratives.
const DEFAULT_WIDTHS = [400, 800, 1200];

export default function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  widths = DEFAULT_WIDTHS,
  aspect = [4, 5], // ratio largeur:hauteur d'origine, pour width/height
  priority = false,
  className = '',
}) {
  const srcSet = widths.map((w) => `${src}-${w}.webp ${w}w`).join(', ');
  const largest = widths[widths.length - 1];
  const fallbackWidth = widths[Math.min(1, widths.length - 1)]; // image « moyenne » pour les anciens navigateurs
  const [ratioW, ratioH] = aspect;

  return (
    <img
      src={`${src}-${fallbackWidth}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={largest}
      height={Math.round((largest * ratioH) / ratioW)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      // React 18 ne connaît pas encore la prop camelCase « fetchPriority » : on utilise l'attribut HTML en minuscules
      fetchpriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
      className={className}
    />
  );
}
