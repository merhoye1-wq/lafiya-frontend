import { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { initials } from '../data/mockData';
import { fetchMyDocuments, downloadDocument } from '../services/api';

export default function Records() {
  const { state, t, showToast, isAuthenticated } = useApp();
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('ready');
      setDocs([]);
      return;
    }
    fetchMyDocuments()
      .then((data) => {
        setDocs(data.documents || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [isAuthenticated]);

  async function openFile(doc) {
    try {
      await downloadDocument(doc.id, doc.fileName);
    } catch {
      showToast(t('loadError'));
    }
  }

  return (
    <>
      <div className="eyebrow">{t('dashKicker')}</div>
      <div className="section-title">
        <h2>{t('past')}</h2>
      </div>

      {!isAuthenticated && <div className="empty">{t('loginRequiredToast')}</div>}
      {isAuthenticated && status === 'loading' && <div className="empty">{t('loadingDoctors')}</div>}
      {isAuthenticated && status === 'error' && <div className="empty">{t('loadError')}</div>}
      {isAuthenticated && status === 'ready' && docs.length === 0 && <div className="empty">{t('noUpcoming')}</div>}

      {isAuthenticated &&
        status === 'ready' &&
        docs.map((doc) => (
          <div className="card" style={{ marginBottom: 12 }} key={doc.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="avatar">{initials(doc.doctorName)}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{doc.doctorName}</div>
                  <div className="small">{new Date(doc.createdAt).toLocaleDateString(state.lang === 'fr' ? 'fr-FR' : 'en-US')}</div>
                </div>
              </div>
              <span className="badge badge-primary">{t('statusDone')}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="docfile" onClick={() => openFile(doc)}>
                <span className="filemark">{doc.kind === 'prescription' ? 'Rx' : 'PDF'}</span>
                {doc.kind === 'prescription' ? t('prescription') : t('bloodwork')}
              </button>
            </div>
          </div>
        ))}
    </>
  );
}
