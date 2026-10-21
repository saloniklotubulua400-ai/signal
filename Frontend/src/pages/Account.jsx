import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import License from '../components/License.jsx';
import { api } from '../lib/api.js';
import { dateShort, money, shortId, statusLabel } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('licenses');
  const [orders, setOrders] = useState(null);
  const [licenses, setLicenses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/api/orders'), api.get('/api/licenses')])
      .then(([o, l]) => { if (alive) { setOrders(o); setLicenses(l); } })
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, []);

  return (
    <div className="page container">
      <div className="account-head">
        <div>
          <h1 className="page-title">My account</h1>
          <p className="muted">{user?.email}</p>
        </div>
        <button className="btn btn-ghost" onClick={logout}><LogOut size={18} /> Log out</button>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'licenses'} className="tab" onClick={() => setTab('licenses')}>Keys and services</button>
        <button role="tab" aria-selected={tab === 'orders'} className="tab" onClick={() => setTab('orders')}>Orders</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {!error && (orders === null || licenses === null) && <div className="spinner" aria-label="Loading" />}

      {tab === 'licenses' && licenses && (
        licenses.length ? (
          <div className="license-list">{licenses.map((l) => <License key={l.id} license={l} />)}</div>
        ) : (
          <div className="empty"><h3>No keys yet</h3><p>Once an order is paid, its keys show up here.</p><Link to="/shop" className="btn btn-primary">Browse the shop</Link></div>
        )
      )}

      {tab === 'orders' && orders && (
        orders.length ? (
          <ul className="list">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="list-row">
                  <div>
                    <strong>Order {shortId(o.id)}</strong>
                    <div className="muted">{dateShort(o.created_at)} &middot; {o.order_items?.map((i) => `${i.product_name} x${i.quantity}`).join(', ')}</div>
                  </div>
                  <div className="list-right">
                    <strong>{money(o.total_cents, o.currency)}</strong>
                    <span className={`badge badge-${o.status}`}>{statusLabel(o.status)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty"><h3>No orders yet</h3><p>Your orders will be listed here.</p><Link to="/shop" className="btn btn-primary">Browse the shop</Link></div>
        )
      )}
    </div>
  );
}
