# Configuration Stripe — checklist pour tester le paiement de bout en bout en local

## Ce qui existe déjà côté code (backend)

- `StripePaymentProviderAdapter` (`backend/infrastructure/client/.../stripe/`) : appelle Stripe de façon synchrone (`PaymentIntentsApi`) pour créer/confirmer un paiement carte, et `RefundsApi` pour les remboursements.
- `StripeWebhookResource` (`backend/application/web/.../resource/store/webhook/`) : endpoint qui reçoit les notifications Stripe (`payment_intent.succeeded` / `payment_intent.payment_failed`), vérifie la signature HMAC, et met à jour le `Payment` correspondant de façon idempotente (verrou en base contre les doublons/rejeux).
- Route exposée : `POST /api/public/v1/webhooks/stripe` (publique, sans token Keycloak — Stripe s'authentifie via la signature, pas via OAuth).

Ce qui **n'existe pas encore** : le formulaire de paiement carte réel côté frontend (Stripe Elements) — la page `cotisation` actuelle est un mock volontaire qui ne doit jamais capturer un vrai numéro de carte.

## 1. Créer/ouvrir votre compte Stripe

1. Aller sur https://dashboard.stripe.com et créer un compte (ou se connecter).
2. Rester en **mode Test** (bascule en haut à droite du dashboard) — aucune vérification d'entreprise n'est nécessaire pour tester.

## 2. Récupérer les clés API de test

Dashboard → **Developers** → **API keys** :

| Clé | Exemple | Usage | Où la mettre |
|---|---|---|---|
| Clé publique | `pk_test_...` | Frontend (Stripe Elements/Stripe.js) | `frontend/oei-web/public/config.json` (pas un secret) |
| Clé secrète | `sk_test_...` | Backend (appels API Stripe) | `OEI_STRIPE_API_KEY` (local : `infra/.env` ou fichier de secrets local, jamais commité) |

## 3. Installer le Stripe CLI (obligatoire pour tester le webhook en local)

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

`stripe login` ouvre votre navigateur pour lier le CLI à votre compte Stripe (mode test).

## 4. Démarrer le forwarding webhook vers votre backend local

Une fois le backend lancé en local (port 8080 par défaut) :

```bash
stripe listen --forward-to localhost:8080/api/public/v1/webhooks/stripe
```

Cette commande :
- reste active en arrière-plan (gardez le terminal ouvert pendant vos tests),
- affiche un secret `whsec_...` **au démarrage** — c'est le secret de signature à utiliser en local.

## 5. Configurer les variables d'environnement locales

Dans `infra/.env` (ou votre fichier de secrets local ignoré par git) :

```
OEI_STRIPE_API_KEY=sk_test_xxxxxxxxxxxx
OEI_STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

Redémarrez le backend après avoir renseigné ces valeurs (Spring les lit au démarrage).

**Important** : si `OEI_STRIPE_WEBHOOK_SECRET` est vide ou absent, l'endpoint webhook répond volontairement `503` (fail-closed) plutôt que d'accepter des requêtes non vérifiées — c'est voulu, pas un bug.

## 6. Déclencher un paiement de test de bout en bout

Deux façons de tester :

**A. Via le Stripe CLI directement (sans repasser par le frontend), pour valider juste le webhook :**
```bash
stripe trigger payment_intent.succeeded
```
Vous devez voir dans les logs backend la transition du `Payment` correspondant vers `SUCCEEDED`.

**B. Via un vrai flux applicatif** (une fois le composant Stripe Elements frontend branché — prochaine tâche) : utilisez une carte de test Stripe, par exemple :
- `4242 4242 4242 4242` — paiement toujours accepté
- `4000 0000 0000 0002` — paiement toujours refusé (pour tester le chemin d'échec)
- N'importe quelle date d'expiration future, n'importe quel CVC à 3 chiffres.

Liste complète des cartes de test : https://docs.stripe.com/testing

## 7. Ce qu'il reste à construire côté code avant que le flux complet fonctionne

- [ ] Frontend : remplacer le formulaire carte mocké de `cotisation.ts` par **Stripe Elements** (`@stripe/stripe-js`), qui tokenise le numéro de carte directement dans un iframe Stripe (jamais transmis à notre backend).
- [ ] Backend : endpoint pour créer un `PaymentIntent` associé à une intention d'achat (adhésion ou CV) et renvoyer son `client_secret` au frontend.
- [ ] Brancher `PayMembershipFeeService` (aujourd'hui mocké, tout est `PAID` sans appel réel) sur `PaymentProviderPort`/Stripe, comme le fait déjà `PayOrderService` pour la boutique.

## 8. Ne jamais faire

- Ne jamais mettre `sk_test_...` ou `whsec_...` dans un fichier suivi par git.
- Ne jamais utiliser une clé `sk_live_...`/`pk_live_...` en local — mode Test uniquement tant qu'on développe.
- Ne jamais laisser un `<input>` HTML brut collecter un numéro de carte réel (hors périmètre PCI-DSS pour un site marchand).
