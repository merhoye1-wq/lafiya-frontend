import { useApp } from '../../state/AppContext';
import { docById, specName, modeLabel } from '../../data/mockData';
import { sendEmailDocument } from '../../services/notifications';

const TODAY_IDS = ['d2', 'd1', 'd5', 'd10'];
const MODES = { d2: 'presentiel', d1: 'video', d5: 'video', d10: 'video' };

export default function Queue() {
  const { state, t, showToast } = useApp();
  const today = TODAY_IDS.map(docById).filter(Boolean);

  function startVideo() {
    showToast(state.lang === 'fr' ? 'Ouverture de la salle de vidéoconsultation…' : 'Opening the video consultation room…');
  }

  async function send(kind, patientIndex) {
    await sendEmailDocument({ toEmail: `patient${1000 + patientIndex}@example.com`, kind, appointmentRef: `LF-QUEUE-${patientIndex}` });
    showToast(kind === 'rx' ? t('sentRxToast') : t('sentResultsToast'));
  }

  return (
    <>
      <div className="eyebrow">{t('roleSwitchToast')}</div>
      <div className="section-title">
        <h2>{t('queueTitle')}</h2>
      </div>
      <p className="lede" style={{ marginTop: -8 }}>
        {t('queueSub')}
      </p>
      {today.map((d, i) => (
        <div className="doctor-row" key={d.id}>
          <div className="avatar">P{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Patient #{1000 + i}</div>
                <div className="small">
                  {specName(d.sp, state.lang)} · {modeLabel(MODES[d.id], t)} · {state.lang === 'fr' ? d.slotFr : d.slotEn}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {MODES[d.id] === 'video' && (
                <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12.5 }} onClick={startVideo}>
                  {t('startVideo')}
                </button>
              )}
              <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12.5 }} onClick={() => send('results', i)}>
                {t('sendResults')}
              </button>
              <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12.5 }} onClick={() => send('rx', i)}>
                {t('sendRx')}
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
