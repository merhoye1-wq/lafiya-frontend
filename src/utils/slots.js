// Générateur de créneaux de disponibilité — le backend ne modélise pas
// encore un agenda par médecin (seule règle réelle : un médecin ne peut pas
// avoir deux rendez-vous à la même minute, contrainte vérifiée côté serveur).
// On propose donc des créneaux plausibles en heures ouvrées, et la création
// du rendez-vous reste un vrai appel API qui peut être refusé si quelqu'un
// d'autre vient de prendre ce créneau (voir DoctorProfile.jsx).

const BUSINESS_START_HOUR = 8;
const BUSINESS_END_HOUR = 18;
const STEP_MINUTES_BY_MODE = { presentiel: 30, video: 20, domicile: 60 };

function stepFor(mode) {
  return STEP_MINUTES_BY_MODE[mode] || 30;
}

// Décale légèrement la grille selon l'identifiant du médecin pour éviter que
// tous les praticiens affichent exactement les mêmes créneaux "libres".
function seedOffset(doctorId) {
  let h = 0;
  for (let i = 0; i < doctorId.length; i++) h = (h * 31 + doctorId.charCodeAt(i)) % 97;
  return h;
}

export function generateUpcomingDays(doctorId, mode, { days = 6 } = {}) {
  const step = stepFor(mode);
  const offset = seedOffset(doctorId || 'x');
  const out = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    day.setHours(0, 0, 0, 0);

    const times = [];
    for (let m = BUSINESS_START_HOUR * 60; m < BUSINESS_END_HOUR * 60; m += step) {
      // Saute environ un créneau sur trois pour simuler un agenda partiellement rempli.
      if ((m / step + offset + d) % 3 === 0) continue;
      const slot = new Date(day);
      slot.setMinutes(m);
      if (slot.getTime() > Date.now() + 30 * 60 * 1000) {
        times.push(slot);
      }
    }
    if (times.length > 0) out.push({ date: day, times });
  }
  return out;
}

export function nextAvailableSlot(doctorId, mode) {
  const days = generateUpcomingDays(doctorId, mode, { days: 10 });
  for (const d of days) {
    if (d.times.length) return d.times[0];
  }
  return null;
}

export function formatDayLabel(date, lang) {
  const isToday = sameDay(date, new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = sameDay(date, tomorrow);
  if (isToday) return lang === 'fr' ? "Aujourd'hui" : 'Today';
  if (isTomorrow) return lang === 'fr' ? 'Demain' : 'Tomorrow';
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatTimeLabel(date, lang) {
  return date.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatSlotChip(date, lang) {
  return `${formatDayLabel(date, lang)} ${formatTimeLabel(date, lang)}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
