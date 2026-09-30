# Lafiya Santé — base de code technique

Base de démarrage React (Vite) pour Lafiya, la plateforme camerounaise de mise en
relation patients / professionnels de santé. Elle reprend les écrans du prototype
visuel déjà validé (recherche par symptôme, prise de rendez-vous présentiel /
vidéo / domicile, paiement Mobile Money, espace patient, espace médecin) sous
forme d'un vrai projet React, prêt à être repris par un développeur pour le
brancher à un backend réel.

Pour le contexte complet du projet (positionnement, fonctionnalités détaillées,
architecture cible, conformité, modèle économique, budget), voir le **cahier
des charges** rédigé en parallèle.

## Démarrer le projet

```bash
npm install
npm run dev       # démarre le serveur de développement (http://localhost:5173)
npm run build      # build de production dans dist/
npm run preview    # sert le build de production en local
```

Aucune clé ni compte n'est nécessaire pour lancer le projet : tout fonctionne
sur des données de démonstration.

## Ce qui est réel vs simulé dans ce starter

| Élément | État dans ce starter |
| --- | --- |
| Interface patient et professionnel (écrans, navigation, i18n FR/EN) | Réel — code React fonctionnel |
| Annuaire médecins, spécialités, symptômes | Données de démonstration (`src/data/mockData.js`) |
| Paiement MTN MoMo / Orange Money / carte | **Simulé** — voir `src/services/payments/` |
| WhatsApp / SMS / email (confirmations, résultats, ordonnances) | **Simulé** — voir `src/services/notifications.js` |
| Téléconsultation vidéo | **Simulé** (pas d'appel vidéo réel) |
| Authentification, dossier patient persistant | Non implémenté — à construire avec le backend |

Chaque fichier de service (`src/services/**`) documente précisément, en
commentaire, ce qu'il faudra brancher (endpoint, API tierce, clés) pour passer
du mode démonstration au mode réel — voir en particulier :

- `src/services/payments/mtnMomo.js` — Collection API MTN MoMo
- `src/services/payments/orangeMoney.js` — API Orange Money ou agrégateur (ex. CamerPay)
- `src/services/notifications.js` — WhatsApp Business Platform, SMS, email

## Structure du projet

```
src/
  components/       Shell (topbar, navigation), Toast
  data/             Données de démonstration (spécialités, symptômes, médecins)
  i18n/             Chaînes français / anglais
  pages/            Un fichier par écran patient (Home, Find, Results, DoctorProfile,
                     Payment, Confirmation, Dashboard, Records)
  pages/pro/        Écrans de l'espace médecin (Queue, Patients)
  services/         Points d'intégration : api.js, payments/, notifications.js
  state/            État global (React Context + useReducer) — langue, rôle,
                     réservation en cours, rendez-vous, historique
  styles/           tokens.css (palette/typographie) + global.css
```

## Prochaines étapes techniques

1. Développer le backend (API REST) et brancher `src/services/api.js`.
2. Remplacer les fonctions simulées de `src/services/payments/` par de vrais
   appels serveur vers MTN MoMo et Orange Money (les clés API ne doivent
   jamais être exposées côté client).
3. Brancher `src/services/notifications.js` à un fournisseur WhatsApp Business
   Platform, une passerelle SMS et un service d'envoi d'email.
4. Ajouter l'authentification patient/médecin et un vrai dossier patient
   (actuellement, tout l'état vit en mémoire côté navigateur et se réinitialise
   au rechargement).
5. Ajouter les traductions Fulfulde et Pidgin English dans `src/i18n/strings.js`
   (prévu en V3 du cahier des charges).
