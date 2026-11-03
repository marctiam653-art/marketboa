// src/components/layout/AnnouncementBar.jsx
// Bandeau jaune en haut de page (équivalent du bandeau « Free shipping » du gabarit fourni),
// complété par un code promo à copier : un clic copie le code et déclenche des confettis dorés.
//
// Accessibilité :
//   • le bandeau se ferme avec un bouton 44×44 px ; le choix est mémorisé le temps de la session ;
//   • le résultat de la copie est annoncé (role="status") ;
//   • texte noir sur or = contraste ≈ 8:1.
import { useState } from 'react';
import { Copy, X } from 'lucide-react';
import { SITE } from '../../config/site.js';
import { formatPrice } from '../../lib/format.js';
import { launchConfetti } from '../../lib/confetti.js';

const STORAGE_KEY = 'mboa-banner-closed';

// Lecture protégée : sessionStorage peut être indisponible (navigation privée stricte)
function wasClosed() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(() => !wasClosed());
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(SITE.promo.code);
    } catch {
      /* presse-papiers indisponible : on célèbre quand même, le code reste visible à l'écran */
    }
    setCopied(true);
    launchConfetti();
    setTimeout(() => setCopied(false), 3000);
  }

  function close() {
    setVisible(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignoré */
    }
  }

  if (!visible) return null;

  return (
    <div className="bg-gold text-ink">
      {/* pr-12 : réserve la place du bouton de fermeture, positionné en absolu à droite */}
      <div className="container-page relative flex flex-col items-center justify-center gap-x-4 gap-y-1 py-2 pr-12 text-center text-sm font-medium sm:flex-row">
        <p>
          <span aria-hidden="true">🎉 </span>
          Livraison offerte dès {formatPrice(SITE.freeShippingThreshold)} d’achat
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-gold hover:bg-black"
        >
          <Copy size={14} aria-hidden="true" />
          Code {SITE.promo.code} : −{SITE.promo.percent} %
          <span className="sr-only">. Copier le code</span>
        </button>
        <span role="status" className="min-w-[5rem] text-xs font-semibold">
          {copied ? 'Code copié !' : ''}
        </span>

        <button
          type="button"
          onClick={close}
          aria-label="Fermer le bandeau d’annonce"
          className="icon-btn absolute right-1 top-1/2 -translate-y-1/2 !text-ink hover:!text-ink/70"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
