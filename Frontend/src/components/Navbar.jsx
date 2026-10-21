import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LayoutDashboard } from 'lucide-react';
import { STORE_NAME } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    nav(term ? `/shop?q=${encodeURIComponent(term)}` : '/shop');
    setQ('');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label={`${STORE_NAME} home`}>
          <img src="/logo.png" alt={STORE_NAME} className="brand-logo" />
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/shop?category=sms">SMS</NavLink>
          <NavLink to="/shop?category=email">Email</NavLink>
          <NavLink to="/shop?category=whatsapp">WhatsApp</NavLink>
        </nav>

        <form className="nav-search" onSubmit={submit} role="search">
          <Search size={18} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </form>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}>
            <ShoppingBag size={22} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          {user ? (
            <>
              {isAdmin && <Link to="/admin" className="btn btn-ghost btn-sm nav-hide-sm"><LayoutDashboard size={16} /> Admin</Link>}
              <Link to="/account" className="btn btn-ghost btn-sm nav-hide-sm"><User size={16} /> Account</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm nav-hide-sm">Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm nav-hide-sm">Sign up</Link>
            </>
          )}
          <button className="icon-btn burger" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu">
          <form onSubmit={submit} className="mobile-search" role="search">
            <Search size={18} aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
          </form>
          <Link to="/shop">All products</Link>
          <Link to="/shop?category=sms">SMS</Link>
          <Link to="/shop?category=email">Email</Link>
          <Link to="/shop?category=whatsapp">WhatsApp</Link>
          <hr />
          {user ? (
            <>
              <Link to="/account">My account</Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <button className="linklike" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
