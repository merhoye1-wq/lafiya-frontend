import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { initials, modeLabel } from '../data/mockData';

export default function Confirmation() {
  const { state, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const ref = location.state?.ref;
  const d = location.state?.doctor;
  const appointment = location.state?.appointment;

  if (!d || !ref) return <div className="empty">—</div>;

  const when = appointment?.scheduledAt ? new Date(appointment.scheduledAt) : null;

  return (
    <>
      <div className="progress">
        <span className="done" />
        <span className="done" />
        <span className="done" />
      </div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div className="avatar lg" style={{ margin: '0 auto 16px', background: 'var(--success-soft)', color: 'var(--success)' }}>
          ✓
        </div>
        <h2 style={{ margin: '0 0 8px' }}>{t('confirmedTitle')}</h2>
        <p className="lede" style={{ margin: '0 auto 20px' }}>
          {t('confirmedSub')}
        </p>
        <div className="card" style={{ textAlign: 'left', maxWidth: 420, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="small">{t('ref')}</span>
            <span className="mono" style={{ fontWeight: 700 }}>
              {ref}
            </span>
          </div>
          <hr className="hr" />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="avatar">{initials(d.name)}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{d.name}</div>
              <div className="small">
                {modeLabel(state.booking.mode, t)}
                {when ? ` · ${when.toLocaleString(state.lang === 'fr' ? 'fr-FR' : 'en-US')}` : ''}
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 22 }} onClick={() => navigate('/dashboard')}>
          {t('goDashboard')}
        </button>
      </div>
    </>
  );
}
