// src/components/cart/CartLine.jsx
// Une ligne du panier : miniature, nom, prix, quantité et bouton « Retirer ».
// Utilisée dans le tiroir panier ET sur la page de commande (même composant = même comportement).
//
// Règle métier : une PIÈCE UNIQUE n'a pas de sélecteur de quantité (elle n'existe qu'en un exemplaire).
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';
import { maxQuantity, useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../lib/format.js';
import { getProductImages } from '../../lib/catalog.js';

export default function CartLine({ product, quantity, onNavigate }) {
  const { setQuantity, removeItem } = useCart();
  const max = maxQuantity(product);
  const [cover] = getProductImages(product);

  return (
    <li className="flex gap-3 border-b border-white/10 py-4 last:border-b-0">
      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
        <ResponsiveImage src={product.images[0].src} alt={cover.alt} sizes="80px" className="h-full w-full object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base leading-snug">
            <Link to={`/product/${product.id}`} onClick={onNavigate} className="hover:text-gold">
              {product.name}
            </Link>
          </h3>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            aria-label={`Retirer du panier : ${product.name}`}
            className="icon-btn -mr-2 -mt-2 shrink-0"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-sand-muted">{formatPrice(product.price)}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          {max > 1 ? (
            // Sélecteur de quantité : boutons 44×44 px, valeur annoncée par aria-live
            <div role="group" aria-label={`Quantité de ${product.name}`} className="flex items-center">
              <button
                type="button"
                onClick={() => setQuantity(product.id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Diminuer la quantité : ${product.name}`}
                className="icon-btn border border-white/30 disabled:opacity-40"
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <span aria-live="polite" className="w-10 text-center font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(product.id, quantity + 1)}
                disabled={quantity >= max}
                aria-label={`Augmenter la quantité : ${product.name}`}
                className="icon-btn border border-white/30 disabled:opacity-40"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <span className="text-sm text-gold">Pièce unique</span>
          )}
          <p className="font-semibold text-gold">
            <span className="sr-only">Total de la ligne : </span>
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
