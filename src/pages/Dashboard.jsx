import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { initials, specName, modeLabel } from '../data/mockData';
import { fetchMyAppointments, cancelAppointment } from '../services/api';

export default function Dashboard() {
  const { state, t, showToast } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [status, setStatus] = useState('loading');

  function load() {
    setStatus('loading');
    fetchMyAppointments()
      .then((data) => {
        setAppointments((data.appointments || []).filter((a) => a.status !== 'cancelled'));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(load, []);

  function joinVideo() {
    showToast(state.lang === 'fr' ? 'Ouverture de la salle de vidéoconsultation…' : 'Opening the video consultation room…');
  }

  async function cancel(id) {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      showToast(t('loadError'));
    }
  }

  return (
    <>
      <div className="eyebrow">{t('dashKicker')}</div>
      <div className="section-title">
        <h2>{t('dashTitle')}</h2>
      </div>
      <h3 style={{ fontSize: 14, margin: '0 0 10px' }}>{t('upcoming')}</h3>

      {status === 'loading' && <div className="empty">{t('loadingDoctors')}</div>}
      {status === 'error' && <div className="empty">{t('loadError')}</div>}

      {status === 'ready' && appointments.length === 0 && <div className="empty">{t('noUpcoming')}</div>}

      {status === 'ready' &&
        appointments.map((a) => {
          const docUser = a.doctor?.user;
          const name = docUser ? `Dr ${docUser.firstName} ${docUser.lastName}` : '—';
          const when = a.scheduledAt ? new Date(a.scheduledAt) : null;
          return (
            <div className="doctor-row" key={a.id}>
              <div className="avatar">{initials(name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{name}</div>
                    <div className="small">
                      {specName(a.doctor?.specialty, state.lang)} · {modeLabel(a.mode, t)}
                      {when ? ` · ${when.toLocaleString(state.lang === 'fr' ? 'fr-FR' : 'en-US')}` : ''}
                    </div>
                  </div>
                  <span className={`badge ${a.status === 'confirmed' ? 'badge-success' : 'badge-accent'}`}>
                    {a.status === 'confirmed' ? t('statusConfirmed') : a.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {a.mode === 'video' && a.status === 'confirmed' && (
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={joinVideo}>
                      {t('joinVideo')}
                    </button>
                  )}
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => cancel(a.id)}>
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
}
