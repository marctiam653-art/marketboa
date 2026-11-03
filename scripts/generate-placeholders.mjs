// scripts/generate-placeholders.mjs
// -----------------------------------------------------------------------------
// Génère des images PLACEHOLDER (illustrations abstraites) au format WebP, en
// 3 largeurs chacune (pour le srcset), dans /public/images/.
//
// Pourquoi ? Le projet doit fonctionner immédiatement après `npm install`, sans
// dépendre d'un service externe (Unsplash…). Quand vous aurez de vraies photos,
// utilisez `npm run images:optimize` (voir scripts/optimize-images.mjs) : il
// produit les MÊMES noms de fichiers, donc aucune modification du code n'est
// nécessaire.
//
// Les noms de fichiers sont lus dans src/data/*.json (champ « src »).
// Usage : npm run images:placeholders
// -----------------------------------------------------------------------------
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(ROOT, 'src/data', file), 'utf8'));

// Largeurs générées + ratio hauteur/largeur de chaque famille d'images
const FAMILIES = {
  products: { widths: [400, 800, 1200], ratio: 5 / 4 }, // 4:5 portrait
  collections: { widths: [400, 800, 1200], ratio: 2 / 3 }, // 3:2 paysage
  materials: { widths: [400, 800, 1200], ratio: 3 / 4 }, // 4:3 paysage
  artisans: { widths: [400, 800, 1200], ratio: 5 / 4 }, // 4:5 portrait
  hero: { widths: [800, 1200, 1600], ratio: 2 / 3 }, // 3:2 paysage
};

// Palettes par collection : fond dégradé + couleurs d'accent
const PALETTES = {
  aura: { bg: ['#2b1a3a', '#0f0f0f'], accents: ['#9b6bd1', '#c9a0f0', '#d4a017', '#7a4fb0'] },
  oceane: { bg: ['#0b3a40', '#0f0f0f'], accents: ['#2aa6a6', '#6fd1c4', '#3b82a8', '#1f7a7a'] },
  terre: { bg: ['#3a2415', '#0f0f0f'], accents: ['#b5651d', '#d4a017', '#8b4513', '#c9a66b'] },
  hero: { bg: ['#2a1d14', '#0f0f0f'], accents: ['#d4a017', '#e6b422', '#9b6bd1', '#2aa6a6'] },
};

// Générateur pseudo-aléatoire déterministe : les images sont identiques à chaque exécution
function rng(seedStr) {
  let h = 1779033703;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 3432918353);
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Une perle = disque coloré + petit reflet clair
const bead = (x, y, r, color) =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${color}"/>` +
  `<circle cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" r="${(r * 0.32).toFixed(1)}" fill="#fff" opacity="0.35"/>`;

