# ADR 0002 — Fondations transverses V2 (contrat, rôles, arborescence)

- Statut : accepté
- Date : 2026-08-04
- Portée : fondations transverses préparant 3 chantiers parallèles (espace membre
  individuel, espace membre institutionnel, CMS/gouvernance documentaire) décrits
  dans `.prompt/plan/02-*.md`, `03-*.md`, `04-*.md`, sous les priorités et
  milestones de `.prompt/plan/05-PLAN-DE-DEVELOPPEMENT-V1.md`.
- Ne couvre AUCUNE implémentation fonctionnelle (pas de composant Angular, pas
  d'adapter mock concret, pas de backend) : uniquement le contrat, le modèle de
  rôles et l'arborescence partagée que les 3 chantiers suivants doivent respecter
  pour rester cohérents entre eux.

## Contexte

Les 3 chantiers vont être développés en parallèle (probablement par des agents
différents). Sans un contrat commun posé en amont, chacun risque d'inventer sa
propre convention de nommage d'endpoints, de rôles et de structure de dossiers,
rendant l'intégration ultérieure coûteuse. Cet ADR fige les décisions
structurantes prises pour éviter cette divergence.

## Décision 1 — Contrat OpenAPI (`frontend/oei-web/openapi/oei-api.yaml`)

- **Étendu, pas remplacé.** L'unique endpoint historique
  `GET /content/{lang}/{slug}` est conservé identique (même chemin hors préfixe
  versionné, même schéma `ContentDocument`) car `content-api.adapter.ts` l'utilise
  déjà en production simulée. Toute nouvelle route de contenu public vit sous
  `/api/public/v1/content` et `/api/public/v1/documents`.
- **Versionnement par préfixe de rôle**, repris tel quel des 3 documents de
  spec : `/api/public/v1/**` (aucune auth), `/api/member/v1/**` (rôle `member`),
  `/api/institution/v1/**` (rôle `institution-*`, résolu pour une institution
  précise via le token — voir Décision 2), `/api/admin/v1/**` (rôle `admin`).
- **~90 opérations, ~90 schémas**, organisés par tag correspondant aux domaines du
  §Architecture de `00-CONTEXTE-GLOBAL-OEI.md` (identity, membership, profile, cv,
  certification, badge, institution, cms, governance) plus `wallet` et `public-*`.
  Toutes les entités des 3 "Modèles minimaux" (docs 02/03/04) sont représentées à
  l'exception de cinq entités volontairement conservées comme schémas
  documentaires sans endpoint dédié en V1 (`RecognizedCertification`,
  `ContentComment`, `ContentDecision`, `DocumentSource`,
  `InstitutionContribution`) : elles sont référencées par d'autres schémas ou
  décrivent un sous-objet qui sera exposé via l'entité parente
  (`Certification.recognizedCertificationId`,
  `ContentVersion`/`ContentContribution`) plutôt que par un CRUD séparé, pour ne
  pas complexifier prématurément le contrat. Le linter `openapi-generator-cli
  validate` les signale en "Unused model" — c'est attendu et documenté ici plutôt
  que "corrigé" en ajoutant des endpoints artificiels.
- **Réutilisation par `$ref`** systématique : schémas de base (`Error`,
  `PageMetadata`), value objects composites via `allOf` (`Certification` =
  `CertificationDeclaration` + champs serveur, même pattern pour `Cv`,
  `InstitutionPublication`, `InstitutionOpportunity`, `InstitutionInvitation`,
  `VerificationRequest`, `ContentVersion`, `Content`, `ContentApproval`,
  `ContentContribution`, `BookCompilation`).
- **CV/CMS restent volontairement "gros objets", pas de CRUD explosé par
  sous-champ.** `PUT /api/member/v1/profile` remplace tout le
  `ProfessionalProfile` (expériences/formations/compétences inclus) plutôt que
  d'exposer un `POST/PUT/DELETE` par `Experience`/`Education`/`Skill` : à ce stade
  de fondation, la simplicité du contrat prime sur la granularité, quitte à
  revenir dessus si le chantier "espace membre individuel" identifie un besoin
  réel de patch partiel.
- **Wallet explicitement mocké.** `POST /api/member/v1/wallet/apple-pass` et
  `.../google-pass` retournent un `WalletPass` avec `mocked: true` obligatoire et
  une description explicite : aucun `.pkpass` signé réel n'est généré (pas de
  certificat éditeur Apple/Google disponible en V1), conformément à
  `.prompt/plan/02-*.md` §"Apple Wallet / Google Wallet" et à l'instruction finale
  du plan V1 ("ne pas activer Wallet avant stabilisation de l'identité, des
  membres et des badges").
- **Rollback/audit pris au sérieux côté CMS** : `POST .../content/{id}/archive`
  existe explicitement en plus de `publish`, et il n'existe **aucune** route
  `DELETE` sur un contenu — conforme à la contrainte d'acceptation du doc 04
  ("Aucun document normatif ne peut être écrasé").
- Validé avec `openapi-generator-cli validate -i openapi/oei-api.yaml` (0 erreur,
  5 avertissements "Unused model" attendus et documentés ci-dessus).

## Décision 2 — Modèle de rôles Keycloak

Voir `docs/architecture/keycloak-roles.md` pour le détail complet. Résumé des
décisions :

- **Rôles de niveau membre** (`member-standard`, `member-silver`, `member-gold`,
  `member-founding`, `member-honorary`, `member-institutional-affiliate`) :
  realm roles **composites**, chacun impliquant le rôle de base `member`
  préexistant. Convention de nommage : `member-<tier-kebab-case>`, `tier` reprenant
  exactement l'énum `MembershipTier` du contrat OpenAPI.
- **Rôles institutionnels** (`institution-owner`, `institution-admin`,
  `institution-hr`, `institution-tech-lead`, `institution-comms`,
  `institution-reader`, `institution-contributor`,
  `institution-affiliation-validator`) : realm roles **simples**, non composites,
  chacun représentant une *fonction* transverse à toutes les institutions plutôt
  qu'un droit lié à une institution précise.
- **Isolation multi-tenant : Groupes Keycloak, pas de client roles par
  institution.** Créer un client Keycloak par institution ne passe pas à
  l'échelle. À la place : un groupe `/institutions/{institutionId}` par
  institution, portant un attribut `institutionId` (et `isDemoData` si fictif),
  avec les rôles `institution-*` mappés sur le groupe. Un protocol mapper
  `oidc-group-membership-mapper` sur le client `oei-frontend` expose le chemin de
  groupe dans la claim JWT `groups`. **L'application stricte de l'isolation reste
  la responsabilité du futur backend Spring** (filtrer chaque requête
  `/api/institution/v1/**` par l'`institutionId` résolu depuis le token) —
  Keycloak porte l'information, ne l'applique pas seul.
- Un groupe `/institutions/demo-institution` (marqué `isDemoData: true`) illustre
  ce gabarit dans `keycloak/realm-export/oei-realm.json`, sans utilisateur réel
  assigné — conforme à la règle d'honnêteté des données de démonstration.
- **Appliqué en live** sur `oei-keycloak-1` via `kcadm.sh create roles -r oei ...`
  puis `kcadm.sh add-roles -r oei --rname member-<tier> --rolename member` pour
  chaque tier. Vérifié avec `kcadm.sh get realms/oei/roles` : 16 rôles applicatifs
  (2 préexistants + 6 `member-*` + 8 `institution-*`) confirmés présents, les 6
  `member-*` marqués `"composite": true`.
- `keycloak/realm-export/oei-realm.json` mis à jour en parallèle pour que
  `docker-compose up --import-realm` reproduise ce modèle à froid, sans dépendre
  de l'état du conteneur actuellement démarré.

## Décision 3 — Squelette DDD partagé (`frontend/oei-web/src/app/domain/`)

- **Convention : un sous-dossier par bounded context**, sous `model/` et `port/`
  en miroir (`model/<contexte>/`, `port/<contexte>/`), documentée dans
  `domain/README.md`.
- **10 bounded contexts créés**, alignés sur les 3 chantiers : `identity`,
  `membership`, `profile`, `cv`, `certification`, `badge`, `wallet` (espace membre
  individuel), `institution` (espace membre institutionnel), `cms`, `governance`
  (CMS/gouvernance). Chaque dossier contient uniquement un `README.md` décrivant
  sa responsabilité, ses entités attendues (reprises des "Modèles minimaux" des
  docs 02/03/04) et les endpoints OpenAPI correspondants — **aucun modèle, port ou
  service concret** n'y est écrit : c'est le rôle des chantiers suivants.
- Les bounded contexts préexistants du site public (`document`, `domain-area`,
  `news-item`, `partner`, `stat`) restent à plat à la racine de `model/`/`port/` :
  ils datent d'avant cette fondation et ne sont pas concernés par les 3 chantiers
  visés ici (pas de renommage rétroactif, pour limiter le diff et le risque de
  régression).
- `domain/service/` reste plat (aucune sous-structuration imposée) : peu de
  services de domaine transverses attendus en V1, à réévaluer si un chantier en
  démontre le besoin.

## Conséquences

- Les 3 chantiers suivants doivent :
  1. Implémenter leurs modèles/ports dans le sous-dossier de bounded context déjà
     créé (pas de nouveau dossier à la racine de `model`/`port` sans mise à jour
     de cet ADR et de `domain/README.md`).
  2. Faire correspondre leurs adapters mock/API aux schémas et endpoints déjà
     définis dans `openapi/oei-api.yaml` (ajuster si un cas d'usage manque
     manifestement, mais rester dans la convention de préfixe/versionnement).
  3. Utiliser les rôles Keycloak définis ici (pas de nouveau rôle ad hoc sans
     mise à jour de `docs/architecture/keycloak-roles.md`).
- Si un chantier découvre qu'un endpoint ou un rôle manque, il doit l'ajouter en
  cohérence avec ces conventions plutôt qu'en introduire une nouvelle en
  parallèle.

## Vérifications effectuées

- `npx openapi-generator-cli validate -i openapi/oei-api.yaml` → 0 erreur.
- `NODE_OPTIONS=--no-experimental-webstorage pnpm exec ng test --watch=false` →
  37 fichiers de test, 77 tests, tous verts (inchangé par cette fondation, qui
  n'a ajouté aucun code testable).
- `docker exec oei-keycloak-1 /opt/keycloak/bin/kcadm.sh get realms/oei/roles` →
  16 rôles applicatifs confirmés en live sur le conteneur `oei-keycloak-1`.
