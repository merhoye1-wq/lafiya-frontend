// Notifications — WhatsApp, SMS, email.
//
// WhatsApp : à intégrer via la WhatsApp Business Platform (Cloud API) de Meta, en général
// par l'intermédiaire d'un fournisseur de solutions (BSP). Important pour le budget :
// Meta facture désormais au message envoyé, à partir du 1er octobre 2026 (auparavant la
// facturation était "par conversation") — à intégrer dans les coûts récurrents (voir
// cahier des charges, "Estimation du coût de développement").
//
// SMS : passerelle locale ou agrégateur régional, utilisée en secours quand WhatsApp
// n'est pas joignable (téléphone non connecté, numéro non enregistré sur WhatsApp).
//
// Email : utilisé pour l'envoi des résultats d'analyses et des ordonnances (obligation
// fonctionnelle du cahier des charges) — un simple fournisseur transactionnel (SMTP ou API,
// ex. un service compatible avec l'hébergement retenu) suffit pour la V1.
//
// Comme pour les paiements, ces fonctions ne font aucun appel réseau dans ce starter :
// elles simulent un envoi réussi pour que les pages restent testables sans backend.

export async function sendWhatsAppMessage({ toPhone, template, params }) {
  // TODO(backend): POST vers votre endpoint qui appelle la Cloud API WhatsApp.
  console.info('[notifications] WhatsApp (simulé) →', toPhone, template, params);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { channel: 'whatsapp', status: 'sent', simulated: true };
}

export async function sendSms({ toPhone, message }) {
  // TODO(backend): POST vers votre endpoint qui appelle la passerelle SMS retenue.
  console.info('[notifications] SMS (simulé) →', toPhone, message);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { channel: 'sms', status: 'sent', simulated: true };
}

export async function sendEmailDocument({ toEmail, kind, appointmentRef }) {
  // kind: 'results' | 'prescription'
  // TODO(backend): déclencher l'envoi réel du PDF (résultats/ordonnance) au patient,
  // avec chiffrement en transit et conservation limitée conformément à la loi n° 2024/017
  // (voir cahier des charges, "Sécurité et conformité").
  console.info('[notifications] Email (simulé) →', toEmail, kind, appointmentRef);
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { channel: 'email', status: 'sent', simulated: true };
}
