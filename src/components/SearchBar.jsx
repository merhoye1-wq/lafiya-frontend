import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';
import { SPECIALTIES, SYMPTOMS, CITIES } from '../data/mockData';

// Barre de recherche double (motif/spécialité + ville), point d'entrée
// principal du site — inspirée des plateformes de prise de rendez-vous
// médical grand public (recherche combinée avant tout le reste).
export default function SearchBar({ compact = false }) {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const bySpecialty = SPECIALTIES.find((s) => s[state.lang].toLowerCase() === q);
    const bySymptom = SYMPTOMS.find((s) => s[state.lang].toLowerCase() === q);
    const specialtyId = bySpecialty?.id || bySymptom?.sp;

    if (specialtyId) {
      dispatch({ type: 'PICK_SPECIALTY', specialtyId });
      navigate(`/results${city ? `?city=${encodeURIComponent(city)}` : ''}`);
    } else {
      navigate(`/find${city ? `?city=${encodeURIComponent(city)}` : ''}`);
    }
  }

  return (
    <form className={`searchbar${compact ? ' compact' : ''}`} onSubmit={handleSubmit}>
      <div className="searchbar-field">
        <span className="searchbar-icon" aria-hidden="true">🔎</span>
        <input
          list="lafiya-specialty-options"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <datalist id="lafiya-specialty-options">
          {SPECIALTIES.map((s) => (
            <option key={s.id} value={s[state.lang]} />
          ))}
          {SYMPTOMS.map((s) => (
            <option key={s.id} value={s[state.lang]} />
          ))}
        </datalist>
      </div>
      <div className="searchbar-divider" />
      <div className="searchbar-field searchbar-field-city">
        <span className="searchbar-icon" aria-hidden="true">📍</span>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">{t('searchAllCities')}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary searchbar-submit">
        {t('searchCta')}
      </button>
    </form>
  );
}
