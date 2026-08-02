# Prompt de développement — Espace membre (individuel, institutionnel) et CMS documentaire

*Document destiné à être transmis à un agent de développement (Claude Code ou équivalent) pour planifier et implémenter l'espace membre complet du site OEI. Rédigé à partir d'une session de brainstorming du porteur du projet — organisé et structuré ici, à affiner avant implémentation.*

## 0. Cadrage général

L'OEI est une organisation à but non lucratif. L'espace membre doit justifier la cotisation payée par les membres en offrant un espace **réellement professionnel, attractif et utile** — pas un simple compte utilisateur. Deux grandes familles d'espaces membres :

1. **Espace membre individuel** (personne physique).
2. **Espace membre institutionnel** (entreprise, école, partenaire).

Authentification : Keycloak (déjà en place, realm `oei`, voir `docs/superpowers/plans/2026-07-31-infra-locale-keycloak-postgres-minio.md`). Pas d'application mobile prévue — le site doit être **full responsive** et couvrir tous les usages sur mobile.

---

## 1. Espace membre individuel

### 1.1 Compte et profil

- Création de compte / connexion via Keycloak (le bouton "Espace membre" redirige déjà vers Keycloak — reste à construire le flux complet post-connexion : échange de token, session, page de profil).
- Profil de base : identité, coordonnées, statut de membre (fondateur / agréé / associé / honneur, cf. glossaire).

### 1.2 Générateur de CV numérique

- **Constructeur de CV par sections manuelles** : expériences, formations, compétences, langues, certifications — chaque section éditable indépendamment.
- **Multilingue** : chaque section de CV peut être rédigée/traduite dans plusieurs langues ; proposer un outil d'aide à la traduction (pas nécessairement automatique dès la V1, mais l'architecture doit permettre d'ajouter une traduction assistée plus tard).
- **Génération PDF** : le CV est d'abord construit en HTML (permet un rendu web soigné), puis généré en PDF à la demande (service backend de conversion HTML→PDF). Objectif produit : quelques templates de CV **très soignés visuellement**, pas une multitude de templates médiocres — mieux vaut 2-3 templates réellement bluffants qu'une bibliothèque large mais quelconque.
- **URL statique publique** : chaque membre peut obtenir une adresse publique stable pour son CV HTML (ex. `oei.org/cv/<identifiant>`), qu'il peut partager directement (candidature, réseau professionnel) sans dépendre du PDF.

### 1.3 Badges et gamification

- **Badge de membre** de base, attribué à l'inscription.
- **Badges de certification** : quand un membre déclare une certification et que l'OEI la reconnaît (processus de validation, probablement manuel/modéré au départ), un badge est généré.
- Les badges sont : affichables dans le profil, imprimables, intégrables dans le CV numérique.
- Objectif : introduire une dynamique de gamification qui valorise la progression et l'engagement du membre (cohérent avec les niveaux d'expertise du glossaire : Praticien → Ingénieur → Architecte → Expert → Expert senior → Fellow).

### 1.4 Carte de membre numérique (wallet)

- Génération d'une **carte de membre digitale** au format wallet (type Apple Wallet / Google Wallet), avec partage possible par **NFC** ou QR code.
- La carte renvoie vers le CV public et sert de preuve d'identité de membre facilement vérifiable et partageable.
- Effet recherché : un objet numérique soigné qui valorise concrètement l'adhésion (justifie la cotisation) — c'est un axe produit à fort impact visuel, à traiter avec un soin particulier au design.

### 1.5 Niveaux de membre et visibilité

- Paliers : Membre standard → **Silver** → **Gold**, avec un habillage visuel (thème) différent selon le palier.
- Règle métier proposée : un membre dont l'employeur est une **entreprise partenaire** de l'OEI obtient automatiquement le statut Gold.
- Les membres ayant signé le code de déontologie bénéficient d'une **visibilité accrue** (ex. mise en avant dans un futur annuaire de membres/experts) — un axe explicite d'aide à l'emploi et de valorisation du métier.

---

## 2. Espace membre institutionnel

