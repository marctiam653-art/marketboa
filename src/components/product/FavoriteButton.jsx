// src/components/product/FavoriteButton.jsx
// Bouton « cœur » pour ajouter / retirer un produit des favoris.
//
// Accessibilité : c'est un bouton à bascule (« toggle »). Son nom accessible reste CONSTANT
// (« Ajouter aux favoris : Vase Marée ») et c'est l'attribut aria-pressed qui indique l'état.
// Changer le libellé ET aria-pressed provoquerait une double annonce confuse.
// Zone tactile : 44×44 px (classe icon-btn).
import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext.jsx';

/** @param {'overlay'|'inline'} variant  overlay = posé sur une photo ; inline = bouton avec texte */
export default function FavoriteButton({ product, variant = 'overlay' }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(product.id);

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={() => toggle(product)}
        aria-pressed={active}
        className="btn btn-outline"
      >
        <Heart size={18} aria-hidden="true" className={active ? 'fill-gold text-gold' : ''} />
        {active ? 'Dans mes favoris' : 'Ajouter aux favoris'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(product)}
      aria-pressed={active}
      aria-label={`Ajouter aux favoris : ${product.name}`}
      className="icon-btn glass absolute right-2 top-2 z-10 border border-white/20"
    >
      {/* fill-gold : le cœur se remplit quand le produit est en favori */}
      <Heart size={20} aria-hidden="true" className={active ? 'fill-gold text-gold' : ''} />
    </button>
  );
}
