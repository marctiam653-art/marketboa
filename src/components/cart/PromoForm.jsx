// src/components/cart/PromoForm.jsx
// Champ « Code promo » du panier.
//
// Accessibilité des formulaires (critères du W3C) :
//   • <label> VISIBLE associé au champ (htmlFor / id) ;
//   • le message de résultat est relié au champ par aria-describedby ;
//   • aria-invalid signale l'erreur ; le message est annoncé (role="status") sans déplacer le focus ;
//   • champ en 16 px (classe .field) : pas de zoom automatique sur iOS.
import { useId, useState } from 'react';
import { Check, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { launchConfetti } from '../../lib/confetti.js';

export default function PromoForm() {
  const { promoCode, applyPromo, removePromo } = useCart();
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null); // { ok, message } ou null
  const inputId = useId();
  const messageId = useId();

  function handleSubmit(event) {
    event.preventDefault(); // pas de rechargement de page : on traite le code en JavaScript
    if (!value.trim()) return;
    const outcome = applyPromo(value);
    setResult(outcome);
    if (outcome.ok) {
      setValue('');
      launchConfetti(); // 🎉 petite célébration dorée
    }
  }

  // Code déjà appliqué : on affiche un récapitulatif avec un bouton pour le retirer
  if (promoCode) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2">
        <p className="flex items-center gap-2 text-sm">
          <Check size={16} aria-hidden="true" className="text-gold" />
          Code <strong>{promoCode}</strong> appliqué
        </p>
        <button type="button" onClick={removePromo} className="min-h-[44px] px-2 text-sm text-gold underline">
          Retirer
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Tag size={14} aria-hidden="true" />
        Code promo
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setResult(null);
          }}
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={result && !result.ok ? 'true' : undefined}
          aria-describedby={result ? messageId : undefined}
          className="field"
        />
        <button type="submit" className="btn btn-outline shrink-0">
          Appliquer
        </button>
      </div>
      {/* Message annoncé aux lecteurs d'écran ; rouge clair (≥ 4,5:1 sur fond sombre) en cas d'erreur */}
      <p id={messageId} role="status" className={`mt-1 min-h-[1.25rem] text-sm ${result?.ok === false ? 'text-red-300' : 'text-gold'}`}>
        {result?.message}
      </p>
    </form>
  );
}
