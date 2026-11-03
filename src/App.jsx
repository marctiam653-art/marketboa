// src/App.jsx
// Table des routes (React Router v6). Les pages sont chargées à la demande (« lazy loading ») :
// le navigateur ne télécharge le code d'une page que lorsqu'on la visite → bundle initial plus léger.
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx'; // l'accueil reste dans le bundle principal (LCP plus rapide)

const Shop = lazy(() => import('./pages/Shop.jsx'));
const Collections = lazy(() => import('./pages/Collections.jsx'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail.jsx'));
const Materials = lazy(() => import('./pages/Materials.jsx'));
const MaterialDetail = lazy(() => import('./pages/MaterialDetail.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Favorites = lazy(() => import('./pages/Favorites.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Affiché pendant le chargement d'une page (role="status" : annoncé par les lecteurs d'écran)
function PageLoader() {
  return (
    <div role="status" className="container-page py-24 text-center text-sand-muted">
      Chargement…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Layout = en-tête + pied de page + navigation mobile, commun à toutes les pages */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="collections" element={<Collections />} />
          <Route path="collections/:slug" element={<CollectionDetail />} />
          <Route path="materiaux" element={<Materials />} />
          <Route path="materiaux/:slug" element={<MaterialDetail />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="about" element={<About />} />
          <Route path="favoris" element={<Favorites />} />
          <Route path="commande" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
