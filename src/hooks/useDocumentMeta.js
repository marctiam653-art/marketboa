// src/hooks/useDocumentMeta.js
// SEO : chaque page définit son propre <title>, sa meta description, sa balise canonique
// et ses balises Open Graph. Exemple de titre : « Vase Marée – Artisanat africain fait main | Mboa Atelier ».
//
// Note : dans une application React « côté client », ces balises sont mises à jour par JavaScript.
// Googlebot exécute le JavaScript et les lit ; pour un référencement encore plus robuste,
// il suffirait de pré-rendre les pages (voir README, section SEO).
import { useEffect } from 'react';
import { SITE } from '../config/site.js';

/** Crée ou met à jour une balise <meta> / <link> identifiée par un sélecteur. */
function upsertTag(selector, createTag, attributes) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createTag();
    document.head.appendChild(el);
  }
  Object.entries(attributes).forEach(([name, val]) => el.setAttribute(name, val));
}

const metaByName = (name, content) =>
  upsertTag(`meta[name="${name}"]`, () => Object.assign(document.createElement('meta'), { name }), { content });
const metaByProperty = (property, content) =>
  upsertTag(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta');
    el.setAttribute('property', property);
    return el;
  }, { content });

/**
 * @param {Object}  options
 * @param {string}  options.title        titre court de la page (le nom du site est ajouté)
 * @param {string}  options.description  description (≈ 150 caractères) unique pour la page
 * @param {string}  [options.path]       chemin canonique (ex. '/product/vase-maree')
 * @param {string}  [options.image]      image d'aperçu (chemin absolu depuis la racine)
 * @param {boolean} [options.noindex]    true pour les pages sans valeur SEO (panier, 404…)
 */
export default function useDocumentMeta({ title, description, path = '/', image = '/images/og-default.png', noindex = false }) {
  useEffect(() => {
    const fullTitle = `${title} – Artisanat africain fait main | ${SITE.name}`;
    const url = `${SITE.url}${path}`;

    document.title = fullTitle;
    metaByName('description', description);
    metaByName('robots', noindex ? 'noindex, follow' : 'index, follow');
    upsertTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), { href: url });

    metaByProperty('og:title', fullTitle);
    metaByProperty('og:description', description);
    metaByProperty('og:url', url);
    metaByProperty('og:image', `${SITE.url}${image}`);
  }, [title, description, path, image, noindex]);
}
