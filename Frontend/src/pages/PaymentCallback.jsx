import { Navigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Paystack sends customers back here with ?reference=<order id>
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref') || params.get('order');
  if (reference) return <Navigate to={`/orders/${reference}?verify=1`} replace />;
  return (
    <div className="page container">
      <div className="empty"><h1>Nothing to check here</h1><p>We could not find an order reference in this link.</p><Link to="/account" className="btn btn-primary">Go to my account</Link></div>
    </div>
  );
}
