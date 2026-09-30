import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { SPECIALTIES, SYMPTOMS, specName } from '../data/mockData';
import { fetchDoctors } from '../services/api';

export default function Find() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors()
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]));
  }, []);

  // Permet d'arriver directement sur une spécialité depuis l'accueil (?specialty=cardio)
  useEffect(() => {
    const sp = params.get('specialty');
    if (sp) dispatch({ type: 'PICK_SPECIALTY', specialtyId: sp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const { symptom, specialty } = state.booking;

  return (
    <>
      <div className="eyebrow">{t('findKicker')}</div>
      <div className="section-title">
        <h2>{t('findTitle')}</h2>
      </div>
      <p className="lede" style={{ marginTop: -8, marginBottom: 18 }}>
        {t('findSub')}
      </p>

      <div className="grid-2">
        {SYMPTOMS.map((s) => (
          <button
            key={s.id}
            className={`chip${symptom === s.id ? ' selected' : ''}`}
            onClick={() => dispatch({ type: 'PICK_SYMPTOM', symptomId: s.id, specialtyId: s.sp })}
          >
            <span className="t">{s[state.lang]}</span>
            <span className="s">{specName(s.sp, state.lang)}</span>
          </button>
        ))}
      </div>

      {symptom && (
        <div
          className="callout"
          style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}
        >
          <div>
            <strong style={{ color: 'var(--ink)' }}>{t('matchedTo')}</strong> {specName(specialty, state.lang)}
          </div>
          <button className="btn btn-accent" onClick={() => navigate('/results')}>
            {t('seeSpecialists')}
          </button>
        </div>
      )}

      <hr className="hr" />
      <div className="section-title">
        <h2 style={{ fontSize: 16 }}>{t('allSpecialties')}</h2>
      </div>
      <div className="grid-3">
        {SPECIALTIES.map((s) => (
          <button
            key={s.id}
            className="chip"
            onClick={() => {
              dispatch({ type: 'PICK_SPECIALTY', specialtyId: s.id });
              navigate('/results');
            }}
          >
            <span className="t">{specName(s.id, state.lang)}</span>
            <span className="s">
              {doctors.filter((d) => d.specialty === s.id).length} {state.lang === 'fr' ? 'médecin(s)' : 'doctor(s)'}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
