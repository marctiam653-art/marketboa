// src/components/product/PriceTag.jsx
// Affiche le prix actuel en or et, en promotion, l'ancien prix barré.
//
// Accessibilité : un lecteur d'écran ne « voit » pas le trait de barrage. On ajoute donc des libellés
// visuellement cachés (sr-only) : « Prix actuel », « Ancien prix ». La balise <del> indique aussi
// sémantiquement qu'un prix est supprimé/remplacé.
//
// Contraste : l'ancien prix utilise « sand-muted » (≥ 7:1 sur fond sombre). Le gabarit d'origine
// utilisait white/40, trop pâle (< 4,5:1) : on l'a corrigé.
import { formatPrice } from '../../lib/format.js';

/** @param {'md'|'lg'} size  taille du prix principal (md = carte, lg = page produit) */
export default function PriceTag({ price, originalPrice, size = 'md' }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="sr-only">Prix actuel :</span>
      <span className={`font-semibold text-gold ${size === 'lg' ? 'text-3xl' : 'text-lg sm:text-xl'}`}>{formatPrice(price)}</span>
      {originalPrice && (
        <>
          <span className="sr-only">Ancien prix :</span>
          <del className="text-sm text-sand-muted">{formatPrice(originalPrice)}</del>
        </>
      )}
    </p>
  );
}
