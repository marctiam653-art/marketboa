// scripts/generate-sitemap.mjs
// -----------------------------------------------------------------------------
// Génère public/sitemap.xml et public/robots.txt à partir des fichiers JSON.
// Lancé automatiquement avant chaque `npm run build` (script « prebuild »).
//
// URL du site : variable d'environnement SITE_URL (ex. SITE_URL=https://monsite.com npm run build)
// À garder identique à la valeur par défaut de src/config/site.js.
// -----------------------------------------------------------------------------
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = (process.env.SITE_URL || 'https://www.mboa-atelier.example').replace(/\/$/, '');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(ROOT, 'src/data', file), 'utf8'));

const [products, collections, materials] = await Promise.all([
  readJson('products.json'),
  readJson('collections.json'),
  readJson('materials.json'),
]);

// Pages statiques puis pages dynamiques (collections, matériaux, produits)
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: '/', priority: '1.0' },
  { loc: '/shop', priority: '0.9' },
  { loc: '/collections', priority: '0.8' },
  { loc: '/materiaux', priority: '0.8' },
  { loc: '/about', priority: '0.6' },
  ...collections.map((c) => ({ loc: `/collections/${c.slug}`, priority: '0.8' })),
  ...materials.map((m) => ({ loc: `/materiaux/${m.slug}`, priority: '0.8' })),
  ...products.map((p) => ({ loc: `/product/${p.id}`, priority: '0.7' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
  .join('\n')}
</urlset>
`;

// robots.txt : tout est indexable, sauf les pages de panier/commande et de favoris (sans valeur SEO)
const robots = `User-agent: *
Allow: /
Disallow: /commande
Disallow: /favoris

Sitemap: ${SITE_URL}/sitemap.xml
`;

await fs.mkdir(path.join(ROOT, 'public'), { recursive: true });
await fs.writeFile(path.join(ROOT, 'public/sitemap.xml'), xml);
await fs.writeFile(path.join(ROOT, 'public/robots.txt'), robots);
console.log(`✔ sitemap.xml (${urls.length} URL) et robots.txt générés pour ${SITE_URL}`);
