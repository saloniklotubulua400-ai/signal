import { useCallback, useEffect, useState } from 'react';
import { EyeOff, Pencil, Plus, Sparkles } from 'lucide-react';
import { api } from '../../lib/api.js';
import { CATEGORIES } from '../../lib/categories.js';
import { billingLabel, money } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

const SAMPLES = [
  { name: 'SMS credits, 1,000 messages', category: 'sms', price_cents: 2500, billing_type: 'one_time', fulfillment_type: 'license_key', description: 'Prepaid credits for transactional and marketing text messages.' },
  { name: 'SMS credits, 10,000 messages', category: 'sms', price_cents: 20000, billing_type: 'one_time', fulfillment_type: 'license_key', description: 'A bigger pack at a lower price per message.' },
  { name: 'Email sending plan, monthly', category: 'email', price_cents: 2900, billing_type: 'monthly', fulfillment_type: 'license_key', description: 'Send transactional and marketing email from your own domain.' },
  { name: 'Email sending plan, yearly', category: 'email', price_cents: 29000, billing_type: 'yearly', fulfillment_type: 'license_key', description: 'The same plan paid yearly, two months free.' },
  { name: 'WhatsApp Business setup', category: 'whatsapp', price_cents: 15000, billing_type: 'one_time', fulfillment_type: 'manual', description: 'Our team connects your number and prepares your first message templates.' },
  { name: 'Verification codes, 5,000', category: 'verify', price_cents: 3500, billing_type: 'one_time', fulfillment_type: 'license_key', description: 'One-time passcodes for sign-ups and logins.' },
  { name: 'Sender ID registration', category: 'sms', price_cents: 9000, billing_type: 'one_time', fulfillment_type: 'manual', description: 'We register your sender name with the networks that require it.' },
  { name: 'Voice minutes, 500', category: 'voice', price_cents: 4000, billing_type: 'one_time', fulfillment_type: 'license_key', description: 'Prepaid minutes for outbound calls.' },
];

const EMPTY = { name: '', category: '', price: '', currency: 'USD', billing_type: 'one_time', fulfillment_type: 'license_key', stock: '', description: '' };

function ProductForm({ initial, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState(initial ? {
    name: initial.name, category: initial.category || '', price: String(initial.price_cents / 100),
    currency: initial.currency, billing_type: initial.billing_type, fulfillment_type: initial.fulfillment_type,
    stock: initial.stock ?? '', description: initial.description || '',
  } : EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const price = Math.round(parseFloat(f.price) * 100);
    if (!f.name.trim()) return setError('Give the product a name.');
    if (!Number.isFinite(price) || price < 0) return setError('Enter a valid price, for example 19.99.');
    const stock = f.stock === '' ? null : parseInt(f.stock, 10);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return setError('Stock must be a whole number, or empty for unlimited.');

    const body = {
      name: f.name.trim(), category: f.category.trim() || null, price_cents: price,
      currency: f.currency.trim().toUpperCase() || 'USD', billing_type: f.billing_type,
      fulfillment_type: f.fulfillment_type, stock, description: f.description.trim() || null,
    };
    setBusy(true);
    try {
      if (initial) await api.patch(`/api/products/${initial.id}`, body);
      else await api.post('/api/products', body);
      toast(initial ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{initial ? 'Edit product' : 'New product'}</h2>
      <div className="form-grid">
        <div className="field span-2"><label htmlFor="p-name">Name</label><input id="p-name" value={f.name} onChange={set('name')} required /></div>
        <div className="field">
          <label htmlFor="p-cat">Category</label>
          <input id="p-cat" list="cats" value={f.category} onChange={set('category')} placeholder="sms, email, whatsapp..." />
          <datalist id="cats">{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</datalist>
        </div>
        <div className="field"><label htmlFor="p-price">Price</label><input id="p-price" inputMode="decimal" value={f.price} onChange={set('price')} placeholder="19.99" required /></div>
        <div className="field"><label htmlFor="p-cur">Currency</label><input id="p-cur" maxLength={3} value={f.currency} onChange={set('currency')} /></div>
        <div className="field">
          <label htmlFor="p-bill">Billing</label>
          <select id="p-bill" value={f.billing_type} onChange={set('billing_type')}>
            <option value="one_time">One-time</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-ful">Delivery</label>
          <select id="p-ful" value={f.fulfillment_type} onChange={set('fulfillment_type')}>
            <option value="license_key">Automatic license key</option><option value="manual">I deliver it by hand</option>
          </select>
        </div>
        <div className="field"><label htmlFor="p-stock">Stock (empty = unlimited)</label><input id="p-stock" inputMode="numeric" value={f.stock} onChange={set('stock')} /></div>
        <div className="field span-2"><label htmlFor="p-desc">Description</label><textarea id="p-desc" rows={3} value={f.description} onChange={set('description')} /></div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button>
      </div>
    </form>
  );
}

export default function ProductsTab() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(() => {
    api.get('/api/products', { auth: false }).then(setProducts).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const hide = async (p) => {
    if (!window.confirm(`Hide "${p.name}" from the store? Past orders keep working.`)) return;
    try { await api.del(`/api/products/${p.id}`); toast('Product hidden'); load(); } catch (e) { toast(e.message, 'error'); }
  };

  const addSamples = async () => {
    setSeeding(true);
    let added = 0;
    for (const s of SAMPLES) {
      try { await api.post('/api/products', { ...s, currency: 'USD' }); added += 1; } catch { /* already exists */ }
    }
    toast(added ? `Added ${added} sample products` : 'Sample products already exist');
    setSeeding(false);
    load();
  };

  if (editing) {
    return <ProductForm initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />;
  }

  return (
    <>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> New product</button>
        <button className="btn btn-ghost" onClick={addSamples} disabled={seeding}><Sparkles size={18} /> {seeding ? 'Adding...' : 'Add sample products'}</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {!error && !products && <div className="spinner" aria-label="Loading" />}
      {products && !products.length && <div className="empty"><h3>No products yet</h3><p>Create one, or add the sample set to see how the store looks.</p></div>}
      {products && products.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Delivery</th><th>Stock</th><th /></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><div className="muted">{p.category || 'No category'}</div></td>
                  <td>{money(p.price_cents, p.currency)} <span className="muted">{billingLabel(p.billing_type)}</span></td>
                  <td>{p.fulfillment_type === 'license_key' ? 'Automatic key' : 'By hand'}</td>
                  <td>{p.stock === null ? 'Unlimited' : p.stock}</td>
                  <td className="actions-cell">
                    <button className="icon-btn" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}><Pencil size={18} /></button>
                    <button className="icon-btn" onClick={() => hide(p)} aria-label={`Hide ${p.name}`}><EyeOff size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted small">Hidden products leave the store but stay in the database. Showing them again needs a small server update, which we can add as a later step.</p>
    </>
  );
}
