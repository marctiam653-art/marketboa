// src/components/layout/MobileMenu.jsx
// Menu hamburger (mobile et tablette) : tiroir à gauche contenant la navigation principale
// et les moyens de contact. Il se referme dès qu'on choisit un lien.
import { NavLink } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import Drawer from '../ui/Drawer.jsx';
import { NAV_LINKS } from '../../config/navigation.js';
import { SITE } from '../../config/site.js';
import { buildWhatsAppUrl } from '../../lib/whatsapp.js';

export default function MobileMenu({ open, onClose }) {
  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Navigation mobile" className="flex-1 px-4 py-4">
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={onClose}
                // Zone tactile large (min-h-[48px]) : confortable au pouce
                className={({ isActive }) =>
                  `flex min-h-[48px] items-center border-b border-white/10 font-serif text-xl ${
                    isActive ? 'text-gold' : 'hover:text-gold'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Contacts : pb-[env(safe-area-inset-bottom)] évite que la barre gestuelle masque les liens */}
      <div className="space-y-2 border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <a
          href={buildWhatsAppUrl(`Bonjour ${SITE.name}, j'ai une question.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary w-full"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Écrire sur WhatsApp
          <span className="sr-only"> (s'ouvre dans un nouvel onglet)</span>
        </a>
        <a href={`mailto:${SITE.email}`} className="btn btn-outline w-full">
          <Mail size={18} aria-hidden="true" />
          {SITE.email}
        </a>
      </div>
    </Drawer>
  );
}
