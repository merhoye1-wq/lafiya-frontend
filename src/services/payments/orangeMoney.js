// Intégration Orange Money (Cameroun).
//
// Deux options à trancher côté backend (voir cahier des charges, "Architecture technique") :
//   A. Intégration directe via l'API locale/USSD Orange (portail Orange Developer Cameroun :
//      https://www.orange.cm/fr/orange-developer.html) — contrôle total, mais un contrat et
//      une intégration distincts de ceux de MTN.
//   B. Passer par un agrégateur qui mutualise MTN MoMo et Orange Money en une seule intégration
//      (ex. CamerPay, Y-Note) — plus rapide à mettre en place, commission de l'ordre de 1,5 à 3 %
//      selon le palier (voir modèle économique du cahier des charges).
//
// Comme pour MTN MoMo, la clé API ne doit jamais être exposée côté client : ce fichier
// n'appelle donc aucun service externe et simule un paiement réussi.

export async function initiateOrangeMoneyPayment({ phoneNumber, amountFcfa, appointmentRef }) {
  if (!phoneNumber || !/^6\d{8}$/.test(phoneNumber.replace(/\s|\+237/g, ''))) {
    throw new Error('Numéro Orange Money invalide (format attendu : 6XXXXXXXX).');
  }

  // TODO(backend): remplacer par un appel à votre endpoint, ex.
  // POST `${API_BASE}/payments/orange-money`, qui appellera l'API Orange (directe ou agrégateur).
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    provider: 'orange-money',
    status: 'SUCCESS',
    reference: `OM-SIM-${Date.now()}`,
    amountFcfa,
    appointmentRef,
    simulated: true,
  };
}
