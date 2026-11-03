// src/components/layout/SearchBox.jsx
// Recherche « AJAX » avec aperçu en direct (idée reprise du site de référence) :
//   1. l'utilisateur tape → on attend 250 ms sans nouvelle frappe (useDebounce) ;
//   2. on appelle searchProducts(), qui simule une requête réseau asynchrone ;
//   3. les 6 premiers résultats s'affichent dans une liste (miniature, nom, prix) ;
//   4. Entrée ou « Voir tous les résultats » ouvre la boutique filtrée (/shop?q=…).
//
// Deux variantes :
//   • variant="header"  : champ compact dans l'en-tête, résultats dans un menu flottant ;
//   • variant="overlay" : champ pleine largeur dans le tiroir de recherche mobile (label visible).
//
// Accessibilité :
//   • <form role="search"> + <label> (visible en mobile, masqué visuellement dans l'en-tête où l'icône loupe
//     et le placeholder indiquent la fonction) ;
//   • le nombre de résultats est annoncé par une région aria-live ;
//   • les résultats sont de vrais liens, atteignables à la touche Tab ; Échap referme la liste.
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce.js';
import ResponsiveImage from '../ui/ResponsiveImage.jsx';
import { searchProducts } from '../../lib/catalog.js';
import { formatPrice } from '../../lib/format.js';

const MIN_CHARS = 2; // on ne lance la recherche qu'à partir de 2 caractères

export default function SearchBox({ variant = 'header', onNavigate }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false); // la liste de résultats est-elle affichée ?
  const [search, setSearch] = useState({ status: 'idle', results: [] }); // idle | loading | done

  // La valeur « debounced » ne change que 250 ms après la dernière frappe
  const debouncedQuery = useDebounce(query, 250);
  const term = query.trim();

  // Appel de la « fausse API » à chaque nouvelle valeur debounced
  useEffect(() => {
    const debounced = debouncedQuery.trim();
    if (debounced.length < MIN_CHARS) {
      setSearch({ status: 'idle', results: [] });
      return undefined;
    }

    // Drapeau d'annulation : si une réponse ancienne arrive après une nouvelle frappe,
    // on l'ignore (sinon l'affichage pourrait « revenir en arrière »).
    let cancelled = false;
    setSearch((prev) => ({ ...prev, status: 'loading' }));
    searchProducts(debounced).then((results) => {
      if (!cancelled) setSearch({ status: 'done', results });
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function finish() {
    setOpen(false);
    setQuery('');
    onNavigate?.(); // ex. fermer le tiroir de recherche mobile
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (term.length === 0) return;
    navigate(`/shop?q=${encodeURIComponent(term)}`);
    finish();
  }

  // Message lu par les lecteurs d'écran (et affiché en tête de la liste)
  let statusMessage = '';
  if (term.length >= MIN_CHARS) {
    if (search.status === 'loading') statusMessage = 'Recherche en cours…';
    else if (search.status === 'done') {
      statusMessage =
        search.results.length === 0
          ? `Aucun résultat pour « ${debouncedQuery.trim()} »`
          : `${search.results.length} résultat${search.results.length > 1 ? 's' : ''} affiché${search.results.length > 1 ? 's' : ''}`;
    }
  }

  const showPanel = open && term.length >= MIN_CHARS;
  const isHeader = variant === 'header';

  return (
    <div
      ref={containerRef}
      className={`relative ${isHeader ? 'w-56 lg:w-72' : 'w-full'}`}
      // Échap referme la liste ; quitter la zone (focus) la referme aussi
      onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        // containerRef peut être nul si le tiroir de recherche vient de se fermer (démontage pendant le blur)
        if (!containerRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <form role="search" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className={isHeader ? 'sr-only' : 'mb-2 block text-sm font-medium'}>
          Rechercher un produit
        </label>
        <div className="relative">
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand-muted" />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="Rechercher : améthyste, vase…"
            autoComplete="off"
            enterKeyHint="search"
            data-autofocus={isHeader ? undefined : ''} // le tiroir mobile place le focus ici à l'ouverture
            className="field pl-10"
          />
        </div>
      </form>

      {/* Région annoncée aux lecteurs d'écran : toujours présente dans le DOM pour être détectée */}
      <p role="status" className="sr-only">
        {statusMessage}
      </p>

      {showPanel && (
        <div
          className={`rounded-xl border border-white/15 bg-surface shadow-xl ${
            isHeader ? 'absolute right-0 top-full z-50 mt-2 max-h-[70vh] w-[22rem] overflow-y-auto' : 'mt-3'
          }`}
        >
          <p aria-hidden="true" className="border-b border-white/10 px-4 py-2 text-xs text-sand-muted">
            {statusMessage}
          </p>

          {search.results.length > 0 && (
            <>
              <ul>
                {search.results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.id}`}
                      onClick={finish}
                      className="flex min-h-[44px] items-center gap-3 px-4 py-2 hover:bg-white/5"
                    >
                      <span className="h-14 w-11 shrink-0 overflow-hidden rounded bg-surface-2">
                        {/* alt vide : image décorative, le nom du produit juste à côté fait foi */}
                        <ResponsiveImage src={product.images[0].src} alt="" sizes="44px" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{product.name}</span>
                        <span className="block text-xs text-sand-muted">
                          {product.type} · {formatPrice(product.price)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`/shop?q=${encodeURIComponent(term)}`}
                onClick={finish}
                className="flex min-h-[44px] items-center justify-center border-t border-white/10 px-4 text-sm font-semibold text-gold hover:underline"
              >
                Voir tous les résultats
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
