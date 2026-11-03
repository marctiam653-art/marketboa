// src/context/CartContext.jsx
// État global du panier (avec persistance localStorage) + état d'ouverture du tiroir panier.
// Pas de backend : le panier sert à préparer un message de commande WhatsApp.
//
// Règle métier « pièce unique » : un produit unique ne peut être ajouté qu'UNE fois (quantité max = 1).
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { getProduct, AVAILABILITY } from '../lib/catalog.js';
import { SITE } from '../config/site.js';

const CartContext = createContext(null);

/** Quantité maximale commandable pour un produit. */
export function maxQuantity(product) {
  if (product.unique) return 1; // pièce unique
  if (product.availability === 'PreOrder') return 5; // fabrication à la demande
  return Math.max(1, product.stock);
}

export function CartProvider({ children }) {
  // items : [{ id: 'collier-aurore', quantity: 1 }] — on ne stocke QUE l'id et la quantité,
  // les détails (prix, nom) sont relus dans le catalogue : pas de prix périmé dans le stockage.
  const [items, setItems] = useLocalStorage('mboa-cart', []);
  const [promoCode, setPromoCode] = useLocalStorage('mboa-promo', null);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  /** Ajoute un produit (ou +1 s'il y est déjà, dans la limite du stock). */
  const addItem = useCallback(
    (product) => {
      if (!AVAILABILITY[product.availability]?.canBuy) return;
      // Mise à jour fonctionnelle : on ne mute jamais le tableau précédent
      setItems((prev) => {
        const existing = prev.find((it) => it.id === product.id);
        if (!existing) return [...prev, { id: product.id, quantity: 1 }];
        const next = Math.min(existing.quantity + 1, maxQuantity(product));
        return prev.map((it) => (it.id === product.id ? { ...it, quantity: next } : it));
      });
      setIsOpen(true); // feedback visuel : on ouvre le tiroir
    },
    [setItems],
  );

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((it) => it.id !== id)), [setItems]);

  const setQuantity = useCallback(
    (id, quantity) => {
      const product = getProduct(id);
      if (!product) return;
      const clamped = Math.max(1, Math.min(quantity, maxQuantity(product)));
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: clamped } : it)));
    },
    [setItems],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
  }, [setItems, setPromoCode]);

  /** Valide un code promo. Retourne { ok, message } pour que l'interface affiche le résultat. */
  const applyPromo = useCallback(
    (rawCode) => {
      const code = rawCode.trim().toUpperCase();
      if (code === SITE.promo.code) {
        setPromoCode(code);
        return { ok: true, message: `Code ${code} appliqué : -${SITE.promo.percent} %` };
      }
      return { ok: false, message: 'Ce code promo n’est pas valide.' };
    },
    [setPromoCode],
  );

  const removePromo = useCallback(() => setPromoCode(null), [setPromoCode]);

  // Valeurs dérivées recalculées uniquement quand le panier change
  const value = useMemo(() => {
    // Lignes enrichies avec le produit complet ; on écarte les produits disparus du catalogue ou vendus
    const lines = items
      .map((it) => ({ product: getProduct(it.id), quantity: it.quantity }))
      .filter((line) => line.product && AVAILABILITY[line.product.availability].canBuy);

    const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
    const discount = promoCode === SITE.promo.code ? Math.round((subtotal * SITE.promo.percent) / 100) : 0;
    const afterDiscount = subtotal - discount;
    // shipping = 0 → offerte ; null → à confirmer avec l'atelier selon l'adresse
    const shipping = afterDiscount >= SITE.freeShippingThreshold ? 0 : null;

    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      totals: { subtotal, discount, shipping, total: afterDiscount, promoCode },
      promoCode,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      applyPromo,
      removePromo,
      inCart: (id) => items.some((it) => it.id === id),
    };
  }, [items, promoCode, isOpen, openCart, closeCart, addItem, removeItem, setQuantity, clearCart, applyPromo, removePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook d'accès au panier : à utiliser dans n'importe quel composant sous <CartProvider>. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>');
  return ctx;
}
