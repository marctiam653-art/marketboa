// src/main.jsx
// Point d'entrée de l'application : monte React dans <div id="root"> et branche les « providers »
// (routeur, favoris, panier) autour de l'application.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Polices auto-hébergées (RGPD + performance) : 2 familles seulement, sous-ensemble « latin ».
// Fontsource déclare `font-display: swap` : le texte s'affiche tout de suite avec une police
// système, puis bascule vers la police du site une fois chargée (pas de texte invisible).
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-700.css';

import './index.css';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode : détecte en développement les effets de bord et les anciennes API
  <React.StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
