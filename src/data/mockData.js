// Données de démonstration — à remplacer par des appels à l'API réelle
// (voir src/services/api.js) une fois le backend disponible.
// Le format est volontairement proche de ce qu'un backend REST renverrait,
// pour limiter les changements le jour de la bascule.

export const SPECIALTIES = [
  { id: 'generale', fr: 'Médecine générale', en: 'General medicine' },
  { id: 'cardio', fr: 'Cardiologie', en: 'Cardiology' },
  { id: 'gyneco', fr: 'Gynécologie-Obstétrique', en: 'Obstetrics & Gynecology' },
  { id: 'pediatrie', fr: 'Pédiatrie', en: 'Pediatrics' },
  { id: 'dermato', fr: 'Dermatologie', en: 'Dermatology' },
  { id: 'endocrino', fr: 'Endocrinologie', en: 'Endocrinology' },
  { id: 'pneumo', fr: 'Pneumologie', en: 'Pulmonology' },
  { id: 'rhumato', fr: 'Rhumatologie', en: 'Rheumatology' },
  { id: 'ophtalmo', fr: 'Ophtalmologie', en: 'Ophthalmology' },
  { id: 'psy', fr: 'Santé mentale', en: 'Mental health' },
  { id: 'labo', fr: 'Analyses à domicile', en: 'Home lab tests' },
];

// La "passerelle" symptôme → spécialité demandée dans le cahier des charges.
// En V2/V3 cette table peut être remplacée par un service de triage plus riche
// (voir src/services/triage.js).
export const SYMPTOMS = [
  { id: 'fievre', fr: 'Fièvre, grippe, fatigue', en: 'Fever, flu, fatigue', sp: 'generale' },
  { id: 'thorax', fr: 'Douleur thoracique, palpitations', en: 'Chest pain, palpitations', sp: 'cardio' },
  { id: 'grossesse', fr: 'Grossesse, suivi gynécologique', en: 'Pregnancy, gynecological care', sp: 'gyneco' },
  { id: 'enfant', fr: 'Enfant malade, vaccination', en: 'Sick child, vaccination', sp: 'pediatrie' },
  { id: 'peau', fr: 'Éruption cutanée, acné', en: 'Skin rash, acne', sp: 'dermato' },
  { id: 'diabete', fr: 'Diabète, troubles hormonaux', en: 'Diabetes, hormonal issues', sp: 'endocrino' },
  { id: 'respir', fr: 'Toux persistante, essoufflement', en: 'Persistent cough, breathlessness', sp: 'pneumo' },
  { id: 'articulations', fr: 'Douleurs articulaires', en: 'Joint pain', sp: 'rhumato' },
  { id: 'yeux', fr: 'Vision trouble, œil rouge', en: 'Blurred vision, red eye', sp: 'ophtalmo' },
  { id: 'stress', fr: 'Anxiété, stress, sommeil', en: 'Anxiety, stress, sleep', sp: 'psy' },
  { id: 'bilan', fr: 'Bilan sanguin de routine', en: 'Routine blood work', sp: 'labo' },
];

