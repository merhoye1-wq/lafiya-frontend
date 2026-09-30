import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { specName, initials, money, modeLabel } from '../data/mockData';
import { fetchDoctor, createAppointment, ApiError } from '../services/api';
import { generateUpcomingDays, formatDayLabel, formatTimeLabel } from '../utils/slots';

export default function DoctorProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { state, dispatch, t, showToast, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [status, setStatus] = useState('loading');
  const [tab, setTab] = useState('presentation');
  const [creating, setCreating] = useState(false);
  const { mode, address } = state.booking;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  const preset = location.state || {};

  useEffect(() => {
    setStatus('loading');
    fetchDoctor(id)
      .then((data) => {
        setD(data.doctor);
        setStatus('ready');
        const initialMode = preset.presetMode || data.doctor.modes[0];
        dispatch({ type: 'PICK_MODE', mode: initialMode });
        if (preset.presetDatetime) setSelectedTime(new Date(preset.presetDatetime));
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const days = useMemo(() => (mode ? generateUpcomingDays(id, mode, { days: 6 }) : []), [id, mode]);

  useEffect(() => {
    setSelectedDayIdx(0);
    if (!preset.presetDatetime) setSelectedTime(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Si on arrive depuis un créneau cliqué sur la page de résultats, on
  // sélectionne automatiquement le bon jour dans la grille générée ici.
  useEffect(() => {
    if (!preset.presetDatetime || days.length === 0) return;
    const target = new Date(preset.presetDatetime).getTime();
    const idx = days.findIndex((day) => day.times.some((t2) => t2.getTime() === target));
    if (idx >= 0) setSelectedDayIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (status === 'loading') return <div className="empty">{t('loadingDoctors')}</div>;
  if (status === 'error' || !d) return <div className="empty">{t('loadError')}</div>;

  const currentDay = days[selectedDayIdx];

  async function continueToPayment() {
    if (!mode) return;
    if (!isAuthenticated) {
      showToast(t('loginRequiredToast'));
      navigate('/compte', { state: { from: `/doctor/${id}` } });
      return;
    }
    if (!selectedTime) {
      showToast(t('invalidDatetime'));
      return;
    }
    if (mode === 'domicile' && (!address.quartier || !address.ville || !address.tel)) {
      showToast(state.lang === 'fr' ? 'Merci de renseigner votre quartier, votre ville et votre téléphone.' : 'Please fill in your neighborhood, city and phone.');
      return;
    }

    setCreating(true);
    try {
      const { appointment } = await createAppointment({
        doctorId: d.id,
        scheduledAt: selectedTime.toISOString(),
        mode,
        address: mode === 'domicile' ? address : undefined,
      });
      dispatch({ type: 'PICK_DATETIME', scheduledAt: appointment.scheduledAt });
      navigate('/payment', { state: { appointmentId: appointment.id, doctor: d } });
    } catch (err) {
      showToast(describeBookingError(err, state.lang));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <button className="linkback" onClick={() => navigate('/results')}>
        ← {t('docProfileBack')}
      </button>

      <div className="doctor-hero">
        <div className="avatar lg">{initials(d.name)}</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 21 }}>{d.name}</h2>
          <div className="small">
            {specName(d.specialty, state.lang)} · {d.city}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-primary">✓ {t('verifiedBadge')}</span>
            <span className="badge badge-accent">
              {t('langs')} {d.languages.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'presentation' ? 'active' : ''} onClick={() => setTab('presentation')}>
          {t('tabPresentation')}
        </button>
        <button className={tab === 'pricing' ? 'active' : ''} onClick={() => setTab('pricing')}>
          {t('tabPricing')}
        </button>
        <button className={tab === 'practical' ? 'active' : ''} onClick={() => setTab('practical')}>
          {t('tabPractical')}
        </button>
      </div>

      {tab === 'presentation' && (
        <div className="card" style={{ marginBottom: 22 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('aboutTitle')}</h3>
          <p className="small" style={{ lineHeight: 1.6 }}>
            {d.name} {state.lang === 'fr' ? 'exerce en' : 'practices in'} {specName(d.specialty, state.lang)} {state.lang === 'fr' ? 'à' : 'in'} {d.city}.{' '}
            {state.lang === 'fr'
              ? `Consultations proposées : ${d.modes.map((m) => modeLabel(m, t).toLowerCase()).join(', ')}.`
              : `Available consultation types: ${d.modes.map((m) => modeLabel(m, t).toLowerCase()).join(', ')}.`}
          </p>
        </div>
      )}

      {tab === 'pricing' && (
        <div className="card" style={{ marginBottom: 22 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('pricingTitle')}</h3>
          {d.modes.map((m) => (
            <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span className="small">{modeLabel(m, t)}</span>
              <span className="mono" style={{ fontWeight: 700 }}>
                {money(m === 'domicile' ? d.homeVisitPriceFcfa || d.consultationPriceFcfa : d.consultationPriceFcfa)} {t('priceFrom')}
              </span>
            </div>
          ))}
          <h3 style={{ fontSize: 15, marginTop: 18 }}>{t('paymentMethodsTitle')}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="modepill">MTN Mobile Money</span>
            <span className="modepill">Orange Money</span>
            <span className="modepill">Visa / Mastercard</span>
          </div>
        </div>
      )}

      {tab === 'practical' && (
        <div className="card" style={{ marginBottom: 22 }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>{t('practicalTitle')}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="small">{t('practicalCity')}</span>
            <span>{d.city}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="small">{t('practicalLangs')}</span>
            <span>{d.languages.join(', ')}</span>
          </div>
        </div>
      )}

      <div className="section-title">
        <h2 style={{ fontSize: 16 }}>{t('chooseMode')}</h2>
      </div>
      <div className="grid-3">
        {d.modes.map((m) => (
          <button key={m} className={`chip${mode === m ? ' selected' : ''}`} onClick={() => dispatch({ type: 'PICK_MODE', mode: m })}>
            <span className="t">{modeLabel(m, t)}</span>
            <span className="s mono">
              {money(m === 'domicile' ? d.homeVisitPriceFcfa || d.consultationPriceFcfa : d.consultationPriceFcfa)} {t('priceFrom')}
            </span>
          </button>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
        <h2 style={{ fontSize: 16 }}>{t('pickDay')}</h2>
      </div>
      <div className="datestrip">
        {days.map((day, i) => (
          <button
            key={day.date.toISOString()}
            className={`datechip${i === selectedDayIdx ? ' selected' : ''}`}
            onClick={() => {
              setSelectedDayIdx(i);
              setSelectedTime(null);
            }}
          >
            <div className="d">{formatDayLabel(day.date, state.lang)}</div>
            <div className="n">{day.date.toLocaleDateString(state.lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}</div>
          </button>
        ))}
      </div>

      <div className="section-title">
        <h2 style={{ fontSize: 16 }}>{t('pickTime')}</h2>
      </div>
      {currentDay && currentDay.times.length > 0 ? (
        <div className="timegrid">
          {currentDay.times.map((time) => (
            <button
              key={time.toISOString()}
              className={`timebtn${selectedTime && selectedTime.getTime() === time.getTime() ? ' selected' : ''}`}
              onClick={() => setSelectedTime(time)}
            >
              {formatTimeLabel(time, state.lang)}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">{t('noSlotsThisDay')}</div>
      )}

      {mode === 'domicile' && (
        <>
          <div className="section-title" style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 16 }}>{t('homeAddress')}</h2>
          </div>
          <div className="callout" style={{ marginBottom: 16 }}>
            {t('homeNote')}
          </div>
          <div className="grid-2">
            <div className="field">
              <label>{t('quartier')}</label>
              <input value={address.quartier} onChange={(e) => dispatch({ type: 'UPDATE_ADDRESS', field: 'quartier', value: e.target.value })} />
            </div>
            <div className="field">
              <label>{t('ville')}</label>
              <input value={address.ville} onChange={(e) => dispatch({ type: 'UPDATE_ADDRESS', field: 'ville', value: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>{t('tel')}</label>
              <input
                placeholder="+237 6XX XX XX XX"
                value={address.tel}
                onChange={(e) => dispatch({ type: 'UPDATE_ADDRESS', field: 'tel', value: e.target.value })}
              />
            </div>
            <div className="field">
              <label>{t('noteLbl')}</label>
              <input value={address.note} onChange={(e) => dispatch({ type: 'UPDATE_ADDRESS', field: 'note', value: e.target.value })} />
            </div>
          </div>
        </>
      )}

      {selectedTime && (
        <div className="callout" style={{ marginBottom: 14 }}>
          <strong style={{ color: 'var(--ink)' }}>{t('selectedSlot')} : </strong>
          {formatDayLabel(selectedTime, state.lang)} {formatTimeLabel(selectedTime, state.lang)}
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} disabled={!mode || !selectedTime || creating} onClick={continueToPayment}>
        {creating ? t('creatingAppointment') : t('continueToPay')}
      </button>
    </>
  );
}

function describeBookingError(err, lang) {
  if (err instanceof ApiError) {
    const map = {
      slot_already_booked: lang === 'fr' ? "Ce créneau vient d'être réservé par un autre patient. Choisissez un autre horaire." : 'That slot was just booked by another patient. Please pick another time.',
      invalid_datetime: lang === 'fr' ? 'Date/heure invalide.' : 'Invalid date/time.',
      address_required_for_home_visit: lang === 'fr' ? 'Adresse complète requise pour un passage à domicile.' : 'Full address required for a home visit.',
      mode_not_offered_by_doctor: lang === 'fr' ? 'Ce médecin ne propose pas ce format de consultation.' : 'This doctor does not offer this consultation format.',
    };
    return map[err.code] || err.message;
  }
  return err.message || (lang === 'fr' ? 'Une erreur est survenue.' : 'Something went wrong.');
}
