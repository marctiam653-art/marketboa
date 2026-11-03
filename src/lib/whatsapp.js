// src/lib/whatsapp.js
// Paiement « léger » sans backend : la commande est transmise à l'atelier via WhatsApp
// (lien wa.me avec un message pré-rempli). Aucun paiement réel n'est traité par le site.
import { SITE } from '../config/site.js';
import { formatPrice } from './format.js';

/** Construit le lien WhatsApp avec le message encodé. */
export function buildWhatsAppUrl(message) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Message pour « Achat immédiat » d'un seul produit. */
export function productOrderMessage(product) {
  return [
    `Bonjour ${SITE.name}, je souhaite acheter :`,
    `• ${product.name} — ${formatPrice(product.price)}`,
    `Lien : ${SITE.url}/product/${product.id}`,
    'Pouvez-vous me confirmer la disponibilité et les modalités de livraison ?',
  ].join('\n');
}

/** Message pour une pièce déjà vendue : on propose une pièce similaire. */
export function similarPieceMessage(product) {
  return `Bonjour ${SITE.name}, la pièce « ${product.name} » est vendue. Pourriez-vous me proposer une pièce similaire ?`;
}

/** Message de question générale sur un produit. */
export function productQuestionMessage(product) {
  return `Bonjour ${SITE.name}, j'ai une question sur « ${product.name} » (${SITE.url}/product/${product.id}).`;
}

/**
 * Message de commande complet depuis le panier.
 * @param {Array}  lines    lignes du panier : { product, quantity }
 * @param {Object} totals   { subtotal, discount, shipping, total, promoCode }
 * @param {Object} customer { name, phone, city, note }
 */
export function cartOrderMessage(lines, totals, customer) {
  const items = lines.map(({ product, quantity }) => `• ${quantity} × ${product.name} — ${formatPrice(product.price * quantity)}`);
  return [
    `Bonjour ${SITE.name}, voici ma commande :`,
    ...items,
    '',
    `Sous-total : ${formatPrice(totals.subtotal)}`,
    totals.discount > 0 ? `Réduction (${totals.promoCode}) : -${formatPrice(totals.discount)}` : null,
    `Livraison : ${totals.shipping === 0 ? 'offerte' : 'à confirmer'}`,
    `Total : ${formatPrice(totals.total)}`,
    '',
    `Nom : ${customer.name}`,
    `Téléphone : ${customer.phone}`,
    `Ville / quartier : ${customer.city}`,
    customer.note ? `Note : ${customer.note}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');
}
