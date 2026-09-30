// Client API — connecté au vrai backend Lafiya (Node/Express/Prisma) déployé
// sur Render : https://lafiya-backend-yolx.onrender.com
//
// VITE_API_BASE_URL est définie dans .env (voir .env.example). Tant qu'elle
// est vide, les fonctions ci-dessous lèvent une erreur explicite plutôt que
// d'échouer silencieusement.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'lafiya_token';
const USER_KEY = 'lafiya_user';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage indisponible (navigation privée, etc.) : la session ne
    // survivra pas à un rechargement, mais l'app reste utilisable.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* noop */
  }
}

class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `Erreur API (${status})`);
    this.status = status;
    this.code = body?.error;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body, auth = false, params } = {}) {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL n'est pas configurée : impossible de contacter le serveur Lafiya.");
  }
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''));
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error("Impossible de joindre le serveur Lafiya. Vérifiez votre connexion internet et réessayez.");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data;
}

// --- Authentification -------------------------------------------------

export function signupPatient({ firstName, lastName, email, password, phone }) {
  return request('/api/auth/signup/patient', { method: 'POST', body: { firstName, lastName, email, password, phone } });
}

export function signupDoctor(payload) {
  return request('/api/auth/signup/doctor', { method: 'POST', body: payload });
}

export function login(email, password) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function fetchMe() {
  return request('/api/auth/me', { auth: true });
}

// --- Médecins -----------------------------------------------------------

export function fetchDoctors({ specialty, city, q } = {}) {
  return request('/api/doctors', { params: { specialty, city, q } });
}

export function fetchDoctor(id) {
  return request(`/api/doctors/${id}`);
}

export function fetchDoctorQueue() {
  return request('/api/doctors/me/appointments', { auth: true });
}

// --- Rendez-vous ----------------------------------------------------------

export function createAppointment({ doctorId, scheduledAt, mode, address }) {
  return request('/api/appointments', { method: 'POST', auth: true, body: { doctorId, scheduledAt, mode, address } });
}

export function fetchMyAppointments() {
  return request('/api/appointments/me', { auth: true });
}

export function cancelAppointment(id) {
  return request(`/api/appointments/${id}/cancel`, { method: 'POST', auth: true });
}

// --- Paiements ------------------------------------------------------------

export function initiatePayment({ appointmentId, method, phoneNumber }) {
  return request('/api/payments/initiate', { method: 'POST', auth: true, body: { appointmentId, method, phoneNumber } });
}

export function getPaymentStatus(appointmentId) {
  return request(`/api/payments/${appointmentId}/status`, { auth: true });
}

// Raccourci "démo" prévu par le backend pour confirmer immédiatement un
// paiement Mobile Money simulé, sans attendre le délai artificiel de
// quelques secondes (voir prisma/README et payments.routes.js côté serveur).
export function simulateConfirmPayment(appointmentId) {
  return request(`/api/payments/${appointmentId}/simulate-confirm`, { method: 'POST', auth: true });
}

// --- Documents (résultats / ordonnances) -----------------------------------

export function fetchMyDocuments() {
  return request('/api/documents/mine', { auth: true });
}

// Le téléchargement exige un jeton Bearer (impossible avec un simple lien
// <a href>), donc on récupère le PDF en mémoire puis on déclenche l'enregistrement.
export async function downloadDocument(id, fileName) {
  if (!BASE_URL) throw new Error("VITE_API_BASE_URL n'est pas configurée.");
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'document.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export { ApiError };
