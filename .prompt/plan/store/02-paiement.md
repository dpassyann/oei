# Boutique OEI — paiement

## 1. Parcours panier → checkout → paiement → confirmation

1. **Panier** (`Cart`, transitoire — pas nécessairement persisté tant qu'il n'est pas transformé en commande ; peut être un objet côté session/porté par le frontend, à trancher en implémentation selon si le porteur veut un panier persistant entre deux visites — par défaut V1 : panier non persisté côté backend, le frontend envoie directement les lignes au moment du checkout, pas de `GET /cart` à maintenir en base). Si le porteur confirme vouloir un panier persistant multi-session, ajouter un agrégat `Cart`/`CartLine` suivant exactement le même schéma qu'`Order`/`OrderLine` — décision à valider avant implémentation si elle change le périmètre.
2. **Checkout.** Le membre (ou visiteur, si achat sans compte autorisé — à confirmer, par défaut V1 : achat réservé aux membres connectés, cohérent avec "accessible depuis chaque espace public/membre" en lecture du catalogue mais achat authentifié) soumet ses lignes de commande (produit + quantité + personnalisation éventuelle) et choisit un moyen de paiement (`PaymentMethod.CARD` ou `PaymentMethod.PAYPAL`, voir `04-architecture-technique.md §2`).
3. **Création de la commande.** `Order` est créé au statut `OrderStatus.PENDING_PAYMENT`, montant total calculé serveur (jamais fait confiance au montant envoyé par le client), avant tout appel au fournisseur de paiement.
4. **Paiement.** Le backend délègue au `PaymentProviderPort` résolu via l'enum `PaymentMethod` (pattern Enum Strategy + Binder, voir `04-architecture-technique.md §2`) — `charge(...)` initie/confirme le paiement auprès de Stripe ou PayPal (sandbox en développement).
5. **Confirmation.**
   - Paiement réussi → `Order.status = PAID` (ou `PENDING_FULFILLMENT` si le passage à ce statut est immédiat après paiement — voir §4 ci-dessous pour la nuance) + `Payment` créé/mis à jour au statut `PaymentStatus.SUCCEEDED` + email de confirmation de commande envoyé (voir `03-emails-transactionnels.md`).
   - Paiement échoué → `Order.status = PAYMENT_FAILED`, `Payment.status = FAILED`, message d'erreur exploitable renvoyé au frontend (jamais l'exception brute du fournisseur — mapper vers un message métier stable, cf. squelette d'erreur déjà en place ailleurs dans ce backend pour les `ValidationError`).
6. **Email de confirmation.** Déclenché uniquement après paiement réussi (jamais avant, jamais en cas d'échec) — voir `03-emails-transactionnels.md §2`.

## 2. Statuts

### `OrderStatus`

```
PENDING_PAYMENT -> PAID -> PENDING_FULFILLMENT -> (V2 seulement: SHIPPED -> DELIVERED)
                \-> PAYMENT_FAILED
PENDING_PAYMENT/PAID -> CANCELLED (annulation avant expédition, V1: toujours possible tant que PENDING_FULFILLMENT)
PAID/PENDING_FULFILLMENT -> REFUNDED (remboursement, voir §3)
```

Décision V1 : `PAID` et `PENDING_FULFILLMENT` sont deux statuts distincts (pas fusionnés) même si en V1 le passage de l'un à l'autre est immédiat et automatique après confirmation du paiement — cela documente honnêtement que "payé" et "en attente de traitement physique mocké" sont deux faits différents, et prépare le terrain pour la V2 où un vrai fulfillment provider pourrait introduire un délai réel entre les deux.

### `PaymentStatus`

```
PENDING -> SUCCEEDED
        -> FAILED
SUCCEEDED -> REFUNDED
```

## 3. Remboursements

- `PaymentProviderPort.refund(...)` (voir `04-architecture-technique.md §2`) délègue au même fournisseur que celui utilisé pour le paiement d'origine (un remboursement Stripe ne peut pas être exécuté via PayPal et inversement — `Payment` conserve donc quelle `PaymentMethod`/quel provider a traité le paiement d'origine, pas seulement le moyen "carte"/"PayPal" déclaré par l'utilisateur).
- Remboursement total uniquement en V1 (pas de remboursement partiel — simplification assumée, à documenter).
- Déclenchement : action admin (nouvel endpoint `POST /api/admin/v1/store/orders/{id}/refund` — voir `04-architecture-technique.md §5`), jamais déclenché automatiquement par le membre lui-même en V1 (pas de self-service refund — cohérent avec l'absence de vrai contrat de fulfillment/retour marchandise).
- Un remboursement réussi transitionne `Order` vers `REFUNDED` et `Payment` vers `REFUNDED` ; aucun email de remboursement n'est explicitement demandé par le porteur de projet dans cette itération — à ajouter facilement plus tard en suivant le même pattern Thymeleaf que les autres emails si demandé.

## 4. Gestion des échecs de paiement

- Un échec de paiement (carte refusée, PayPal annulé côté fournisseur, timeout réseau vers le fournisseur) ne doit **jamais** laisser une commande dans un état ambigu : `Order.status` passe explicitement à `PAYMENT_FAILED`, et le membre peut retenter (nouvelle tentative = nouvel objet `Payment` rattaché à la même `Order`, pas une nouvelle `Order` — l'historique des tentatives est conservé).
- Timeouts/erreurs techniques du fournisseur (pas un refus métier du paiement lui-même) doivent être distingués d'un refus explicite (carte refusée) dans le message renvoyé au frontend — mapper les erreurs Stripe/PayPal (codes d'erreur documentés dans leurs specs OpenAPI respectives) vers un petit vocabulaire d'erreurs stable côté OEI (ex. `PaymentFailureReason` — enum: `CARD_DECLINED`, `PROVIDER_TIMEOUT`, `USER_CANCELLED`, `UNKNOWN`), pour rester cohérent avec la règle projet "ne jamais laisser fuiter le nom d'une exception Java ou une erreur de fournisseur brute dans un contrat public".

## 5. Sandbox / clés de test (rappel sécurité)

- Développement : clés Stripe (`sk_test_...`) et identifiants sandbox PayPal, jamais en dur dans le code ni committées — via variables d'environnement, exactement comme `OEI_DB_PASSWORD`/`OEI_OIDC_ISSUER_URI` déjà en place (`application/web/src/main/resources/application.yml`). Prévoir `OEI_STRIPE_API_KEY`, `OEI_PAYPAL_CLIENT_ID`, `OEI_PAYPAL_CLIENT_SECRET` (noms indicatifs, à harmoniser en implémentation).
- Production : vraies clés Stripe/PayPal live, injectées par la même chaîne de secrets que le reste de l'infra AWS déjà décidée (hors périmètre de cette spec backend).
