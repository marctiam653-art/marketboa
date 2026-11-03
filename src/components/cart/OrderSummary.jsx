// src/components/cart/OrderSummary.jsx
// Récapitulatif des montants : sous-total, réduction, livraison, total.
// Sémantique : liste de définitions <dl> (terme → valeur), lue clairement par les lecteurs d'écran.
import { SITE } from '../../config/site.js';
import { formatPrice } from '../../lib/format.js';

export default function OrderSummary({ totals }) {
  // Montant restant pour obtenir la livraison offerte (encouragement à compléter le panier)
  const remaining = SITE.freeShippingThreshold - totals.total;

  return (
    <div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-sand-muted">Sous-total</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-gold">
            <dt>Réduction ({totals.promoCode})</dt>
            <dd>−{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-sand-muted">Livraison</dt>
          <dd>{totals.shipping === 0 ? 'Offerte' : 'À confirmer avec l’atelier'}</dd>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd className="text-gold">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {remaining > 0 && totals.total > 0 && (
        <p className="mt-3 text-xs text-sand-muted">
          Plus que {formatPrice(remaining)} pour profiter de la livraison offerte.
        </p>
      )}
    </div>
  );
}
