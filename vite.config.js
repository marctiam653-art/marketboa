// vite.config.js
// Configuration de build Vite.
// - plugin React (JSX + Fast Refresh en développement)
// - découpage du bundle (vendor séparé) pour un meilleur cache navigateur
// - minification esbuild (JS) + minification CSS activées par défaut en `vite build`
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Cible de navigateurs modernes : Chrome, Firefox, Safari, Edge récents
    target: 'es2020',
    rollupOptions: {
      output: {
        // Les bibliothèques rarement modifiées vont dans un fichier à part :
        // le navigateur les garde en cache entre deux déploiements.
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
