import { useApp } from '../../state/AppContext';
import { specName } from '../../data/mockData';

const PATIENTS = [
  { name: 'Marceline A.', last: '12 août 2026', sp: 'generale' },
  { name: 'Ibrahim T.', last: '3 sept. 2026', sp: 'cardio' },
  { name: 'Nadège K.', last: '20 juin 2026', sp: 'dermato' },
  { name: 'Souleymane B.', last: '9 sept. 2026', sp: 'psy' },
];

export default function Patients() {
  const { state, t } = useApp();
  return (
    <>
      <div className="section-title">
        <h2>{t('patientsTitle')}</h2>
      </div>
      {PATIENTS.map((p) => (
        <div className="doctor-row" key={p.name}>
          <div className="avatar">
            {p.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div className="small">
                {state.lang === 'fr' ? 'Dernière consultation' : 'Last consultation'}: {p.last}
              </div>
            </div>
            <span className="badge badge-primary">{specName(p.sp, state.lang)}</span>
          </div>
        </div>
      ))}
    </>
  );
}
