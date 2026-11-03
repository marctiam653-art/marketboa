// tailwind.config.js
// Charte graphique « noir et or » + neutres terreux (beige / brun).
//
// RESPONSIVE MOBILE-FIRST : Tailwind applique les classes sans préfixe à TOUTES
// les tailles (= mobile par défaut), puis les surcharge vers le haut :
//   sm: ≥ 640px   md: ≥ 768px (tablettes)   lg: ≥ 1024px (ordinateurs)   xl: ≥ 1280px
// Les points de rupture ci-dessous couvrent : mobile 360–414px, tablette 768–820px, desktop 1024px+.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        // Fonds
        ink: '#0f0f0f', // fond principal
        surface: '#1a1a1a', // cartes
        'surface-2': '#242424', // zones d'image / champs
        // Or (accent) — contraste 8:1 sur ink, et texte noir sur or = 8:1
        gold: {
          DEFAULT: '#d4a017',
          light: '#e6b422',
          dark: '#a67c00',
        },
        // Neutres chauds : beige (texte clair) et brun terreux (surfaces secondaires)
        sand: {
          DEFAULT: '#f3e9d7',
          muted: '#b9ad9a', // texte secondaire : contraste ≥ 7:1 sur ink
        },
        earth: {
          DEFAULT: '#6b4a2f',
          dark: '#2a1d14',
        },
        // Rouge « promo » : texte blanc dessus = 6,5:1
        sale: '#b91c1c',
        // Vert WhatsApp foncé : icône blanche dessus = 4,1:1 (≥ 3:1 requis pour un pictogramme)
        whatsapp: '#128c7e',
      },
      fontFamily: {
        // 2 polices maximum : titres (Playfair Display) + corps (Inter), auto-hébergées via Fontsource
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        page: '1440px',
      },
      // Hauteur du micro-dock mobile (utilisée pour réserver de la place en bas de page)
      spacing: {
        dock: '4.5rem',
      },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left': 'slide-in-left 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
