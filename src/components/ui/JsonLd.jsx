// src/components/ui/JsonLd.jsx
// Injecte des données structurées Schema.org (JSON-LD) dans le <head> de la page.
// Les moteurs de recherche s'en servent pour afficher prix, disponibilité et note dans les résultats.
// Le script est retiré automatiquement quand on quitte la page.
import { useEffect } from 'react';

export default function JsonLd({ data }) {
  // On compare la version texte : si l'objet est recréé à chaque rendu mais identique, l'effet ne se relance pas
  const json = JSON.stringify(data);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = json;
    document.head.appendChild(script);
    return () => script.remove();
  }, [json]);

  return null; // ce composant n'affiche rien
}
