import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, session, setUnauthorizedHandler } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [sess, setSess] = useState(() => session.get());
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(!!session.get());

  const logout = useCallback(() => {
    session.clear();
    setSess(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      toast('Your session expired. Please log in again.', 'error');
    });
  }, [logout, toast]);

  // The server has no "who am I / am I admin" flag, so we simply try an admin-only route.
  useEffect(() => {
    let alive = true;
    if (!sess) { setIsAdmin(false); setChecking(false); return undefined; }
    setChecking(true);
    api.get('/api/admin/stats')
      .then(() => alive && setIsAdmin(true))
      .catch(() => alive && setIsAdmin(false))
      .finally(() => alive && setChecking(false));
    return () => { alive = false; };
  }, [sess?.access_token]); // eslint-disable-line react-hooks/exhaustive-deps

  const store = (d) => {
    const s = { access_token: d.session.access_token, user: d.user };
    session.set(s);
    setSess(s);
  };

  const login = async (email, password) => {
    const d = await api.post('/api/auth/login', { email, password }, { auth: false });
    if (!d?.session) throw new Error('Login failed. Please try again.');
    store(d);
  };

  const signup = async (email, password) => {
    const d = await api.post('/api/auth/signup', { email, password }, { auth: false });
    if (d?.session) { store(d); return { loggedIn: true }; }
    return { loggedIn: false };
  };

  return (
    <AuthCtx.Provider value={{ user: sess?.user || null, isAdmin, checking, login, signup, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
