// src/components/ui/SectionHeading.jsx
// Titre de section homogène : petit surtitre doré + titre H2 + lien d'action optionnel.
// Le niveau de titre est H2 par défaut : la hiérarchie H1 → H2 → H3 reste logique sur chaque page.
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ id, eyebrow, title, actionLabel, actionTo }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>}
        <h2 id={id} className="text-3xl md:text-4xl">
          {title}
        </h2>
      </div>
      {actionTo && (
        <Link to={actionTo} className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-gold hover:underline">
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
