import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, isAdmin, checking } = useAuth();
  const loc = useLocation();

  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (admin && checking) return <div className="page container"><div className="spinner" aria-label="Loading" /></div>;
  if (admin && !isAdmin) {
    return (
      <div className="page container">
        <div className="empty">
          <h1>Admins only</h1>
          <p>Your account does not have admin access. In Supabase, set your role to admin in the profiles table, then log in again.</p>
        </div>
      </div>
    );
  }
  return children;
}
