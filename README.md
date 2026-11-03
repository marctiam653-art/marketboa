# Mboa Atelier — site vitrine et boutique d'artisanat africain

Projet académique : « Conception d'un site web vitrine d'exposition et de vente des produits d'artisanat africain ».
Le site expose les produits, raconte l'histoire des artisans et propose un parcours d'achat sans backend
(commande finalisée par **WhatsApp**).

- **Stack** : Vite + React 18 (**JavaScript / JSX**), Tailwind CSS 3 (mobile-first), React Router v6, lucide-react.
- **Données** : fichiers JSON locaux dans `src/data/`, lus via `src/lib/catalog.js` (« fausse API »).
- **Design** : fond noir `#0f0f0f`, cartes `#1a1a1a`, or `#d4a017` ; neutres chauds beige `#f3e9d7` / brun terreux `#6b4a2f` pour laisser la place aux produits.
- **Données fictives** : artisans, produits, notes et avis sont inventés pour la démonstration ; les images sont des illustrations générées.

> ⚠️ **À faire avant la remise** : remplacer le numéro WhatsApp (`src/config/site.js`, valeur factice `237600000000`) et l'URL du site.

---

## 1. Installation et lancement

Prérequis : Node.js ≥ 18.

```bash
npm install
npm run dev        # serveur de développement  → http://localhost:5173
npm run build      # build de production (génère aussi sitemap.xml + robots.txt)
npm run preview    # sert le build                → http://localhost:4173
```

| Commande | Rôle |
| --- | --- |
| `npm run seo` | régénère `public/sitemap.xml` et `public/robots.txt` |
| `npm run images:placeholders` | régénère les images d'illustration |
| `npm run images:optimize` | convertit **vos vraies photos** (`source-images/`) en WebP en 3 largeurs, avec les mêmes noms de fichiers : aucun changement de code nécessaire |

Pour définir l'URL publique : `SITE_URL=https://monsite.com VITE_SITE_URL=https://monsite.com npm run build`.

**Déploiement** : le site est une application monopage (SPA). L'hébergeur doit renvoyer `index.html` pour toutes les URL
(Netlify : fichier `_redirects` contenant `/* /index.html 200` ; Vercel : réécriture vers `/index.html`).

---

## 2. Arborescence

```
├── index.html                      meta, Organization JSON-LD, viewport-fit=cover
├── public/                         favicon, robots.txt, sitemap.xml, images/ (WebP)
├── scripts/                        generate-sitemap · generate-placeholders · optimize-images
├── docs/
│   ├── screenshots/                captures responsive (mobile 390 · tablette 820 · desktop 1280)
│   └── lighthouse/                 rapports Lighthouse mobile (HTML + JSON)
└── src/
    ├── main.jsx · App.jsx · index.css
    ├── config/        site.js (nom, WhatsApp, devise, promo) · navigation.js
    ├── data/          products.json · collections.json · materials.json · artisans.json
    ├── lib/           catalog.js (fausse API, tri, recherche) · format.js · whatsapp.js · confetti.js
    ├── hooks/         useMediaQuery · useDebounce · useLocalStorage · useDocumentMeta · useModalA11y
    ├── context/       CartContext · FavoritesContext
    ├── components/
    │   ├── ui/        Carousel · Drawer · ResponsiveImage · Breadcrumbs · SectionHeading · JsonLd
    │   ├── layout/    Layout · Header · SearchBox · MobileMenu · MobileDock · Footer · AnnouncementBar · WhatsAppButton
    │   ├── product/   ProductCard · ProductGrid · ProductGallery · PriceTag · FavoriteButton
    │   ├── cart/      CartDrawer · CartLine · PromoForm · OrderSummary
    │   └── catalog/   CatalogCard · CatalogLanding
    └── pages/         Home · Shop · Collections · CollectionDetail · Materials · MaterialDetail ·
                       ProductDetail · About · Favorites · Checkout · NotFound
```

### Pages et URL

| URL | Page |
| --- | --- |
| `/` | Accueil : hero, collections phares (carrousel avec pause), matériaux, artisane à la une, nouveautés |
| `/shop` | Boutique (gabarit fourni) : catégories avec compteurs, tri, grille/liste, recherche `?q=` |
| `/collections` · `/collections/:slug` | **Entrée par collection** (Aura, Océane, Terre) |
| `/materiaux` · `/materiaux/:slug` | **Entrée par matériau / technique** (pages SEO indexables) |
| `/product/:id` | Fiche produit : galerie multi-angles, achat immédiat, histoire, artisan, caractéristiques |
| `/about` | Histoire de la marque et des artisans (ancres `#esther-mbarga`…) |
| `/favoris` · `/commande` | Favoris · commande (formulaire + WhatsApp), exclues de l'indexation |

