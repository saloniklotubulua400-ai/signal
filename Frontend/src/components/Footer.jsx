import { Link } from 'react-router-dom';
import { STORE_NAME, SUPPORT_EMAIL } from '../config.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <img src="/logo-light.png" alt={STORE_NAME} className="brand-logo" />
          <p className="footer-note">SMS, email, WhatsApp and verification services for your business. Your balance and orders live in your account.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop?category=sms">SMS</Link>
          <Link to="/shop?category=email">Email</Link>
          <Link to="/shop?category=whatsapp">WhatsApp</Link>
        </div>
        <div>
          <h4>Your account</h4>
          <Link to="/account">Orders and keys</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Log in</Link>
        </div>
        <div>
          <h4>Help</h4>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
      </div>
      <div className="container footer-base">
        <span>&copy; {new Date().getFullYear()} {STORE_NAME}</span>
      </div>
    </footer>
  );
}
