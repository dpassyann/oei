# Boutique OEI ("store") — vue d'ensemble

*Spec destinée à un agent de développement (Claude Code ou équivalent) pour planifier et implémenter le nouveau chantier "boutique" du backend OEI. Rédigée avant tout code, conformément à la convention du projet (voir `.prompt/plan/`). À affiner si le porteur de projet objecte sur un point avant implémentation.*

## 0. Cadrage général

La boutique ("store") est un nouvel espace transverse, accessible **depuis chaque espace public et membre** du site OEI (pas un silo séparé) : catalogue de goodies, cartes de visite personnalisées, et impression/envoi papier de contenus déjà numériques (CV, Livre Blanc). Elle introduit deux capacités neuves au backend qui n'existaient pas jusqu'ici :

1. **Paiement réel** (carte bancaire via Stripe, PayPal) — jusqu'ici tout ce qui ressemblait à une transaction (cotisation, wallet) était mocké ; le store est le premier chantier où l'intégration à un fournisseur de paiement externe est réelle (en mode sandbox/test pour le développement, jamais de vraies clés en dur).
2. **Emails transactionnels envoyés par le backend Spring lui-même** (au-delà de ce que Keycloak gère déjà) — voir `03-emails-transactionnels.md` pour la démarcation précise entre les deux.

Ce document donne la vue d'ensemble produit. Le détail par sous-domaine est dans les fichiers suivants :

- `01-catalogue-produits.md` — modèle de catalogue, goodies, cartes de visite (parcours de personnalisation détaillé), impression/envoi CV et Livre Blanc.
- `02-paiement.md` — panier, checkout, paiement (Stripe + PayPal), échecs, remboursements.
- `03-emails-transactionnels.md` — démarcation Keycloak vs Spring Mail, liste des emails à envoyer, posture HTML+texte via Thymeleaf, fournisseur SMTP (Amazon SES).
- `04-architecture-technique.md` — le plus important : nouveau module `infrastructure/client`, contract-first pour Stripe/PayPal, pattern Enum Strategy + Binder pour `PaymentMethod`, modèle de domaine complet (`Product`, `Order`, `Payment`, etc.), endpoints OpenAPI à ajouter.

## 1. Principes produit

- **V1 pragmatique, V2 extensible.** La V1 couvre un catalogue volontairement restreint (stylos, cartes de visite, CV papier, Livre Blanc papier) mais le modèle de données ne doit **jamais** fermer la porte à l'ajout de nouvelles catégories de produits (attaché-case, t-shirts, etc. en V2) sans migration de schéma lourde — voir `01-catalogue-produits.md §1 Catégorie de produit`.
- **Fulfillment (impression/envoi papier) mocké en V1**, exactement dans la même posture que le Wallet (`WalletPass.mocked()`, voir `backend/domain/shared/src/main/java/global/oei/domain/shared/wallet/WalletPass.java`) et le rendu PDF du CV : aucun appel réel à un imprimeur/expéditeur, la commande est enregistrée avec un statut `PENDING_FULFILLMENT` et reste explicitement documentée comme telle (Javadoc sur l'agrégat `Order`, jamais un raccourci silencieux). Le paiement, lui, **n'est pas mocké** — Stripe/PayPal sont de vraies intégrations (en mode sandbox pour le développement).
- **Accessible de partout.** Le catalogue et le panier doivent être consultables aussi bien par un visiteur non authentifié (catalogue public en lecture seule, cf. `PublicStoreApi`) que par un membre connecté (qui peut passer commande, avec accès à ses propres données de profil pour pré-remplir la personnalisation des cartes de visite).
- **Réutilisation du profil membre.** La personnalisation de carte de visite reprend les données déjà modélisées : `Member`, `ProfessionalProfile` (voir `domain/shared/src/main/java/global/oei/domain/shared/profile/`), badges, etc. — pas de nouvelle saisie manuelle de ce qui existe déjà.

## 2. Ce qui N'EST PAS dans ce chantier (hors périmètre explicite)

- Un back-office fournisseur/imprimeur réel (pas de contrat d'impression signé à ce stade — c'est un choix produit assumé pour la V1, voir `01-catalogue-produits.md`).
- La gestion de stock/inventaire physique (les goodies sont supposés disponibles à la demande — pas de rupture de stock modélisée en V1 ; extensible en V2 si besoin réel).
- La facturation fiscale/comptable formelle (TVA, numérotation légale de facture) — hors périmètre de cette spec, à traiter séparément si le porteur de projet le demande explicitement plus tard.
- Les emails transactionnels de Keycloak (activation de compte, confirmation d'inscription, MFA) — **gérés par Keycloak lui-même**, pas par ce chantier. Voir `03-emails-transactionnels.md §0` pour la confirmation explicite de cette démarcation.

## 3. Plan de lecture recommandé pour l'implémentation

1. `04-architecture-technique.md` d'abord (le plus structurant : nouveau module Maven, pattern Enum Strategy, modèle de domaine).
2. `01-catalogue-produits.md` (Product/catégories/carte de visite/impression papier).
3. `02-paiement.md` (Order → Payment → confirmation).
4. `03-emails-transactionnels.md` (déclenchés par les événements ci-dessus).

Chaque sous-domaine suit la même exigence que tout le reste du backend OEI : contract-first (OpenAPI d'abord), domaine riche en `domain-shared`/`domain-core`, JPA + Liquibase en `infrastructure/persistence`, un `*Resource` par interface générée, wiring dans `OeiWiringConfiguration`, tests (Web + persistence + Cucumber) **dès l'implémentation de l'opération**, jamais après-coup.
