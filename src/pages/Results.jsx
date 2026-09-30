import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { specName, initials, money, modeLabel } from '../data/mockData';
import { fetchDoctors } from '../services/api';

export default function Results() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const specialty = state.booking.specialty;
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    setStatus('loading');
    fetchDoctors({ specialty })
      .then((data) => {
        setList(data.doctors || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [specialty]);

  function openDoctor(id) {
    dispatch({ type: 'START_BOOKING', doctorId: id });
    navigate(`/doctor/${id}`);
  }

  return (
    <>
      <button className="linkback" onClick={() => navigate('/find')}>
        ← {t('back')}
      </button>
      <div className="section-title">
        <h2>
          {t('resultsFor')} {specName(specialty, state.lang)}
        </h2>
      </div>

      {status === 'loading' && <div className="empty">{t('loadingDoctors')}</div>}
      {status === 'error' && <div className="empty">{t('loadError')}</div>}

      {status === 'ready' &&
        list.map((d) => (
          <div className="doctor-row" key={d.id}>
            <div className="avatar lg">{initials(d.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15.5 }}>{d.name}</div>
                  <div className="small">
                    {specName(d.specialty, state.lang)} · {d.city}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
                {d.modes.map((m) => (
                  <span className="modepill" key={m}>
                    {modeLabel(m, t)}
                  </span>
                ))}
              </div>
              <div className="small">
                {t('langs')} {d.languages.join(', ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: 12, gap: 10, flexWrap: 'wrap' }}>
                <div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                    {t('from')} {money(d.consultationPriceFcfa)} {t('priceFrom')}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => openDoctor(d.id)}>
                  {t('bookBtn')}
                </button>
              </div>
            </div>
          </div>
        ))}
      {status === 'ready' && list.length === 0 && <div className="empty">{t('noDoctorsFound')}</div>}
    </>
  );
}
