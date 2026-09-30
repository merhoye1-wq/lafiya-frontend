import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext';

// Renvoie vers /compte tout visiteur non connecté qui tente d'accéder à une
// page nécessitant un compte patient (paiement, tableau de bord).
export default function RequireAuth({ children }) {
  const { isAuthenticated, showToast, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      showToast(t('loginRequiredToast'));
      navigate('/compte', { replace: true, state: { from: location.pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) return null;
  return children;
}
