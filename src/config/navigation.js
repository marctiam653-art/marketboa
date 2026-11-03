// src/config/navigation.js
// Liens de navigation principaux, partagés par l'en-tête (ordinateur), le menu mobile et le pied de page.
// `end: true` : le lien « Accueil » n'est actif que sur « / » exactement (sinon il le serait partout).
export const NAV_LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/shop', label: 'Boutique' },
  { to: '/collections', label: 'Collections' },
  { to: '/materiaux', label: 'Matériaux' },
  { to: '/about', label: 'À propos' },
];
