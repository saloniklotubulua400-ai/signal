import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { user, login, signup } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const next = params.get('next') || '/account';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (user) return <Navigate to={next} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (password.length < 6) { setError('Your password needs at least 6 characters.'); return; }
    setBusy(true);
    try {
      if (isSignup) {
        const res = await signup(email.trim(), password);
        if (res.loggedIn) nav(next, { replace: true });
        else setNotice('Account created. If email confirmation is on, check your inbox, then log in.');
      } else {
        await login(email.trim(), password);
        nav(next, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page container auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{isSignup ? 'Your orders and keys will live here.' : 'Log in to see your orders and keys.'}</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-info">{notice}</div>}

        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
        </button>

        <p className="auth-switch">
          {isSignup
            ? <>Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></>
            : <>New here? <Link to={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}
        </p>
      </form>
    </div>
  );
}
