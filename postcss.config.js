// postcss.config.js
// Tailwind génère le CSS ; Autoprefixer ajoute les préfixes (-webkit-…) pour
// Safari / iOS (ex. backdrop-filter → -webkit-backdrop-filter).
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