// --- Motifs dessinés dans un repère de 1000 × 1000 centré sur (0,0) -----------
const MOTIFS = {
  // Collier : perles sur un arc, pendentif central
  necklace: (p, rnd) => {
    let s = '';
    for (let i = 0; i <= 28; i++) {
      const a = Math.PI * (0.12 + (0.76 * i) / 28);
      s += bead(Math.cos(a) * 340, -120 + Math.sin(a) * 380, 26 - Math.abs(i - 14) * 0.5, p.accents[Math.floor(rnd() * 3)]);
    }
    return s + bead(0, 300, 46, p.accents[2]);
  },
  // Bracelet : anneau de perles
  bracelet: (p, rnd) => {
    let s = '';
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      s += bead(Math.cos(a) * 260, Math.sin(a) * 260, 34, p.accents[i % 2 ? 2 : Math.floor(rnd() * 2)]);
    }
    return s;
  },
  // Tissage : grille de petites perles
  weave: (p, rnd) => {
    let s = '';
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 12; c++) s += bead(-286 + c * 52, -208 + r * 52, 21, p.accents[(r + c + Math.floor(rnd() * 2)) % 4]);
    return s;
  },
  // Boucles : deux demi-lunes
  earrings: (p) =>
    [-170, 170]
      .map(
        (x) =>
          `<path d="M ${x} -260 a 150 150 0 1 0 0.1 0 Z" fill="none" stroke="${p.accents[2]}" stroke-width="18"/>` +
          bead(x, -300, 22, p.accents[1]) +
          bead(x, 40, 30, p.accents[0]),
      )
      .join(''),
  // Vase : silhouette translucide avec reflet
  vase: (p) =>
    `<path d="M -110 -330 C -110 -220 -270 -120 -270 60 C -270 230 -160 330 0 330 C 160 330 270 230 270 60 C 270 -120 110 -220 110 -330 Z" fill="${p.accents[0]}" opacity="0.8"/>` +
    `<ellipse cx="0" cy="-330" rx="110" ry="22" fill="${p.accents[1]}" opacity="0.9"/>` +
    `<path d="M -170 40 C -170 -40 -120 -100 -90 -150" stroke="#fff" stroke-width="16" fill="none" opacity="0.25" stroke-linecap="round"/>`,
  // Carafe : bouteille avec col étroit et anse
  carafe: (p) =>
    `<path d="M -50 -340 L -50 -200 C -230 -120 -230 320 0 320 C 230 320 230 -120 50 -200 L 50 -340 Z" fill="${p.accents[1]}" opacity="0.8"/>` +
    `<path d="M 210 -60 C 330 -60 330 160 200 180" stroke="${p.accents[1]}" stroke-width="22" fill="none" opacity="0.8"/>`,
  // Coupelles : trois ellipses empilées
  dishes: (p) =>
    [
      [-160, 120, 190],
      [150, 60, 170],
      [-10, -140, 150],
    ]
      .map(
        ([x, y, r], i) =>
          `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.42}" fill="${p.accents[i]}" opacity="0.85"/>` +
          `<ellipse cx="${x}" cy="${y - 8}" rx="${r * 0.78}" ry="${r * 0.28}" fill="#000" opacity="0.28"/>`,
      )
      .join(''),
  // Tabouret : assise + trois pieds
  stool: (p) =>
    `<polygon points="-170,100 -110,100 -140,330 -200,330" fill="${p.accents[2]}"/>` +
    `<polygon points="110,100 170,100 200,330 140,330" fill="${p.accents[2]}"/>` +
    `<polygon points="-30,100 30,100 20,300 -20,300" fill="${p.accents[0]}"/>` +
    `<ellipse cx="0" cy="80" rx="270" ry="80" fill="${p.accents[0]}"/>` +
    `<ellipse cx="0" cy="68" rx="220" ry="52" fill="#000" opacity="0.25"/>`,
  // Bol : demi-ellipse
  bowl: (p) =>
    `<path d="M -300 -40 Q 0 400 300 -40 Z" fill="${p.accents[0]}"/>` +
    `<ellipse cx="0" cy="-40" rx="300" ry="64" fill="${p.accents[3]}"/>` +
    `<ellipse cx="0" cy="-38" rx="252" ry="44" fill="#000" opacity="0.35"/>`,
  // Écharpe : bandes verticales (tissage de bandes)
  scarf: (p, rnd) => {
    let s = '';
    for (let i = 0; i < 12; i++) s += `<rect x="${-300 + i * 50}" y="-330" width="50" height="660" fill="${p.accents[Math.floor(rnd() * 4)]}"/>`;
    return s + `<rect x="-300" y="-330" width="600" height="660" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="6"/>`;
  },
  // Sac : corps rayé + anse
  bag: (p, rnd) => {
    let s = `<path d="M -120 -120 C -120 -380 120 -380 120 -120" stroke="${p.accents[2]}" stroke-width="26" fill="none"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${-240 + i * 60}" y="-120" width="60" height="400" fill="${p.accents[Math.floor(rnd() * 4)]}"/>`;
    return s;
  },
  // Portrait stylisé (artisans) : tête + épaules
  portrait: (p) =>
    `<circle cx="0" cy="-130" r="120" fill="${p.accents[3]}"/>` +
    `<path d="M -280 380 C -280 120 -170 40 0 40 C 170 40 280 120 280 380 Z" fill="${p.accents[0]}"/>`,
  // Atmosphère générale (hero)
  mix: (p, rnd) => {
    let s = '';
    for (let i = 0; i < 22; i++) s += bead((rnd() - 0.5) * 900, (rnd() - 0.5) * 600, 14 + rnd() * 34, p.accents[Math.floor(rnd() * 4)]);
    return s;
  },
};

// Variantes de « prise de vue » : zoom / rotation / décalage
const VIEWS = [
  { zoom: 1, rot: 0, dx: 0, dy: 0 }, // vue d'ensemble
  { zoom: 2.1, rot: -6, dx: -40, dy: 30 }, // gros plan
  { zoom: 1.25, rot: 5, dx: 30, dy: -20 }, // porté / en situation
  { zoom: 1.55, rot: 10, dx: 60, dy: 50 }, // détail / profil
  { zoom: 0.9, rot: -12, dx: 0, dy: 0 }, // vue de dessus
];

