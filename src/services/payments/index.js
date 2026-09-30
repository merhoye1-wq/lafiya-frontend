import { initiateMomoPayment } from './mtnMomo';
import { initiateOrangeMoneyPayment } from './orangeMoney';

// Point d'entrée unique utilisé par la page de paiement (voir src/pages/Payment.jsx).
// `method` est l'un de : 'momo' | 'orange' | 'card'.
export async function initiatePayment(method, args) {
  switch (method) {
    case 'momo':
      return initiateMomoPayment(args);
    case 'orange':
      return initiateOrangeMoneyPayment(args);
    case 'card':
      // TODO(backend): brancher un prestataire carte (ex. Stripe n'opère pas au Cameroun ;
      // envisager un agrégateur régional qui accepte aussi Visa/Mastercard, voir CamerPay).
      await new Promise((resolve) => setTimeout(resolve, 900));
      return { provider: 'card', status: 'SUCCESS', reference: `CARD-SIM-${Date.now()}`, simulated: true };
    default:
      throw new Error(`Moyen de paiement inconnu : ${method}`);
  }
}
