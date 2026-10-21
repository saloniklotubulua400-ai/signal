import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import ProductCover from './ProductCover.jsx';
import { categoryMeta } from '../lib/categories.js';
import { billingLabel, money } from '../lib/format.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const toast = useToast();
  const meta = categoryMeta(product.category);
  const soldOut = product.stock === 0;

  const onAdd = () => {
    const res = add(product, 1);
    if (res.ok) toast(`${product.name} added to cart`);
    else toast(res.error, 'error');
  };

  return (
    <article className="ticket" style={{ '--cat': meta.color, '--cat-tint': meta.tint }}>
      <Link to={`/product/${product.slug}`} className="ticket-link" aria-label={product.name}>
        <ProductCover product={product} />
      </Link>
      <div className="ticket-body">
        <span className="chip">{meta.label}</span>
        <h3 className="ticket-name"><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
        {product.description && <p className="ticket-desc">{product.description}</p>}
        <div className="ticket-foot">
          <div>
            <div className="price">{money(product.price_cents, product.currency)}</div>
            <div className="per">{billingLabel(product.billing_type)}</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onAdd} disabled={soldOut} aria-label={`Add ${product.name} to cart`}>
            {soldOut ? 'Sold out' : <><Plus size={16} /> Add</>}
          </button>
        </div>
      </div>
    </article>
  );
}
