// src/config/site.js
// Paramètres globaux du site, regroupés au même endroit pour être faciles à modifier.
// (Le script scripts/generate-sitemap.mjs lit SITE_URL dans l'environnement ; gardez les deux cohérents.)

export const SITE = {
  name: 'Mboa Atelier',
  tagline: "L'art africain, pièce par pièce",
  // URL publique du site (canonical, Open Graph, données structurées).
  // Définissez VITE_SITE_URL à la compilation : VITE_SITE_URL=https://monsite.com npm run build
  url: (import.meta.env.VITE_SITE_URL || 'https://www.mboa-atelier.example').replace(/\/$/, ''),
  email: 'contact@mboa-atelier.example',
  // Numéro WhatsApp au format international SANS « + » ni espaces (ici : placeholder Cameroun).
  // ⚠️ À remplacer par votre vrai numéro avant la remise.
  whatsappNumber: '237600000000',
  // Devise : franc CFA (BEAC). Format d'affichage géré par Intl dans lib/format.js
  currency: 'XAF',
  locale: 'fr-FR',
  // Livraison offerte à partir de ce montant (en XAF)
  freeShippingThreshold: 100000,
  // Code promo de démonstration (déclenche aussi les confettis)
  promo: { code: 'BIENVENUE10', percent: 10 },
};
