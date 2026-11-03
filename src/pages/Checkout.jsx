// src/pages/Checkout.jsx
// Page « Commande » : paiement LÉGER sans backend. Le client renseigne ses coordonnées, puis le site ouvre
// WhatsApp avec un message pré-rempli (articles, total, coordonnées) à envoyer à l'atelier.
// Aucun paiement n'est traité sur le site : l'atelier confirme ensuite disponibilité, règlement et livraison.
//
// ACCESSIBILITÉ DU FORMULAIRE (critères W3C) :
//   • chaque champ a un <label> VISIBLE relié par htmlFor/id ;
//   • les champs obligatoires sont signalés par le texte « (obligatoire) » et l'attribut required ;
//   • validation personnalisée : noValidate désactive les bulles du navigateur, remplacées par des messages
//     d'erreur reliés au champ via aria-describedby, avec aria-invalid ;
//   • à la soumission en erreur : un résumé annoncé (role="alert") et le focus sur le premier champ invalide ;
//   • autoComplete / inputMode : saisie facilitée au clavier mobile ; polices de 16 px (pas de zoom iOS).
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs.jsx';
import CartLine from '../components/cart/CartLine.jsx';
import OrderSummary from '../components/cart/OrderSummary.jsx';
import PromoForm from '../components/cart/PromoForm.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { useCart } from '../context/CartContext.jsx';
import { launchConfetti } from '../lib/confetti.js';
import { buildWhatsAppUrl, cartOrderMessage } from '../lib/whatsapp.js';

// Règles de validation : une fonction qui retourne le message d'erreur, ou '' si le champ est correct
const RULES = {
  name: (v) => (v.trim().length < 2 ? 'Indiquez votre nom (2 caractères minimum).' : ''),
  phone: (v) => (/^\+?[\d\s().-]{8,}$/.test(v.trim()) ? '' : 'Indiquez un numéro valide, par exemple +237 6 00 00 00 00.'),
  city: (v) => (v.trim().length < 2 ? 'Indiquez votre ville ou votre quartier.' : ''),
};

function Field({ id, label, required, error, hint, children }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label} {required ? <span className="text-sand-muted">(obligatoire)</span> : <span className="text-sand-muted">(facultatif)</span>}
      </label>
      {hint && (
        <p id={hintId} className="mb-1 text-xs text-sand-muted">
          {hint}
        </p>
      )}
      {/* On clone le champ pour lui donner les attributs ARIA : il est relié à l'indice ET à l'erreur */}
      {children({
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined,
      })}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  useDocumentMeta({
    title: 'Ma commande',
    description: 'Finalisez votre commande d’artisanat africain via WhatsApp.',
    path: '/commande',
    noindex: true, // page transactionnelle : à ne pas indexer
  });

  const { lines, totals, clearCart } = useCart();
  const idPrefix = useId();
  const [values, setValues] = useState({ name: '', phone: '', city: '', note: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const fieldId = (name) => `${idPrefix}-${name}`;

  // Mise à jour immuable de l'état : on recopie l'objet précédent au lieu de le modifier
  const update = (name) => (event) => setValues((prev) => ({ ...prev, [name]: event.target.value }));

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    Object.entries(RULES).forEach(([name, rule]) => {
      const message = rule(values[name]);
      if (message) nextErrors[name] = message;
    });
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      // Le focus va sur le premier champ en erreur : l'utilisateur au clavier ou au lecteur d'écran sait où corriger
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    // Ouverture de WhatsApp avec le message pré-rempli (dans le gestionnaire de l'événement : les navigateurs l'autorisent)
    window.open(buildWhatsAppUrl(cartOrderMessage(lines, totals, values)), '_blank', 'noopener,noreferrer');
    launchConfetti();
    setSent(true);
  }

  // Panier vide : message clair plutôt qu'un formulaire inutile
  if (lines.length === 0) {
    return (
      <div className="container-page py-12 text-center md:py-20">
        <h1 className="mb-4 text-4xl">{sent ? 'Merci !' : 'Votre panier est vide'}</h1>
        <p className="mx-auto mb-8 max-w-md text-sand-muted">
          {sent
            ? 'Votre commande a été préparée dans WhatsApp. Envoyez le message : l’atelier vous répond rapidement.'
            : 'Ajoutez une pièce pour préparer votre commande.'}
        </p>
        <Link to="/shop" className="btn btn-primary">
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;
  const inputProps = (name) => ({ value: values[name], onChange: update(name), className: 'field' });

  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ label: 'Accueil', to: '/' }, { label: 'Ma commande' }]} />
      <h1 className="mb-8 text-4xl md:text-5xl">Ma commande</h1>

      {/* Formulaire à gauche, récapitulatif à droite dès 1024px ; empilés sur mobile */}
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <h2 className="text-2xl">Vos coordonnées</h2>

          {/* Résumé des erreurs : role="alert" l'annonce immédiatement aux lecteurs d'écran */}
          {errorCount > 0 && (
            <p role="alert" className="rounded-lg border border-red-400 bg-red-950 p-3 text-sm text-red-200">
              Le formulaire contient {errorCount} erreur{errorCount > 1 ? 's' : ''}. Corrigez les champs indiqués puis validez à nouveau.
            </p>
          )}

          <Field id={fieldId('name')} label="Nom et prénom" required error={errors.name}>
            {(aria) => <input type="text" autoComplete="name" {...aria} {...inputProps('name')} />}
          </Field>

          <Field id={fieldId('phone')} label="Téléphone (WhatsApp)" required error={errors.phone} hint="Pour confirmer la livraison avec vous.">
            {(aria) => <input type="tel" inputMode="tel" autoComplete="tel" {...aria} {...inputProps('phone')} />}
          </Field>

          <Field id={fieldId('city')} label="Ville ou quartier de livraison" required error={errors.city}>
            {(aria) => <input type="text" autoComplete="address-level2" {...aria} {...inputProps('city')} />}
          </Field>

          <Field id={fieldId('note')} label="Un message pour l’atelier" error={undefined}>
            {(aria) => <textarea rows={3} {...aria} {...inputProps('note')} />}
          </Field>

          <button type="submit" className="btn btn-primary w-full py-3 text-base">
            <MessageCircle size={18} aria-hidden="true" />
            Envoyer la commande via WhatsApp
          </button>

          {sent && (
            <div role="status" className="rounded-lg border border-gold/50 bg-gold/10 p-4 text-sm">
              <p className="mb-2">
                WhatsApp s’est ouvert avec votre message. Envoyez-le pour valider la commande ; l’atelier vous répondra pour confirmer
                disponibilité, paiement et livraison.
              </p>
              <button type="button" onClick={clearCart} className="min-h-[44px] text-gold underline">
                Vider le panier maintenant
              </button>
            </div>
          )}
        </form>

        {/* Récapitulatif */}
        <aside aria-labelledby="summary-title" className="h-fit rounded-2xl border border-white/10 bg-surface p-5 lg:sticky lg:top-28">
          <h2 id="summary-title" className="mb-2 text-2xl">
            Récapitulatif
          </h2>
          <ul>
            {lines.map(({ product, quantity }) => (
              <CartLine key={product.id} product={product} quantity={quantity} />
            ))}
          </ul>
          <div className="mt-4 space-y-4">
            <PromoForm />
            <OrderSummary totals={totals} />
          </div>
        </aside>
      </div>
    </div>
  );
}