**Parcours** : Accueil → Collection / Matériau / Boutique → Fiche produit → Panier → Commande WhatsApp.

---

## 3. Choix techniques

- **JavaScript (JSX) plutôt que TypeScript** : projet académique, moins de configuration ; le gabarit `Shop.tsx` fourni a été converti.
- **Carrousel écrit à la main plutôt que `@cloudimage/carousel`** : un seul composant sert l'accueil et la galerie produit, sans dépendance, avec contrôle total de l'ARIA, du swipe et de la pause.
- **`useMediaQuery` utilisé à un seul endroit** (barre latérale ordinateur ↔ tiroir mobile de la boutique), plus un usage de comportement (pas d'auto-défilement si « réduire les animations »). Tout le reste du responsive est en CSS pur (`md:`, `lg:`).
- **Écarts volontaires par rapport au gabarit `Shop.tsx`** : retrait des icônes *Comparer* (le cahier des charges interdit la comparaison de produits), *Soleil* et *Utilisateur* (sans fonction) ; ancien prix `white/40` remplacé (contraste insuffisant) ; badge rouge `bg-red-500` remplacé par `bg-sale` (texte blanc ≥ 4,5:1) ; numéro WhatsApp et marque remplacés par des valeurs neutres et configurables.
- **Devise** : franc CFA (`XAF`), modifiable dans `src/config/site.js`. Interface en français.

---

## 4. Conformité aux critères d'évaluation (point par point)

### I. Bonnes pratiques et normes W3C

| Critère | Où et comment |
| --- | --- |
| HTML sémantique | `<header>`, `<nav aria-label>`, `<main id="contenu">` (un seul), `<section aria-labelledby>`, `<article>`, `<aside>`, `<footer>`, `<dl>`, `<blockquote>`, `<del>`. **Un seul `<h1>` par page** (vérifié sur les 12 routes × 3 écrans), hiérarchie H2 → H3 → H4 logique. |
| Textes alternatifs | `alt` descriptif sur chaque image : `getProductImages()` compose « nom + matière + origine — vue » (ex. « Collier de perles d'améthyste en dégradé violet, monté à la main, artisanat camerounais — gros plan sur le dégradé »). `alt=""` uniquement pour les miniatures décoratives (le bouton porte le nom). |
| Contraste ≥ 4,5:1 | Palette définie dans `tailwind.config.js` : texte beige sur noir ≈ 16:1, or sur noir ≈ 8:1, noir sur or ≈ 8:1, texte secondaire `sand-muted` ≥ 7:1, blanc sur rouge promo `#b91c1c` ≈ 6,5:1. |
| Labels et erreurs de formulaire | `Checkout.jsx`, `PromoForm.jsx`, `SearchBox.jsx`, filtre de tri : `<label>` visible relié par `htmlFor`/`id`, `aria-invalid`, `aria-describedby` vers le message, résumé `role="alert"`, focus sur le 1ᵉʳ champ en erreur. |
| Navigation clavier | Lien d'évitement « Aller au contenu principal » (1ᵉʳ `Tab`), tiroirs avec **focus piégé**, `Échap`, retour du focus (`useModalA11y`), flèches ← → dans les carrousels, liste de recherche refermée par `Échap`. |
| Focus visible | `src/index.css` : `:focus-visible { outline: 3px solid #f2c94c; outline-offset: 3px }`. **`outline: none` n'est utilisé nulle part.** |
| Zones tactiles ≥ 44×44 px | Classes `.btn`, `.icon-btn`, `.field` (`min-h-[44px]`), liens du pied de page et de la barre latérale, points du carrousel, dock (48 px). Vérifié par script sur toutes les pages (liens en ligne dans un paragraphe exemptés). |
| Images WebP | Toutes les images sont en `.webp`, en 3 largeurs (400/800/1200 ; hero 800/1200/1600). |
| `loading="lazy"` | Par défaut sur toutes les images ; **exceptions** : image du hero et 1ʳᵉ photo produit (`priority` → `loading="eager"` + `fetchpriority="high"`) pour préserver le LCP. |
| `srcset` + `sizes` | `ResponsiveImage.jsx` génère `srcset` (largeurs `w`) et `sizes` adaptés à chaque mise en page ; `width`/`height` toujours renseignés (pas de saut de mise en page, CLS ≈ 0). |
| 2 polices maximum | Playfair Display (titres) + Inter (texte), auto-hébergées via Fontsource, `font-display: swap`. |
| Compatibilité navigateurs | Cible `es2020`, Autoprefixer (`-webkit-backdrop-filter`), repli de fond opaque si `backdrop-filter` absent. Testé avec Chromium (Playwright) ; **à vérifier manuellement** sur Firefox, Safari, Edge (voir checklist). |
| Mouvement | `prefers-reduced-motion` respecté (CSS global, confettis, auto-défilement). |

### II. Responsiveness

| Critère | Où et comment |
| --- | --- |
| Mobile-first | Classes sans préfixe = mobile ; `md:` (≥ 768 px, tablette) et `lg:` (≥ 1024 px, ordinateur) surchargent. Points de rupture : 360–414 / 768–820 / 1024+. |
| Mises en page flexibles | Grille produits : **2 colonnes mobile → 3 tablette → 3–4 ordinateur** (`ProductGrid.jsx`) ; hero, footer (1 → 2 → 4 colonnes), fiche produit (galerie au-dessus sur mobile, à gauche dès `lg:`). |
| Navigation | Mobile : hamburger + **micro-dock flottant en verre dépoli** (`MobileDock.jsx`, `backdrop-filter: blur`) ; ordinateur : barre horizontale. Le dock est en fin de DOM (ne gêne pas les outils d'assistance) et se masque quand un champ reçoit le focus (clavier virtuel). |
| iPhone / Android | `viewport-fit=cover` + `env(safe-area-inset-bottom)` sur le dock, le bouton WhatsApp, les tiroirs et le pied de page ; champs en **16 px minimum** (pas de zoom iOS) ; hauteur `100dvh`. |
| Images adaptatives | `srcset` + `sizes` : un mobile ne télécharge pas l'image desktop. |

### III. Performance

| Critère | Où et comment |
| --- | --- |
| Images | WebP compressé, `lazy`, `srcset`. Poids total de l'accueil ≈ 250 Ko. |
| CSS / JS | Minification Vite (esbuild + CSS), découpage par page (`React.lazy`), chunk `vendor` séparé, script `type="module"` (différé par défaut). |
| Polices | 2 familles, sous-ensemble latin, `swap`, auto-hébergées (pas de requête vers un tiers). |

### SEO

| Critère | Où et comment |
| --- | --- |
| `title` + `description` uniques | `useDocumentMeta` (par page). Format : « Collier Aurore – Artisanat africain fait main \| Mboa Atelier ». Canonical + Open Graph par page ; pages privées en `noindex`. |
| Données structurées | `Organization` (statique, `index.html`) ; `Product` (prix, devise, disponibilité réelle `InStock/PreOrder/SoldOut`, note) et `BreadcrumbList` sur chaque fiche. *Les notes du JSON sont fictives : à remplacer par de vrais avis, ou supprimer le champ `rating`.* |
| URL propres | `/product/vase-maree`, `/collections/aura`, `/materiaux/perles-amethyste` (aucun `?id=123`). Les filtres de la boutique ne créent pas de doublons : canonical fixe `/shop`. |
| `sitemap.xml` + `robots.txt` | Générés avant chaque build (`scripts/generate-sitemap.mjs`) à partir des JSON : 25 URL. |
| Pages matériaux indexables | Une page par matériau/technique, avec contenu texte propre (landing pages SEO durables). |
| Limite connue | Les balises sont mises à jour par JavaScript (SPA) : Google les lit, mais pas tous les robots. Pour un référencement maximal en production : pré-rendu (ex. `vite-plugin-ssr`, `react-snap`) ou Next.js. |

### Multimédia et design

- **Galerie produit** (`ProductGallery.jsx`) : 5 vues pour les bijoux, 4 pour les objets (ensemble, gros plan, porté, détail) ; carrousel ARIA, miniatures, **swipe tactile**, flèches clavier.
- **Carrousel d'accueil** : défilement automatique **avec bouton Pause visible**, arrêt au survol **et à l'entrée du focus clavier**, désactivé si « réduire les animations » ; `aria-live` passe à `polite` en pause.
- **Idées de la référence** (code réécrit) : micro-dock, recherche live avec debounce 250 ms, « Achat immédiat » WhatsApp, confettis dorés (code promo `BIENVENUE10`).
- **L'histoire avant les specs** : sur la fiche produit, l'ordre est photos → prix/achat → histoire → artisan → matériau → caractéristiques.
- **Évité** : comparateur, motifs « tribaux », autoplay sans pause, `outline: none`.

---

## 5. Validations et preuves

```bash
npm run build && npm run preview          # puis, dans un autre terminal :

# Lighthouse (Chrome requis)
npx lighthouse http://localhost:4173/ --view
npx lighthouse http://localhost:4173/product/collier-aurore --preset=desktop --view
```

- **Rapports Lighthouse déjà générés** : `docs/lighthouse/*.report.html` (mobile : accueil, boutique, produit, à propos).
  Résultats mesurés sur le build local : **Accessibilité 100, Bonnes pratiques 100, SEO 100** sur les 4 pages ; Performance 94–97 (accueil : 90–95, variable selon la charge de la machine) ; CLS ≈ 0.
- **Captures responsive** : `docs/screenshots/{mobile,tablette,desktop}-{accueil,boutique,produit,a-propos}.png`
  (les éléments flottants — WhatsApp, dock — apparaissent à la position de la fenêtre dans les captures pleine page).
- **W3C HTML** : le site étant une SPA, validez le HTML *rendu* : ouvrez une page, `Ctrl+U` ne suffit pas ; utilisez l'onglet
  « Validate by input » sur <https://validator.w3.org/nu/> avec le HTML copié depuis les outils de développement
  (clic droit sur `<html>` → *Copy outerHTML*), pour chaque page principale. **Non exécuté ici (accès réseau)**.
- **WAVE** : extension navigateur <https://wave.webaim.org/extension/> (ou <https://wave.webaim.org/> sur la version déployée) ;
  à lancer sur Accueil, Boutique, Produit, À propos, Commande. **Non exécuté ici**.
- **Contrôles automatisés réalisés (Playwright)** : 0 erreur console, 0 débordement horizontal, 1 `<h1>` et 1 `<main>`, 0 image sans `alt`
  sur 12 routes × 3 tailles d'écran ; 67 scénarios d'interaction réussis (recherche, panier, promo, formulaire, WhatsApp, filtres, galerie, swipe, clavier).

---

## 6. Checklist avant la remise

- [ ] Remplacer le numéro WhatsApp (`src/config/site.js`) et l'e-mail ; définir l'URL publique (`SITE_URL`, `VITE_SITE_URL`).
- [ ] Remplacer les images d'illustration par de vraies photos (`source-images/` → `npm run images:optimize`) et réécrire les `alt` / `view` dans `products.json`.
- [ ] Remplacer les notes fictives (`rating`) par de vrais avis, ou les retirer.
- [ ] `npm install && npm run build` sans erreur ni avertissement.
- [ ] Lighthouse mobile ≥ 90 partout ; joindre les rapports (`docs/lighthouse/`).
- [ ] Validation W3C HTML sans erreur sur : accueil, boutique, collection, matériau, produit, à propos.
- [ ] WAVE : 0 erreur sur les pages principales ; joindre les captures.
- [ ] Tester sur **Chrome, Firefox, Safari, Edge** (bureau) et sur un vrai **iPhone** et **Android** : dock, safe-area, saisie sans zoom.
- [ ] Navigation 100 % clavier : `Tab` depuis le lien d'évitement jusqu'au paiement, `Échap` dans les tiroirs.
- [ ] Test lecteur d'écran rapide (NVDA ou VoiceOver) : fiche produit, panier, formulaire en erreur.
- [ ] Zoom 200 % et texte agrandi : aucune perte de contenu.
- [ ] Mode « réduire les animations » activé : pas de confettis ni d'auto-défilement.
- [ ] Parcourir : Accueil → Collection → Produit → Panier → Commande → message WhatsApp pré-rempli.
- [ ] Vérifier `sitemap.xml` et `robots.txt` sur la version déployée ; tester une URL inconnue (page 404) et le rechargement d'une URL profonde (réécriture SPA).
- [ ] Joindre les captures responsive (`docs/screenshots/`).
