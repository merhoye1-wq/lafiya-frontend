import { createContext, useContext, useMemo, useReducer, useCallback } from 'react';
import { useT } from '../i18n/strings';
import { getToken, getStoredUser, storeSession, clearSession } from '../services/api';

const AppStateContext = createContext(null);

const initialState = {
  lang: 'fr',
  role: 'patient', // 'patient' | 'doctor' — bascule d'affichage uniquement (démo)
  toast: null,
  auth: {
    token: getToken(),
    user: getStoredUser(),
  },
  booking: {
    symptom: null,
    specialty: null,
    doctorId: null,
    mode: null,
    scheduledAt: null, // ISO string réel, choisi par le patient
    address: { quartier: '', ville: '', tel: '', note: '' },
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_LANG':
      return { ...state, lang: state.lang === 'fr' ? 'en' : 'fr' };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_TOAST':
      return { ...state, toast: action.message };
    case 'AUTH_SUCCESS':
      storeSession(action.token, action.user);
      return { ...state, auth: { token: action.token, user: action.user }, role: action.user.role === 'doctor' ? 'doctor' : 'patient' };
    case 'LOGOUT':
      clearSession();
      return { ...state, auth: { token: null, user: null } };
    case 'PICK_SYMPTOM':
      return { ...state, booking: { ...state.booking, symptom: action.symptomId, specialty: action.specialtyId } };
    case 'PICK_SPECIALTY':
      return { ...state, booking: { ...state.booking, specialty: action.specialtyId, symptom: null } };
    case 'START_BOOKING':
      return {
        ...state,
        booking: { ...state.booking, doctorId: action.doctorId, mode: null, scheduledAt: null },
      };
    case 'PICK_MODE':
      return { ...state, booking: { ...state.booking, mode: action.mode } };
    case 'PICK_DATETIME':
      return { ...state, booking: { ...state.booking, scheduledAt: action.scheduledAt } };
    case 'UPDATE_ADDRESS':
      return {
        ...state,
        booking: { ...state.booking, address: { ...state.booking.address, [action.field]: action.value } },
      };
    case 'RESET_BOOKING':
      return { ...state, booking: { ...initialState.booking } };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const t = useT(state.lang);

  const showToast = useCallback(
    (message) => {
      dispatch({ type: 'SET_TOAST', message });
      window.clearTimeout(showToast._id);
      showToast._id = window.setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 2600);
    },
    [dispatch]
  );

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), [dispatch]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      t,
      showToast,
      logout,
      isAuthenticated: Boolean(state.auth.token),
      user: state.auth.user,
    }),
    [state, t, showToast, logout]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp() doit être utilisé sous <AppProvider>');
  return ctx;
}
