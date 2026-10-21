import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { dateShort, money, shortId, statusLabel } from '../../lib/format.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function OrdersTab() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(() => {
    setError('');
    api.get(`/api/admin/orders${status ? `?status=${status}` : ''}`).then(setOrders).catch((e) => setError(e.message));
  }, [status]);

  useEffect(() => { setOrders(null); load(); }, [load]);

  const markPaid = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/api/admin/orders/${id}/mark-paid`);
      toast('Order marked as paid and delivered');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusyId('');
    }
  };

  return (
    <>
      <div className="toolbar">
        <label className="sort-field">
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All orders</option>
            <option value="pending">Waiting for payment</option>
            <option value="paid">Paid</option>
            <option value="fulfilled">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <button className="btn btn-ghost" onClick={load}>Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!error && !orders && <div className="spinner" aria-label="Loading" />}
      {orders && !orders.length && <div className="empty"><h3>No orders here</h3></div>}
      {orders && orders.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th /></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>{shortId(o.id)}</strong><div className="muted">{o.payment_provider}</div></td>
                  <td>{dateShort(o.created_at)}</td>
                  <td>{o.order_items?.map((i) => `${i.product_name} x${i.quantity}`).join(', ')}</td>
                  <td>{money(o.total_cents, o.currency)}</td>
                  <td><span className={`badge badge-${o.status}`}>{statusLabel(o.status)}</span></td>
                  <td>
                    {o.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" disabled={busyId === o.id} onClick={() => markPaid(o.id)}>
                        {busyId === o.id ? 'Working...' : 'Mark as paid'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
