import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { specName, initials, money, modeLabel } from '../data/mockData';
import { fetchDoctor, createAppointment, ApiError } from '../services/api';

function minDatetimeLocal() {
  // 1h dans le futur minimum, formaté pour <input type="datetime-local">
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function DoctorProfile() {
  const { id } = useParams();
  const { state, dispatch, t, showToast, isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [d, setD] = useState(null);
  const [status, setStatus] = useState('loading');
  const [datetimeLocal, setDatetimeLocal] = useState('');
  const [creating, setCreating] = useState(false);
  const { mode, address } = state.booking;

  useEffect(() => {
    setStatus('loading');
    fetchDoctor(id)
      .then((data) => {
        setD(data.doctor);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <div className="empty">{t('loadingDoctors')}</div>;
  if (status === 'error' || !d) return <div className="empty">{t('loadError')}</div>;

  async function continueToPayment() {
    if (!mode) return;
    if (!isAuthenticated) {
      showToast(t('loginRequiredToast'));
      navigate('/compte', { state: { from: `/doctor/${id}` } });
      return;
    }
    if (!datetimeLocal) {
      showToast(t('invalidDatetime'));
      return;
    }
    const scheduledAt = new Date(datetimeLocal);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
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
        scheduledAt: scheduledAt.toISOString(),
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

      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="avatar lg">{initials(d.name)}</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{d.name}</h2>
          <div className="small">
            {specName(d.specialty, state.lang)} · {d.city}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-primary">
              {t('langs')} {d.languages.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 26 }}>
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
        <h2 style={{ fontSize: 16 }}>{t('pickDatetime')}</h2>
      </div>
      <div className="field">
        <input
          type="datetime-local"
          min={minDatetimeLocal()}
          value={datetimeLocal}
          onChange={(e) => setDatetimeLocal(e.target.value)}
        />
      </div>

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

      <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} disabled={!mode || creating} onClick={continueToPayment}>
        {creating ? t('creatingAppointment') : t('continueToPay')}
      </button>
    </>
  );
}

function describeBookingError(err, lang) {
  if (err instanceof ApiError) {
    const map = {
      slot_already_booked: lang === 'fr' ? 'Ce créneau vient d\'être réservé par un autre patient. Choisissez un autre horaire.' : 'That slot was just booked by another patient. Please pick another time.',
      invalid_datetime: lang === 'fr' ? 'Date/heure invalide.' : 'Invalid date/time.',
      address_required_for_home_visit: lang === 'fr' ? 'Adresse complète requise pour un passage à domicile.' : 'Full address required for a home visit.',
      mode_not_offered_by_doctor: lang === 'fr' ? "Ce médecin ne propose pas ce format de consultation." : 'This doctor does not offer this consultation format.',
    };
    return map[err.code] || err.message;
  }
  return err.message || (lang === 'fr' ? 'Une erreur est survenue.' : 'Something went wrong.');
}
