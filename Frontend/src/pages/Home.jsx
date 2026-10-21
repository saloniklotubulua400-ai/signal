import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BadgeCheck, ShoppingBag, KeyRound, LifeBuoy, Lock, History } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { CATEGORIES } from '../lib/categories.js';
import { useProducts } from '../lib/useProducts.js';

const SAMPLE_KEY = 'SD7K-82MX-PT4N-ZB19';

function KeyReceipt() {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(reduce ? SAMPLE_KEY.length : 0);

  useEffect(() => {
    if (reduce) return undefined;
    let i = 0;
    const start = setTimeout(function tick() {
      i += 1;
      setShown(i);
      if (i < SAMPLE_KEY.length) setTimeout(tick, 70);
    }, 700);
    return () => clearTimeout(start);
  }, [reduce]);

  const done = shown >= SAMPLE_KEY.length;

  return (
    <div className="stage" aria-hidden="true">
      <div className="receipt">
        <div className="receipt-head">
          <span className="badge badge-fulfilled">Delivered</span>
          <span className="muted">Example order</span>
        </div>
        <div className="receipt-item">
          <div className="receipt-mini"><KeyRound size={22} /></div>
          <div>
            <strong>SMS credits, 10,000</strong>
            <div className="muted">1 pack</div>
          </div>
        </div>
        <div className="receipt-sep" />
        <div className="keybox">
          <span>{SAMPLE_KEY.slice(0, shown)}</span>
          {!done && <span className="caret" />}
        </div>
        <p className="receipt-note">Your balance and access keys appear in your account once payment is confirmed.</p>
      </div>
    </div>
  );
}

const FAQ = [
  ['How do I get what I bought?', 'Once your payment is confirmed, your credits, access keys or login details appear under Account, in the Keys and services tab. Services our team sets up by hand show as "Being prepared" until they are ready.'],
  ['How do I pay?', 'Payment is handled at checkout. Depending on how the store is set up, you either pay online or pay using the method we give you and we confirm it in your order.'],
  ['Which countries can I message?', 'It depends on the service and the destination country. Some countries need a registered sender name before messages are delivered. Contact us and we will tell you what your destination needs.'],
  ['What if something does not work?', 'Open your order, then email us the order number and what went wrong. We will fix it or make it right.'],
];

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { products, loading } = useProducts();
  const featured = products.slice(0, 4);

  const submit = (e) => {
    e.preventDefault();
    nav(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>Reach your customers by SMS, email and WhatsApp.</h1>
            <p className="lead">Messaging credits, verification codes and sender setup for your business. Buy online and find everything waiting in your account.</p>
            <form className="hero-search" onSubmit={submit} role="search">
              <Search size={20} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for a product or service" aria-label="Search products" />
              <button className="btn btn-primary" type="submit">Search</button>
            </form>
            <div className="hero-chips">
              {CATEGORIES.slice(0, 5).map((c) => (
                <Link key={c.key} to={`/shop?category=${c.key}`} className="chip-link" style={{ '--cat': c.color, '--cat-tint': c.tint }}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <KeyReceipt />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Browse by category</h2>
            <Link to="/shop" className="textlink">See everything</Link>
          </div>
          <div className="cat-grid">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} to={`/shop?category=${c.key}`} className="cat-tile" style={{ '--cat': c.color, '--cat-tint': c.tint }}>
                  <span className="cat-icon"><Icon size={24} /></span>
                  <span className="cat-name">{c.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Newest in the store</h2>
            <Link to="/shop" className="textlink">Shop all</Link>
          </div>
          {loading ? (
            <div className="grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton skeleton-card" />)}</div>
          ) : featured.length ? (
            <div className="grid">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <div className="empty">
              <h3>The shelves are empty</h3>
              <p>Products you add in the admin area will show up here.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How buying works</h2>
          <ol className="steps">
            <li className="step"><span className="step-num">1</span><h3>Pick a service</h3><p>Choose the credits or setup you need. Prices are shown up front, with no surprises at checkout.</p></li>
            <li className="step"><span className="step-num">2</span><h3>Pay at checkout</h3><p>Place your order and complete the payment. We confirm it against the exact amount of your order.</p></li>
            <li className="step"><span className="step-num">3</span><h3>Start sending</h3><p>Your balance, keys and login details show up in your account, ready to use.</p></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container trust">
          <div className="trust-item"><BadgeCheck size={26} /><div><strong>Delivered automatically</strong><p>Most orders land in your account with no waiting.</p></div></div>
          <div className="trust-item"><History size={26} /><div><strong>Everything in one place</strong><p>Orders, keys and expiry dates in your account.</p></div></div>
          <div className="trust-item"><Lock size={26} /><div><strong>Prices set by the server</strong><p>Your cart cannot change what you are charged.</p></div></div>
          <div className="trust-item"><LifeBuoy size={26} /><div><strong>A person on the other end</strong><p>Services we set up by hand get personal attention.</p></div></div>
        </div>
      </section>

      <section className="section">
        <div className="container faq-wrap">
          <h2>Questions people ask</h2>
          <div className="faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Ready to start reaching customers?</h2>
              <p>Browse the full catalog and check out in a minute.</p>
            </div>
            <Link to="/shop" className="btn btn-accent btn-lg"><ShoppingBag size={20} /> Start shopping</Link>
          </div>
        </div>
      </section>
    </>
  );
}
