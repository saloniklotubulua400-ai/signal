import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
const KEY = 'signaldesk.cart';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const snapshot = (p) => ({
    id: p.id, name: p.name, slug: p.slug, category: p.category,
    price_cents: p.price_cents, currency: p.currency, billing_type: p.billing_type,
    fulfillment_type: p.fulfillment_type, stock: p.stock,
  });

  const clampQty = (qty, stock) => {
    let q = Math.max(1, Math.min(100, qty));
    if (stock !== null && stock !== undefined) q = Math.min(q, Math.max(stock, 1));
    return q;
  };

  const add = (product, qty = 1) => {
    if (product.stock === 0) return { ok: false, error: 'This product is out of stock.' };
    if (items.length && items[0].product.currency !== product.currency) {
      return { ok: false, error: `Your cart is in ${items[0].product.currency}. Check out first or clear the cart to buy in ${product.currency}.` };
    }
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === product.id);
      if (found) {
        return prev.map((i) => i.product.id === product.id
          ? { ...i, product: snapshot(product), qty: clampQty(i.qty + qty, product.stock) } : i);
      }
      return [...prev, { product: snapshot(product), qty: clampQty(qty, product.stock) }];
    });
    return { ok: true };
  };

  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => i.product.id === id ? { ...i, qty: clampQty(qty, i.product.stock) } : i));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.product.id !== id));
  const clear = () => setItems([]);

  const value = useMemo(() => ({
    items,
    add, setQty, remove, clear,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.qty * i.product.price_cents, 0),
    currency: items[0]?.product.currency || 'USD',
  }), [items]); // eslint-disable-line react-hooks/exhaustive-deps

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
