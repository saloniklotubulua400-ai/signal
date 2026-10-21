import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { categoryMeta, metaByKey } from '../lib/categories.js';
import { useProducts } from '../lib/useProducts.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { products, loading, error } = useProducts();

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'new';

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const presentKeys = useMemo(
    () => [...new Set(products.map((p) => categoryMeta(p.category).key))],
    [products]
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const hay = `${p.name} ${p.description || ''} ${p.category || ''}`.toLowerCase();
      return (!term || hay.includes(term)) && (!category || categoryMeta(p.category).key === category);
    });
    const sorted = [...filtered];
    if (sort === 'low') sorted.sort((a, b) => a.price_cents - b.price_cents);
    else if (sort === 'high') sorted.sort((a, b) => b.price_cents - a.price_cents);
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, q, category, sort]);

  const clear = () => setParams({}, { replace: true });
  const activeMeta = category ? metaByKey(category) : null;

  return (
    <div className="page container">
      <h1 className="page-title">{activeMeta ? activeMeta.label : 'Shop'}</h1>

      <div className="toolbar">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search products" aria-label="Search products" />
          {q && <button type="button" onClick={() => set('q', '')} aria-label="Clear search"><X size={16} /></button>}
        </label>
        <label className="sort-field">
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => set('sort', e.target.value === 'new' ? '' : e.target.value)}>
            <option value="new">Newest first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="filter-chips" role="group" aria-label="Filter by category">
        <button className={`chip-btn ${!category ? 'on' : ''}`} onClick={() => set('category', '')}>All</button>
        {presentKeys.map((key) => {
          const m = metaByKey(key);
          return (
            <button key={key} className={`chip-btn ${category === key ? 'on' : ''}`} style={{ '--cat': m.color, '--cat-tint': m.tint }} onClick={() => set('category', key)}>
              {m.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="alert alert-error">{error}</div>
      ) : loading ? (
        <div className="grid">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="skeleton skeleton-card" />)}</div>
      ) : list.length ? (
        <>
          <p className="muted result-count">{list.length} {list.length === 1 ? 'product' : 'products'}</p>
          <div className="grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </>
      ) : (
        <div className="empty">
          {products.length === 0 ? (
            <>
              <h3>No products yet</h3>
              <p>{isAdmin ? 'Add products or load the sample set from the admin area.' : 'Check back soon.'}</p>
              {isAdmin && <Link to="/admin" className="btn btn-primary">Open admin</Link>}
            </>
          ) : (
            <>
              <h3>Nothing matches that search</h3>
              <p>Try a different word or remove a filter.</p>
              <button className="btn btn-ghost" onClick={clear}>Clear filters</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
