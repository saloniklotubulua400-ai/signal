import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import License from '../components/License.jsx';
import { api } from '../lib/api.js';
import { dateShort, money, shortId, statusLabel } from '../lib/format.js';
import { SUPPORT_EMAIL } from '../config.js';

export default function Order() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const wantsVerify = params.get('verify') === '1';
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async (verify) => {
    try {
      if (verify) { try { await api.get(`/api/payments/verify/${id}`); } catch { /* not paid yet */ } }
      const o = await api.get(`/api/orders/${id}`);
      setOrder(o); setError('');
      return o;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [id]);

  useEffect(() => {
    let alive = true;
    let tries = 0;
    let timer;
    const run = async (verify) => {
      const o = await load(verify);
      if (alive && wantsVerify && o && o.status === 'pending' && o.payment_provider === 'paystack' && tries < 8) {
        tries += 1;
        timer = setTimeout(() => run(true), 4000);
      }
    };
    run(wantsVerify);
    return () => { alive = false; clearTimeout(timer); };
  }, [id, wantsVerify, load]);

  if (error) return <div className="page container"><div className="empty"><h1>Order not found</h1><p>{error}</p><Link className="btn btn-primary" to="/account">Go to my account</Link></div></div>;
  if (!order) return <div className="page container"><div className="spinner" aria-label="Loading" /></div>;

  const done = order.status === 'fulfilled';
  const bad = order.status === 'failed' || order.status === 'cancelled';
  const nameFor = (l) => order.order_items?.find((i) => i.id === l.order_item_id)?.product_name;

  return (
    <div className="page container narrow">
      <div className={`order-banner ${done ? 'ok' : bad ? 'bad' : 'wait'}`}>
        {done ? <CheckCircle2 size={34} /> : bad ? <XCircle size={34} /> : <Clock size={34} />}
        <div>
          <h1>{done ? 'Your order is ready' : bad ? 'This order did not go through' : order.status === 'paid' ? 'Payment received' : 'Waiting for payment'}</h1>
          <p>Order {shortId(order.id)} &middot; {dateShort(order.created_at)} &middot; {statusLabel(order.status)}</p>
        </div>
      </div>

      {order.status === 'pending' && order.payment_provider === 'manual' && (
        <div className="alert alert-info">
          Your order is placed. Complete your payment using the method agreed with the store, then we confirm it here.
          Questions? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and mention order {shortId(order.id)}.
        </div>
      )}
      {order.status === 'pending' && order.payment_provider === 'paystack' && (
        <div className="alert alert-info">We are checking your payment. This page updates on its own. If you already paid, give it a minute.</div>
      )}

      <section className="card-block">
        <h2>Items</h2>
        <ul className="list">
          {order.order_items?.map((i) => (
            <li key={i.id} className="list-row">
              <span>{i.product_name} <span className="muted">x{i.quantity}</span></span>
              <strong>{money(i.unit_price_cents * i.quantity, order.currency)}</strong>
            </li>
          ))}
          <li className="list-row total-row"><span>Total</span><strong>{money(order.total_cents, order.currency)}</strong></li>
        </ul>
      </section>

      {order.licenses?.length > 0 && (
        <section className="card-block">
          <h2>Your keys and services</h2>
          <div className="license-list">{order.licenses.map((l) => <License key={l.id} license={l} name={nameFor(l)} />)}</div>
        </section>
      )}

      <div className="row-actions">
        <Link to="/account" className="btn btn-ghost">All my orders</Link>
        <Link to="/shop" className="btn btn-primary">Keep shopping</Link>
      </div>
    </div>
  );
}