*Section volontairement ouverte — l'objectif est d'aider à construire une proposition de valeur claire pour les entreprises/écoles partenaires (le porteur de projet n'a pas d'idée arrêtée ici, cette section liste des pistes à valider/prioriser avant développement, pas un cahier des charges figé).*

Pistes à explorer :
- Vue d'ensemble des employés de l'organisation qui sont membres de l'OEI.
- Possibilité de « gratifier »/mettre en avant certains membres (reconnaissance interne visible).
- Espace de publication institutionnelle : annonces, prises de position (ex. décision DSI), publications — **soumises à modération** avant publication (cf. CMS, section 3).
- Mise en avant du partenariat sur la home page (logos, page Partenaires — cf. `01-home-page-dynamique.md`).
- Ce périmètre reste à discuter/prioriser avec le porteur avant tout développement — ne pas construire au-delà d'un MVP simple sans validation explicite.

---

## 3. CMS documentaire (dès la V1 — ne pas différer)

Contrairement à une hypothèse de départ (repousser le CMS à une V2), le porteur du projet demande explicitement d'intégrer un **CMS dès la V1** pour la gestion des documents institutionnels (livre blanc, glossaire, règlement, code de déontologie).

### 3.1 Principe

- Le contenu documentaire reste **versionné en Markdown dans git** (cohérent avec le choix déjà fait dans le design technique, `docs/superpowers/specs/2026-07-31-site-plateforme-oei-design.md`, section 4 — pas de CMS en base de données classique, la traçabilité git est jugée précieuse pour des documents à portée quasi-juridique).
- Le CMS n'est donc pas un éditeur de contenu en base de données, mais une **interface d'administration qui pilote un workflow git** : proposition de modification → débat/validation par le conseil (« conseil constitutionnel » de l'association) → intégration → traduction dans toutes les langues → publication effective sur le site.

### 3.2 Rôles et permissions

- **Membres non-admin** : peuvent proposer des modifications aux fichiers Markdown (ex. une évolution du règlement ou du glossaire), mais ne peuvent pas les publier directement — le changement passe par une procédure de débat/validation.
- **Membres admin / conseil** : peuvent valider une proposition, déclencher son intégration et sa traduction, puis la publier.
- Prévoir un **espace d'administration** dédié pour : lister les propositions en attente, les valider/rejeter, déclencher la publication.

### 3.3 Pipeline technique à construire

1. Une procédure documentée expliquant comment une modification de document est proposée, débattue, validée puis publiée (à rédiger comme un document de gouvernance, pas seulement du code).
2. Un mécanisme backend qui lit les fichiers Markdown publiés (depuis `content/<lang>/...`, structure déjà en place) et les synchronise/expose via l'API consommée par le frontend — cohérent avec le pipeline de contenu déjà prévu dans le design technique.
3. Un espace admin (frontend) pour déclencher/visualiser ce pipeline (pas nécessairement une interface d'édition de texte riche en V1 — l'édition réelle reste en Markdown/git, l'admin pilote surtout la validation et la publication).

### 3.4 Périmètre V1 réaliste

Le porteur insiste pour intégrer le CMS dès la V1, mais le **niveau de sophistication** de la V1 reste à calibrer avec lui avant développement : a minima, un espace admin qui permet de voir/valider/publier une proposition de changement documentaire, branché sur le pipeline de contenu Markdown existant — sans nécessairement un éditeur WYSIWYG complet dès cette première version.

---

## 4. Points d'attention transverses

- **Aucune fonctionnalité ne doit fabriquer de fausses données** (mêmes règles que pour la home page : pas de faux membres, pas de fausses statistiques).
- **Responsive obligatoire**, pas d'application mobile prévue.
- Respecter l'architecture DDD et le pattern mock/API déjà en place pour toute nouvelle fonctionnalité backend-dépendante.
- Ce document couvre un périmètre très large (CV, PDF, wallet/NFC, badges, CMS, espace institutionnel) — **le développement doit être phasé et priorisé avec le porteur du projet avant de se lancer dans l'implémentation complète**, plutôt que traité comme un unique gros chantier monolithique.
