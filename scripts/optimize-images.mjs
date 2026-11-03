// scripts/optimize-images.mjs
// -----------------------------------------------------------------------------
// Convertit VOS VRAIES PHOTOS en WebP compressé, en 3 largeurs (srcset).
//
// Utilisation :
//   1. Déposez vos photos (JPG/PNG) dans le dossier  source-images/
//      en respectant l'arborescence et les noms de base du JSON, par exemple :
//         source-images/products/p01-1.jpg   → public/images/products/p01-1-400|800|1200.webp
//         source-images/hero/hero.jpg        → public/images/hero/hero-800|1200|1600.webp
//   2. Lancez :  npm run images:optimize
//
// Les noms de fichiers de sortie sont identiques à ceux des placeholders : vous
// remplacez les images sans toucher au code ni au JSON.
// -----------------------------------------------------------------------------
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'source-images');
const OUTPUT = path.join(ROOT, 'public/images');
const DEFAULT_WIDTHS = [400, 800, 1200];
const WIDTHS_BY_FOLDER = { hero: [800, 1200, 1600] };

// Liste récursivement les fichiers images du dossier source
async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(jpe?g|png|webp|tiff?)$/i.test(entry.name)) yield full;
  }
}

try {
  await fs.access(SOURCE);
} catch {
  console.error('Dossier source-images/ introuvable : créez-le et déposez-y vos photos.');
  process.exit(1);
}

let count = 0;
for await (const file of walk(SOURCE)) {
  const rel = path.relative(SOURCE, file); // ex. products/p01-1.jpg
  const folder = rel.split(path.sep)[0];
  const base = rel.replace(/\.[^.]+$/, ''); // sans extension
  const widths = WIDTHS_BY_FOLDER[folder] ?? DEFAULT_WIDTHS;

  for (const w of widths) {
    const out = path.join(OUTPUT, `${base}-${w}.webp`);
    await fs.mkdir(path.dirname(out), { recursive: true });
    // withoutEnlargement : on ne grossit jamais une petite photo
    await sharp(file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
  }
  count++;
}
console.log(`✔ ${count} photo(s) optimisée(s) → public/images/`);