function svgFor({ w, h, palette, motif, view, seedKey, motifScale = 1 }) {
  const rnd = rng(seedKey);
  const v = VIEWS[view % VIEWS.length];
  const scale = (Math.min(w, h) / 1000) * 0.95 * v.zoom * motifScale;
  const angle = 35 + view * 25; // l'angle du dégradé change à chaque vue
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0" stop-color="${palette.bg[0]}"/><stop offset="1" stop-color="${palette.bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0" stop-color="${palette.accents[2]}" stop-opacity="0.28"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g transform="translate(${w / 2 + v.dx * scale} ${h / 2 + v.dy * scale}) rotate(${v.rot}) scale(${scale.toFixed(4)})">
    ${MOTIFS[motif](palette, rnd)}
  </g>
</svg>`;
}

// Écrit une image dans toutes ses largeurs (…-400.webp, …-800.webp, …-1200.webp)
async function writeImage(basePath, family, opts) {
  const { widths, ratio } = FAMILIES[family];
  for (const w of widths) {
    const h = Math.round(w * ratio);
    const svg = svgFor({ ...opts, w, h });
    const out = path.join(ROOT, 'public', `${basePath}-${w}.webp`);
    await fs.mkdir(path.dirname(out), { recursive: true });
    await sharp(Buffer.from(svg)).webp({ quality: 72 }).toFile(out);
  }
}

// Motif choisi pour chaque produit (le nom de produit n'est pas assez fiable pour le deviner)
const PRODUCT_MOTIF = {
  'collier-aurore': 'necklace',
  'bracelet-crepuscule': 'bracelet',
  'collier-plastron-soleil': 'weave',
  'boucles-lune-doree': 'earrings',
  'vase-maree': 'vase',
  'carafe-ecume': 'carafe',
  'coupelles-lagon': 'dishes',
  'bracelet-mangrove': 'weave',
  'tabouret-baobab': 'stool',
  'bol-harmattan': 'bowl',
  'echarpe-soleil-levant': 'scarf',
  'sac-bandes-tissees': 'bag',
};
const MATERIAL_MOTIF = {
  'perles-amethyste': ['necklace', 'aura'],
  'tissage-de-perles': ['weave', 'aura'],
  'verre-recycle-souffle': ['vase', 'oceane'],
  'sculpture-sur-bois': ['stool', 'terre'],
  'tissage-bandes-coton': ['scarf', 'terre'],
};
const COLLECTION_MOTIF = { aura: 'necklace', oceane: 'vase', terre: 'stool' };

const [products, collections, materials, artisans] = await Promise.all([
  readJson('products.json'),
  readJson('collections.json'),
  readJson('materials.json'),
  readJson('artisans.json'),
]);

let count = 0;
for (const product of products) {
  for (const [i, img] of product.images.entries()) {
    await writeImage(img.src, 'products', {
      palette: PALETTES[product.collection],
      motif: PRODUCT_MOTIF[product.id],
      view: i,
      seedKey: `${product.id}-${i}`,
    });
    count++;
  }
}
for (const c of collections) {
  await writeImage(c.image, 'collections', { palette: PALETTES[c.slug], motif: COLLECTION_MOTIF[c.slug], view: 2, seedKey: c.slug, motifScale: 0.85 });
  count++;
}
for (const m of materials) {
  const [motif, pal] = MATERIAL_MOTIF[m.slug];
  await writeImage(m.image, 'materials', { palette: PALETTES[pal], motif, view: 1, seedKey: m.slug, motifScale: 0.7 });
  count++;
}
for (const [i, a] of artisans.entries()) {
  await writeImage(a.portrait, 'artisans', { palette: PALETTES[['aura', 'oceane', 'terre'][i]], motif: 'portrait', view: 0, seedKey: a.id });
  count++;
}
// Image d'accueil (hero)
await writeImage('/images/hero/hero', 'hero', { palette: PALETTES.hero, motif: 'mix', view: 0, seedKey: 'hero', motifScale: 1.1 });
count++;

// Image de partage réseaux sociaux (Open Graph) : PNG 1200×630 (le WebP est mal supporté par certains réseaux)
await sharp(Buffer.from(svgFor({ w: 1200, h: 630, palette: PALETTES.hero, motif: 'mix', view: 0, seedKey: 'og', motifScale: 0.8 })))
  .png()
  .toFile(path.join(ROOT, 'public/images/og-default.png'));

console.log(`✔ ${count} images générées (×3 largeurs) dans public/images/`);
