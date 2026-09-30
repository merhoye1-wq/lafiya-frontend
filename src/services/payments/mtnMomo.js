// Intégration MTN Mobile Money (Cameroun) — Collection API.
//
// Documentation développeur : https://momodeveloper.mtn.com/Cameroon_apitermsandcondition
// Le flux réel (collecte d'un paiement patient → professionnel) est :
//   1. Le BACKEND s'inscrit sur momodeveloper.mtn.com, obtient un abonnement
//      "Collections" et génère un jeu de clés API (Subscription Key, API User, API Key).
//   2. Le patient saisit son numéro MoMo côté client (ce fichier) et l'envoie au backend.
//   3. Le BACKEND appelle POST /collection/v1_0/requesttopay avec ces identifiants —
//      jamais depuis le navigateur : les clés MTN ne doivent JAMAIS être exposées côté client.
//   4. Le backend interroge GET /collection/v1_0/requesttopay/{referenceId} (polling ou
//      callback) jusqu'à confirmation, puis notifie le frontend (webhook → websocket/SSE,
//      ou simple retour de statut si le paiement est synchrone côté UI).
//
// Ce starter ne fait donc PAS d'appel réseau : il simule un paiement réussi après un court
// délai, pour que l'interface reste testable avant que le backend n'existe.

export async function initiateMomoPayment({ phoneNumber, amountFcfa, appointmentRef }) {
  if (!phoneNumber || !/^6\d{8}$/.test(phoneNumber.replace(/\s|\+237/g, ''))) {
    throw new Error('Numéro MTN Mobile Money invalide (format attendu : 6XXXXXXXX).');
  }

  // TODO(backend): remplacer cette simulation par un appel à votre endpoint,
  // ex. POST `${API_BASE}/payments/momo` avec { phoneNumber, amountFcfa, appointmentRef },
  // qui déclenchera lui-même la Collection API MTN côté serveur.
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    provider: 'mtn-momo',
    status: 'SUCCESS',
    reference: `MOMO-SIM-${Date.now()}`,
    amountFcfa,
    appointmentRef,
    simulated: true,
  };
}
