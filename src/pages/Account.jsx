import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { login, signupPatient, ApiError } from '../services/api';

export default function Account() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [tab, setTab] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });

  function afterAuth(token, user) {
    dispatch({ type: 'AUTH_SUCCESS', token, user });
    navigate(from, { replace: true });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { token, user } = await login(loginForm.email.trim(), loginForm.password);
      afterAuth(token, user);
    } catch (err) {
      setError(describeError(err, state.lang));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { token, user } = await signupPatient({
        firstName: signupForm.firstName.trim(),
        lastName: signupForm.lastName.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        phone: signupForm.phone.trim() || undefined,
      });
      afterAuth(token, user);
    } catch (err) {
      setError(describeError(err, state.lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="eyebrow">{t('navAccount')}</div>
      <div className="section-title">
        <h2>{tab === 'login' ? t('loginTitle') : t('signupTitle')}</h2>
      </div>

      <div className="seg" style={{ marginBottom: 20 }}>
        <button className={tab === 'login' ? 'active' : ''} onClick={() => { setTab('login'); setError(null); }}>
          {t('tabLogin')}
        </button>
        <button className={tab === 'signup' ? 'active' : ''} onClick={() => { setTab('signup'); setError(null); }}>
          {t('tabSignup')}
        </button>
      </div>

      {error && (
        <div className="callout" style={{ marginBottom: 16, color: 'var(--danger, #c0392b)' }}>
          {error}
        </div>
      )}

      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="grid-2">
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('fieldEmail')}</label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('fieldPassword')}</label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" style={{ gridColumn: '1/-1' }} disabled={busy} type="submit">
            {busy ? '…' : t('submitLogin')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="grid-2">
          <div className="field">
            <label>{t('fieldFirstName')}</label>
            <input required value={signupForm.firstName} onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('fieldLastName')}</label>
            <input required value={signupForm.lastName} onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('fieldEmail')}</label>
            <input
              type="email"
              required
              value={signupForm.email}
              onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            />
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('fieldPassword')}</label>
            <input
              type="password"
              required
              minLength={8}
              value={signupForm.password}
              onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            />
            <div className="small" style={{ marginTop: 4 }}>{t('weakPasswordHint')}</div>
          </div>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('fieldPhone')}</label>
            <input
              placeholder="+237 6XX XX XX XX"
              value={signupForm.phone}
              onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
            />
          </div>
          <button className="btn btn-primary btn-block" style={{ gridColumn: '1/-1' }} disabled={busy} type="submit">
            {busy ? '…' : t('submitSignup')}
          </button>
        </form>
      )}
    </>
  );
}

function describeError(err, lang) {
  if (err instanceof ApiError) {
    const map = {
      invalid_credentials: lang === 'fr' ? 'Email ou mot de passe incorrect.' : 'Incorrect email or password.',
      email_taken: lang === 'fr' ? 'Un compte existe déjà avec cet email.' : 'An account already exists with this email.',
      weak_password: lang === 'fr' ? 'Le mot de passe doit comporter au moins 8 caractères.' : 'Password must be at least 8 characters.',
      invalid_email: lang === 'fr' ? "Adresse email invalide." : 'Invalid email address.',
      missing_fields: lang === 'fr' ? 'Merci de remplir tous les champs requis.' : 'Please fill in all required fields.',
    };
    return map[err.code] || err.message;
  }
  return err.message || (lang === 'fr' ? 'Une erreur est survenue.' : 'Something went wrong.');
}
