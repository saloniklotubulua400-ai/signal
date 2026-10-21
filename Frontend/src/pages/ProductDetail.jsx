import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Zap, UserCheck, CalendarClock } from 'lucide-react';
import ProductCover from '../components/ProductCover.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../lib/api.js';
import { categoryMeta } from '../lib/categories.js';
import { billingLabel, money } from '../lib/format.js';
import { useProducts } from '../lib/useProducts.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const toast = useToast();
  const { products } = useProducts();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let alive = true;
    setProduct(null); setError(''); setQty(1);
    api.get(`/api/products/${encodeURIComponent(slug)}`, { auth: false })
      .then((p) => alive && setProduct(p))
      .catch((e) => alive && setError(e.status === 404 ? 'We could not find that product. It may have been removed.' : e.message));
    return () => { alive = false; };
  }, [slug]);

  if (error) {
    return (
      <div className="page container">
        <div className="empty"><h1>Product not found</h1><p>{error}</p><Link className="btn btn-primary" to="/shop">Back to the shop</Link></div>
      </div>
    );
  }
  if (!product) {
    return <div className="page container"><div className="detail"><div className="skeleton skeleton-cover" /><div className="skeleton skeleton-text" /></div></div>;
  }

  const meta = categoryMeta(product.category);
  const soldOut = product.stock === 0;
  const maxQty = product.stock !== null && product.stock !== undefined ? Math.max(product.stock, 1) : 100;
  const related = products.filter((p) => p.id !== product.id && categoryMeta(p.category).key === meta.key).slice(0, 4);

  const addToCart = (goToCart) => {
    const res = add(product, qty);
    if (!res.ok) { toast(res.error, 'error'); return; }
    if (goToCart) nav('/cart'); else toast(`${product.name} added to cart`);
  };

  const auto = product.fulfillment_type === 'license_key';

  return (
    <div className="page container">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link> <span>/</span> <Link to={`/shop?category=${meta.key}`}>{meta.label}</Link>
      </nav>

      <div className="detail" style={{ '--cat': meta.color, '--cat-tint': meta.tint }}>
        <div className="detail-cover"><ProductCover product={product} size="lg" /></div>

        <div className="detail-info">
          <span className="chip">{meta.label}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">
            <span className="price price-lg">{money(product.price_cents, product.currency)}</span>
            <span className="per">{billingLabel(product.billing_type)}</span>
          </div>

          {product.description && <p className="detail-desc">{product.description}</p>}

          <ul className="facts">
            <li>{auto ? <Zap size={20} /> : <UserCheck size={20} />}
              <span>{auto ? 'Your key appears in your account as soon as payment is confirmed.' : 'Our team sets this up after payment. You will see it in your account when it is ready.'}</span>
            </li>
            {product.billing_type !== 'one_time' && (
              <li><CalendarClock size={20} /><span>Valid for one {product.billing_type === 'monthly' ? 'month' : 'year'} from purchase.</span></li>
            )}
          </ul>

          {product.stock !== null && product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <p className="low-stock">Only {product.stock} left</p>
          )}

          {soldOut ? (
            <div className="alert alert-info">This product is out of stock right now.</div>
          ) : (
            <div className="buy-row">
              <div className="qty" role="group" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(true)}>Buy now</button>
              <button className="btn btn-ghost btn-lg" onClick={() => addToCart(false)}><ShoppingBag size={18} /> Add to cart</button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="related">
          <h2>More in {meta.label}</h2>
          <div className="grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