export const DOCTORS = [
  { id: 'd1', name: 'Dr Aïssatou Ndjidda', sp: 'generale', city: 'Garoua', langs: ['FR', 'Fulfulde'], modes: ['presentiel', 'video', 'domicile'], price: 8000, homePrice: 12000, rating: 4.8, slotFr: "Aujourd'hui 15:30", slotEn: 'Today 3:30 PM' },
  { id: 'd2', name: 'Dr Paul Mbarga', sp: 'cardio', city: 'Yaoundé', langs: ['FR', 'EN'], modes: ['presentiel', 'video'], price: 15000, rating: 4.9, slotFr: 'Demain 09:00', slotEn: 'Tomorrow 9:00 AM' },
  { id: 'd3', name: 'Dr Fatimatou Oumarou', sp: 'gyneco', city: 'Garoua', langs: ['FR', 'Fulfulde'], modes: ['presentiel', 'video'], price: 12000, rating: 4.7, slotFr: "Aujourd'hui 17:00", slotEn: 'Today 5:00 PM' },
  { id: 'd4', name: 'Dr Serge Eloundou', sp: 'pediatrie', city: 'Douala', langs: ['FR', 'EN'], modes: ['presentiel', 'video', 'domicile'], price: 10000, homePrice: 14000, rating: 4.9, slotFr: 'Demain 10:30', slotEn: 'Tomorrow 10:30 AM' },
  { id: 'd5', name: 'Dr Brenda Fokou', sp: 'dermato', city: 'Douala', langs: ['FR', 'EN'], modes: ['video'], price: 9000, rating: 4.6, slotFr: "Aujourd'hui 18:00", slotEn: 'Today 6:00 PM' },
  { id: 'd6', name: 'Dr Hamadou Bello', sp: 'endocrino', city: 'Maroua', langs: ['FR', 'Fulfulde'], modes: ['presentiel', 'video', 'domicile'], price: 13000, homePrice: 16000, rating: 4.8, slotFr: 'Jeudi 11:00', slotEn: 'Thursday 11:00 AM' },
  { id: 'd7', name: 'Dr Clarisse Ateba', sp: 'pneumo', city: 'Yaoundé', langs: ['FR', 'EN'], modes: ['presentiel', 'video'], price: 14000, rating: 4.7, slotFr: 'Demain 14:00', slotEn: 'Tomorrow 2:00 PM' },
  { id: 'd8', name: 'Dr Jean-Marie Nkeng', sp: 'rhumato', city: 'Douala', langs: ['FR'], modes: ['presentiel', 'video'], price: 12000, rating: 4.5, slotFr: 'Vendredi 09:30', slotEn: 'Friday 9:30 AM' },
  { id: 'd9', name: 'Dr Aminatou Sali', sp: 'ophtalmo', city: 'Garoua', langs: ['FR', 'Fulfulde'], modes: ['presentiel'], price: 10000, rating: 4.6, slotFr: 'Demain 16:00', slotEn: 'Tomorrow 4:00 PM' },
  { id: 'd10', name: 'Dr Ruth Ebogo', sp: 'psy', city: 'Yaoundé', langs: ['FR', 'EN'], modes: ['video'], price: 8000, rating: 4.9, slotFr: "Aujourd'hui 20:00", slotEn: 'Today 8:00 PM' },
  { id: 'd11', name: 'Inf. Moussa Adamou', sp: 'labo', city: 'Garoua / Ngaoundéré', langs: ['FR', 'Fulfulde'], modes: ['domicile'], price: 0, homePrice: 6000, rating: 4.8, slotFr: "Aujourd'hui, 08:00–18:00", slotEn: 'Today, 8:00 AM–6:00 PM' },
  { id: 'd12', name: 'Dr Aïcha Mballa', sp: 'generale', city: 'Ngaoundéré', langs: ['FR', 'Fulfulde', 'EN'], modes: ['video', 'domicile'], price: 7000, homePrice: 11000, rating: 4.7, slotFr: "Aujourd'hui 12:00", slotEn: 'Today 12:00 PM' },
];

export const SLOTS_FR = ["Aujourd'hui 15:30", "Aujourd'hui 18:00", 'Demain 09:00', 'Demain 11:30', 'Demain 16:00', 'Jeudi 10:00'];
export const SLOTS_EN = ['Today 3:30 PM', 'Today 6:00 PM', 'Tomorrow 9:00 AM', 'Tomorrow 11:30 AM', 'Tomorrow 4:00 PM', 'Thursday 10:00 AM'];

export function specName(id, lang) {
  const s = SPECIALTIES.find((x) => x.id === id);
  return s ? s[lang] : '';
}

export function docById(id) {
  return DOCTORS.find((d) => d.id === id);
}

export function initials(name) {
  return name
    .replace(/^(Dr|Inf\.)\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function money(n) {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ');
}

export function modeLabel(m, t) {
  return m === 'presentiel' ? t('modeInPerson') : m === 'video' ? t('modeVideo') : t('modeHome');
}
