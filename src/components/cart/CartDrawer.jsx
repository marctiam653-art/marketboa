// src/components/cart/CartDrawer.jsx
// Tiroir panier : s'ouvre à droite quand on ajoute un produit ou qu'on clique sur l'icône panier.
// L'état d'ouverture vit dans CartContext (isOpen / openCart / closeCart) pour que n'importe quel
// bouton de l'application puisse l'ouvrir. L'accessibilité (focus piégé, Échap…) vient de <Drawer>.
import { Link } from 'react-router-dom';
import Drawer from '../ui/Drawer.jsx';
import CartLine from './CartLine.jsx';
import PromoForm from './PromoForm.jsx';
import OrderSummary from './OrderSummary.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function CartDrawer() {
  const { isOpen, closeCart, lines, totals } = useCart();

  return (
    <Drawer open={isOpen} onClose={closeCart} title="Mon panier" side="right">
      {lines.length === 0 ? (
        // État vide : on guide l'utilisateur vers la boutique (jamais d'impasse)
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sand-muted">Votre panier est vide. Chaque pièce raconte une histoire : laissez-vous guider.</p>
          <Link to="/shop" onClick={closeCart} className="btn btn-primary">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 overflow-y-auto px-4">
            {lines.map(({ product, quantity }) => (
              <CartLine key={product.id} product={product} quantity={quantity} onNavigate={closeCart} />
            ))}
          </ul>

          {/* Pied du tiroir : code promo, montants, bouton de commande.
              pb-[env(safe-area-inset-bottom)] garde les boutons au-dessus de la barre gestuelle iPhone/Android. */}
          <div className="space-y-4 border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <PromoForm />
            <OrderSummary totals={totals} />
            <Link to="/commande" onClick={closeCart} className="btn btn-primary w-full">
              Passer la commande
            </Link>
            <button type="button" onClick={closeCart} className="btn btn-outline w-full">
              Continuer mes achats
            </button>
          </div>
        </>
      )}
    </Drawer>
  );
}
