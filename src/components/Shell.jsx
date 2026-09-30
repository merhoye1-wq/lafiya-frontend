import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import Toast from './Toast';

const PATIENT_NAV = [
  { to: '/', end: true, key: 'navHome' },
  { to: '/find', key: 'navFind' },
  { to: '/dashboard', key: 'navAppts' },
  { to: '/records', key: 'navRecords' },
];

const DOCTOR_NAV = [
  { to: '/pro/queue', key: 'navQueue' },
  { to: '/pro/patients', key: 'navPatients' },
];

export default function Shell({ children }) {
  const { state, dispatch, t, showToast, isAuthenticated, user, logout } = useApp();
  const navigate = useNavigate();
  const nav = state.role === 'doctor' ? DOCTOR_NAV : PATIENT_NAV;

  function setRole(role) {
    dispatch({ type: 'SET_ROLE', role });
    if (role === 'doctor') {
      showToast(t('roleSwitchToast'));
      navigate('/pro/queue');
    } else {
      navigate('/');
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">LF</span>
          <span>{t('brandname')}</span>
        </NavLink>
        <div className="topbar-spacer" />
        <div className="seg">
          <button className={state.role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>
            Patient
          </button>
          <button className={state.role === 'doctor' ? 'active' : ''} onClick={() => setRole('doctor')}>
            {t('roleDoctor')}
          </button>
        </div>
        <button className="pillbtn" onClick={() => dispatch({ type: 'TOGGLE_LANG' })}>
          <span>{state.lang.toUpperCase()}</span>
          <span style={{ opacity: 0.5 }}>/ {state.lang === 'fr' ? 'EN' : 'FR'}</span>
        </button>
        {isAuthenticated ? (
          <button
            className="pillbtn"
            title={`${t('helloUser')} ${user?.firstName || ''}`}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            {t('logoutCta')}
          </button>
        ) : (
          <button className="pillbtn" onClick={() => navigate('/compte')}>
            {t('loginCta')}
          </button>
        )}
      </div>

      <div className="layout">
        <nav className="sidenav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `navitem${isActive ? ' active' : ''}`}>
              <span className="dot" />
              {t(n.key)}
            </NavLink>
          ))}
        </nav>
        <main className="screen">{children}</main>
      </div>

      <nav className="tabbar">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `tabbtn${isActive ? ' active' : ''}`}>
            {t(n.key)}
          </NavLink>
        ))}
      </nav>

      <Toast />
    </div>
  );
}
