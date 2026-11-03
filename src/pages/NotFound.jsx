// src/pages/NotFound.jsx
// Page 404 : affichée pour toute URL inconnue (route « * ») ou tout produit / collection / matériau inexistant.
// Elle propose toujours des chemins de sortie, et demande aux moteurs de recherche de ne pas l'indexer.
import { Link } from 'react-router-dom';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

export default function NotFound() {
  useDocumentMeta({
    title: 'Page introuvable',
    description: 'La page demandée n’existe pas ou n’existe plus.',
    path: '/404',
    noindex: true,
  });

  return (
    <section aria-labelledby="notfound-title" className="container-page py-24 text-center">
      <p className="mb-2 font-serif text-6xl text-gold" aria-hidden="true">
        404
      </p>
      <h1 id="notfound-title" className="mb-4 text-3xl md:text-4xl">
        Cette page est introuvable
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sand-muted">
        Le lien est peut-être incorrect, ou la pièce a quitté l’atelier. Reprenons depuis le début.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className="btn btn-primary">
          Retour à l’accueil
        </Link>
        <Link to="/shop" className="btn btn-outline">
          Voir la boutique
        </Link>
      </div>
    </section>
  );
}
