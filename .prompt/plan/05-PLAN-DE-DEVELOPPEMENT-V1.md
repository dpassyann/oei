# Plan de développement V1 — Plateforme OEI

## Périmètre

- home publique ;
- partenaires dynamiques ;
- publications et ressources ;
- authentification ;
- membre individuel ;
- institution ;
- CMS ;
- Markdown/Git ;
- administration ;
- FR/EN ;
- sécurité ;
- audit.

## Bounded contexts

1. Identity & Access
2. Membership
3. Professional Profile
4. CV & Publishing
5. Certification & Badge
6. Institution & Partnership
7. CMS & Documentation
8. Governance
9. Public Website
10. Media
11. Notification

## Milestones

### M0 — Fondation

Architecture, repository, CI, sécurité, design system, OpenAPI, PostgreSQL, Flyway, i18n, observabilité et environnements.

### M1 — Home

Header, hero, piliers, domaines, KPI, actualités, ressources, partenaires, newsletter, footer, mocks et API.

### M2 — Admin partenaires

Auth admin, CRUD, upload, publication, listing, audit et médias.

### M3 — CMS

Contenus, Markdown, preview, workflow, publication, FR/EN, recherche et synchronisation Git.

### M4 — Membre

Inscription, onboarding, profil, visibilité, CV, PDF, profil public, badges de base et QR.

### M5 — Certifications

Catalogue, déclaration, preuve, validation, badge, expiration et audit.

### M6 — Institution

Création, rôles, affiliations, page publique, publications, modération, Gold validé et opportunités.

### M7 — Carte numérique

vCard, Web Share, QR, plein écran, PWA et architecture Wallet.

### M8 — Gouvernance

Contributions, diff, consultations, décisions, versions, historique et notifications.

## Priorités

### P0

Sécurité, identité, home, CMS, partenaires, profil, CV PDF, modération, audit.

### P1

Institution, badges de certification, carte numérique, traduction assistée, contribution.

### P2

Apple Wallet, Google Wallet, NFC avancé, matching emploi et analytics.

## Notes futures (V2/V3 — ne pas implémenter maintenant)

- **V2 — CV imprimé et envoyé par la poste** : proposer, en plus du CV Builder PDF/templates
  filigranés (OEI) + badge façon diplôme, une option payante d'impression du CV sur papier
  cartonné premium et d'envoi postal au membre.
- **V3 — Reconnaissance de parcours** : fonctionnalités autour des anniversaires de travail
  (ancienneté professionnelle) et des départs à la retraite (badge/distinction de fin de
  carrière, message de reconnaissance de l'OEI).

## Tests

- domaine ;
- contrats ;
- intégration ;
- sécurité ;
- e2e ;
- régression visuelle ;
- accessibilité ;
- performance ;
- multi-tenant ;
- PDF ;
- Git ;
- permissions.

## Données de démonstration

- 6 domaines ;
- 3 publications ;
- 4 ressources ;
- 3 partenaires explicitement « Démonstration » ;
- 2 membres ;
- 1 institution ;
- 6 badges ;
- 2 certifications fictives ;
- 1 document Markdown.

## Definition of Done

Règles métier, API, responsive, i18n, accessibilité, tests, audit, permissions, démo, documentation et revue sécurité.

## Instruction finale à Claude

1. analyser le repository ;
2. identifier les écarts ;
3. produire ADR et plan ;
4. définir OpenAPI et données ;
5. découper en tickets ;
6. commencer par M0 puis M1 ;
7. ne pas activer Wallet avant stabilisation de l’identité, des membres et des badges ;
8. conserver l’architecture extensible.
