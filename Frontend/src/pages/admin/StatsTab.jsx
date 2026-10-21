import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { money, statusLabel } from '../../lib/format.js';

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/admin/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return <div className="spinner" aria-label="Loading" />;

  const revenue = Object.entries(stats.revenue_cents || {});

  return (
    <>
      <div className="stats-grid">
        <div className="stat">
          <span className="muted">Revenue (paid orders)</span>
          {revenue.length ? revenue.map(([cur, cents]) => <strong key={cur}>{money(cents, cur)}</strong>) : <strong>{money(0)}</strong>}
        </div>
        <div className="stat"><span className="muted">Customers</span><strong>{stats.customers ?? 0}</strong></div>
        <div className="stat stat-alert"><span className="muted">Waiting for delivery</span><strong>{stats.pending_deliveries ?? 0}</strong></div>
      </div>

      <h2 className="sub-title">Orders by status</h2>
      <div className="stats-grid">
        {Object.entries(stats.orders_by_status || {}).length === 0 && <p className="muted">No orders yet.</p>}
        {Object.entries(stats.orders_by_status || {}).map(([status, n]) => (
          <div key={status} className="stat"><span className={`badge badge-${status}`}>{statusLabel(status)}</span><strong>{n}</strong></div>
        ))}
      </div>
    </>
  );
}
