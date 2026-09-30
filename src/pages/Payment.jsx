import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { initials, money, modeLabel } from '../data/mockData';
import { initiatePayment, simulateConfirmPayment, ApiError } from '../services/api';

const SERVICE_FEE = 500;

export default function Payment() {
  const { state, t, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;
  const d = location.state?.doctor;
  const [method, setMethod] = useState('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' });
  const [processing, setProcessing] = useState(false);

  if (!d || !appointmentId) return <div className="empty">—</div>;

  const fee = state.booking.mode === 'domicile' ? d.homeVisitPriceFcfa || d.consultationPriceFcfa : d.consultationPriceFcfa;
  const total = fee + SERVICE_FEE;

  async function handlePay() {
    if ((method === 'momo' || method === 'orange') && !momoNumber.trim()) {
      showToast(state.lang === 'fr' ? 'Merci de renseigner votre numéro Mobile Money.' : 'Please enter your Mobile Money number.');
      return;
    }
    setProcessing(true);
    try {
      const initResult = await initiatePayment({
        appointmentId,
        method,
        phoneNumber: method === 'card' ? undefined : momoNumber.trim(),
      });

      let confirmed = initResult;
      if (initResult.status !== 'confirmed') {
        // Le paiement mobile est mocké côté serveur (pas encore de vrais
        // identifiants opérateur) : on confirme tout de suite via le
        // raccourci de démo prévu par le backend, plutôt que d'attendre.
        confirmed = await simulateConfirmPayment(appointmentId);
      }

      const appointment = confirmed.appointment || initResult.appointment;
      const ref = appointmentId.slice(-8).toUpperCase();
      navigate('/confirm', { state: { ref, doctor: d, appointment } });
    } catch (err) {
      showToast(describePaymentError(err, state.lang));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <button className="linkback" onClick={() => navigate(`/doctor/${d.id}`)}>
        ← {t('back')}
      </button>
      <div className="progress">
        <span className="done" />
        <span className="done" />
        <span />
      </div>
      <div className="eyebrow">{t('payKicker')}</div>
      <div className="section-title">
        <h2>{t('payTitle')}</h2>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{d.name}</div>
            <div className="small">{modeLabel(state.booking.mode, t)}</div>
          </div>
          <div className="avatar">{initials(d.name)}</div>
        </div>
        <hr className="hr" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="small">{t('consultFee')}</span>
          <span className="mono">
            {money(fee)} {t('priceFrom')}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="small">{t('serviceFee')}</span>
          <span className="mono">
            {money(SERVICE_FEE)} {t('priceFrom')}
          </span>
        </div>
        <hr className="hr" />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 17 }}>
          <span>{t('total')}</span>
          <span className="mono">
            {money(total)} {t('priceFrom')}
          </span>
        </div>
      </div>

      <div className="section-title" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>{t('payMethod')}</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className={`payopt${method === 'momo' ? ' selected' : ''}`} onClick={() => setMethod('momo')}>
          <span className="radio-dot" />
          <div className="avatar" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', width: 38, height: 38, borderRadius: 9, fontSize: 11 }}>
            MTN
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>MTN Mobile Money</div>
          </div>
        </button>
        <button className={`payopt${method === 'orange' ? ' selected' : ''}`} onClick={() => setMethod('orange')}>
          <span className="radio-dot" />
          <div className="avatar" style={{ background: 'var(--accent-soft)', color: 'var(--accent-strong)', width: 38, height: 38, borderRadius: 9, fontSize: 10 }}>
            Orange
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Orange Money</div>
          </div>
        </button>
        <button className={`payopt${method === 'card' ? ' selected' : ''}`} onClick={() => setMethod('card')}>
          <span className="radio-dot" />
          <div className="avatar" style={{ background: 'var(--primary-soft)', color: 'var(--primary-strong)', width: 38, height: 38, borderRadius: 9, fontSize: 10 }}>
            CB
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Visa / Mastercard</div>
          </div>
        </button>
      </div>

      {method === 'momo' || method === 'orange' ? (
        <div className="field" style={{ marginTop: 16 }}>
          <label>{t('momoNumber')}</label>
          <input placeholder="+237 6XX XX XX XX" value={momoNumber} onChange={(e) => setMomoNumber(e.target.value)} />
        </div>
      ) : (
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div className="field" style={{ gridColumn: '1/-1' }}>
            <label>{t('cardNumber')}</label>
            <input placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('cardExp')}</label>
            <input placeholder="MM/AA" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('cardCvc')}</label>
            <input placeholder="•••" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
          </div>
        </div>
      )}

      <button className="btn btn-accent btn-block" style={{ marginTop: 8 }} disabled={processing} onClick={handlePay}>
        {processing ? t('processing') : `${t('payNow')} — ${money(total)} ${t('priceFrom')}`}
      </button>
    </>
  );
}

function describePaymentError(err, lang) {
  if (err instanceof ApiError) {
    const map = {
      appointment_not_awaiting_payment: lang === 'fr' ? 'Ce rendez-vous a déjà été traité.' : 'This appointment has already been processed.',
      phone_number_required: lang === 'fr' ? 'Numéro de téléphone requis.' : 'Phone number required.',
    };
    return map[err.code] || err.message;
  }
  return err.message || (lang === 'fr' ? 'Le paiement a échoué.' : 'Payment failed.');
}
