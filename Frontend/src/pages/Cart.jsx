import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import ProductCover from '../components/ProductCover.jsx';
import { api } from '../lib/api.js';
import { billingLabel, money } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, setQty, remove, clear, total, currency, count } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const placeOrder = async () => {
    setBusy(true); setError('');
    try {
      const res = await api.post('/api/orders', {
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.qty })),
      });
      clear();
      if (res.payment?.checkout_url) {
        window.location.href = res.payment.checkout_url;
        return;
      }
      nav(`/orders/${res.order.id}`);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <div className="page container">
        <div className="empty">
          <ShoppingBag size={40} />
          <h1>Your cart is empty</h1>
          <p>Find something you need and add it here.</p>
          <Link to="/shop" className="btn btn-primary">Browse the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 className="page-title">Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map(({ product, qty }) => (
            <li key={product.id} className="cart-row">
              <Link to={`/product/${product.slug}`}><ProductCover product={product} size="sm" /></Link>
              <div className="cart-info">
                <Link to={`/product/${product.slug}`} className="cart-name">{product.name}</Link>
                <span className="muted">{money(product.price_cents, product.currency)} {billingLabel(product.billing_type)}</span>
              </div>
              <div className="qty qty-sm" role="group" aria-label={`Quantity for ${product.name}`}>
                <button onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
              </div>
              <div className="cart-line-total">{money(product.price_cents * qty, product.currency)}</div>
              <button className="icon-btn" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>

        <aside className="summary">
          <h2>Order summary</h2>
          <div className="summary-line"><span>Items ({count})</span><span>{money(total, currency)}</span></div>
          <div className="summary-line summary-total"><span>Total</span><span>{money(total, currency)}</span></div>
          {error && <div className="alert alert-error">{error}</div>}
          {user ? (
            <button className="btn btn-primary btn-lg btn-block" onClick={placeOrder} disabled={busy}>
              {busy ? 'Placing order...' : 'Place order'}
            </button>
          ) : (
            <Link className="btn btn-primary btn-lg btn-block" to="/login?next=/cart">Log in to check out</Link>
          )}
          <p className="muted small">The final price is calculated by the server when you place the order.</p>
          <button className="linklike" onClick={clear}>Clear cart</button>
        </aside>
      </div>
    </div>
  );
}
