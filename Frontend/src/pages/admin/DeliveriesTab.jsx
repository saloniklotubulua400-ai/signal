import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { dateShort, shortId } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

function DeliveryCard({ license, onDone }) {
  const toast = useToast();
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!details.trim()) return;
    setBusy(true);
    try {
      await api.patch(`/api/admin/licenses/${license.id}/deliver`, { delivery_details: details.trim() });
      toast('Delivered to the customer');
      onDone();
    } catch (err) {
      toast(err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <form className="license" onSubmit={send}>
      <div className="license-top">
        <strong>{license.products?.name || 'Service'}</strong>
        <span className="muted">Order {shortId(license.order_id)} &middot; {dateShort(license.created_at)}</span>
      </div>
      <div className="field">
        <label htmlFor={`d-${license.id}`}>Login details or instructions for the customer</label>
        <textarea id={`d-${license.id}`} rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Username, password, setup link..." />
      </div>
      <button className="btn btn-primary btn-sm" disabled={busy || !details.trim()}>{busy ? 'Sending...' : 'Deliver'}</button>
    </form>
  );
}

export default function DeliveriesTab() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/api/admin/licenses?status=pending_delivery').then(setRows).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!rows) return <div className="spinner" aria-label="Loading" />;
  if (!rows.length) return <div className="empty"><h3>Nothing waiting</h3><p>Services you deliver by hand will appear here after they are paid.</p></div>;

  return <div className="license-list">{rows.map((l) => <DeliveryCard key={l.id} license={l} onDone={load} />)}</div>;
}
