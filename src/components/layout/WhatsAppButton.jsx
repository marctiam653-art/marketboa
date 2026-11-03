// src/components/layout/WhatsAppButton.jsx
// Bouton WhatsApp flottant (présent dans le gabarit fourni) : contact direct avec l'atelier.
//
// Position responsive :
//   • mobile / tablette : remonté au-dessus du micro-dock (bottom = hauteur du dock + zone de sécurité iOS/Android) ;
//   • ordinateur (lg:) : en bas à gauche, à 1,5rem du bord, comme dans le gabarit d'origine.
// Couleur : vert foncé #128c7e avec icône blanche = 4,1:1 (≥ 3:1 exigé pour un pictogramme, WCAG 1.4.11).
import { MessageCircle } from 'lucide-react';
import { SITE } from '../../config/site.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';

export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl(`Bonjour ${SITE.name}, j'aimerais avoir des informations.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec l'atelier sur WhatsApp (s'ouvre dans un nouvel onglet)"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-110 motion-reduce:transition-none lg:bottom-6 lg:left-6"
    >
      <MessageCircle size={28} aria-hidden="true" />
    </a>
  );
}
