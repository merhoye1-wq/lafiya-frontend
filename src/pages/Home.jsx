import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { SPECIALTIES, specName } from '../data/mockData';
import { fetchDoctors } from '../services/api';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const { state, t } = useApp();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors()
      .then((data) => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="eyebrow">{t('heroKicker')}</div>
        <h1>{t('heroSearchTitle')}</h1>
        <p className="lede">{t('heroSub')}</p>
        <div className="hero-search-wrap">
          <SearchBar />
        </div>
        <div className="grid-3" style={{ marginTop: 28 }}>
          <div className="card stat">
            <span className="n mono">{t('stat1n')}</span>
            <span className="l">{t('stat1l')}</span>
          </div>
          <div className="card stat">
            <span className="n mono">{t('stat2n')}</span>
            <span className="l">{t('stat2l')}</span>
          </div>
          <div className="card stat">
            <span className="n mono">{t('stat3n')}</span>
            <span className="l">{t('stat3l')}</span>
          </div>
        </div>
      </section>

      <hr className="hr" />

      <section>
        <div className="section-title">
          <h2>{t('allSpecialties')}</h2>
        </div>
        <div className="grid-3">
          {SPECIALTIES.map((s) => (
            <button key={s.id} className="spec-card" onClick={() => navigate(`/find?specialty=${s.id}`)}>
              <span className="spec-icon" aria-hidden="true">{s.icon}</span>
              <span>
                <span className="t" style={{ display: 'block' }}>{specName(s.id, state.lang)}</span>
                <span className="s">
                  {doctors.filter((d) => d.specialty === s.id).length} {state.lang === 'fr' ? 'médecin(s)' : 'doctor(s)'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <hr className="hr" />

      <section id="how">
        <div className="section-title">
          <h2>{t('howTitle')}</h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">01</div>
            <h3 style={{ margin: '8px 0 6px', fontSize: 15 }}>{t('step1t')}</h3>
            <p className="small">{t('step1s')}</p>
          </div>
          <div className="step">
            <div className="num">02</div>
            <h3 style={{ margin: '8px 0 6px', fontSize: 15 }}>{t('step2t')}</h3>
            <p className="small">{t('step2s')}</p>
          </div>
          <div className="step">
            <div className="num">03</div>
            <h3 style={{ margin: '8px 0 6px', fontSize: 15 }}>{t('step3t')}</h3>
            <p className="small">{t('step3s')}</p>
          </div>
        </div>
      </section>
    </>
  );
}
