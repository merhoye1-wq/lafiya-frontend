import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { specName, initials, money, modeLabel, CITIES } from '../data/mockData';
import { fetchDoctors } from '../services/api';
import { generateUpcomingDays, formatSlotChip } from '../utils/slots';

export default function Results() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const specialty = state.booking.specialty;
  const city = params.get('city') || '';
  const [list, setList] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    fetchDoctors({ specialty, city: city || undefined })
      .then((data) => {
        setList(data.doctors || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [specialty, city]);

  function openDoctor(id, preset) {
    dispatch({ type: 'START_BOOKING', doctorId: id });
    navigate(`/doctor/${id}`, preset ? { state: preset } : undefined);
  }

  function quickSlotsFor(d) {
    if (!d.modes?.length) return [];
    const mode = d.modes[0];
    const days = generateUpcomingDays(d.id, mode, { days: 5 });
    const times = days.flatMap((day) => day.times);
    return times.slice(0, 3).map((time) => ({ mode, time }));
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

      <div className="filterbar">
        <span className="small" style={{ fontWeight: 700 }}>{t('filterCity')}</span>
        <select
          value={city}
          onChange={(e) => {
            const v = e.target.value;
            setParams(v ? { city: v } : {});
          }}
        >
          <option value="">{t('filterAllCities')}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
                <span className="badge badge-primary">✓ {t('verifiedBadge')}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0' }}>
                {d.modes.map((m) => (
                  <span className="modepill" key={m}>
                    {modeLabel(m, t)}
                  </span>
                ))}
              </div>
              <div className="small">
                {t('langs')} {d.languages.join(', ')} · {t('from')} {money(d.consultationPriceFcfa)} {t('priceFrom')}
              </div>

              <div className="small" style={{ marginTop: 10, fontWeight: 700, color: 'var(--ink)' }}>
                {t('nextAvailability')}
              </div>
              <div className="avail-row">
                {quickSlotsFor(d).map(({ mode, time }) => (
                  <button
                    key={time.toISOString()}
                    className="avail-chip"
                    onClick={() => openDoctor(d.id, { presetMode: mode, presetDatetime: time.toISOString() })}
                  >
                    {formatSlotChip(time, state.lang)}
                  </button>
                ))}
                <button className="avail-chip" onClick={() => openDoctor(d.id)}>
                  {t('seeProfile')} →
                </button>
              </div>
            </div>
          </div>
        ))}
      {status === 'ready' && list.length === 0 && <div className="empty">{t('noDoctorsFound')}</div>}
    </>
  );
}
