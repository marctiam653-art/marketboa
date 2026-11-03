// src/lib/format.js
// Fonctions d'affichage (prix, dates). Intl gère les séparateurs de milliers et le symbole de devise.
import { SITE } from '../config/site.js';

// Un seul formateur créé une fois (créer un Intl.NumberFormat est coûteux)
const priceFormatter = new Intl.NumberFormat(SITE.locale, {
  style: 'currency',
  currency: SITE.currency,
  maximumFractionDigits: 0, // le franc CFA n'a pas de centimes
});

/** Formate un montant : 48000 → « 48 000 FCFA » */
export function formatPrice(amount) {
  return priceFormatter.format(amount);
}

/** Pourcentage de réduction entre le prix barré et le prix actuel : 60000 → 48000 = 20 */
export function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
