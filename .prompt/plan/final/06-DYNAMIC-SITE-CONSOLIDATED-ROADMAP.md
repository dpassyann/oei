# OEI — Roadmap consolidée de la partie dynamique

## Scope Freeze
La partie statique est considérée comme stabilisée. Les features dynamiques retenues sont :

1. authentification ;
2. espace membre ;
3. adhésion/entitlements ;
4. CV ;
5. badges/certifications ;
6. carte digitale/Wallet/carte physique ;
7. partenaires ;
8. institutions ;
9. CMS ;
10. articles ;
11. administration ;
12. événements ;
13. feed événementiel ;
14. emails ;
15. Professional Neural Network ;
16. DevOps AWS.

**Aucune nouvelle grosse feature avant go-live**, sauf besoin légal, sécurité ou blocage de production.

## Lot A — Go-live
AWS deployable, PostgreSQL, Keycloak, frontend, backend, object storage, DNS/TLS, WAF, backups, monitoring minimal.

## Lot B — Membre
Compte, profil, membership, entitlements, PSP webhook, CV edit/export, badges, profil public.

## Lot C — CMS/Admin
Articles, modération, publications, console admin, templates email, gestion institutions.

## Lot D — Institutions
Provisioning, Keycloak Admin API, page, admins, partenaires, suspension/révocation.

## Lot E — Événements
Agenda, registration, emails, feed, photos, consentement, archive.

## Lot F — Différenciation
Business card, Wallet, cartes physiques, certifications avancées, Professional Neural Network.

## Critère de go-live
Le go-live ne doit pas attendre le Neural Network.

Minimum : site public, auth, profil membre, admin, articles, institution basic, événements basic, AWS sécurisé et backup.

## Definition of Done
Chaque feature : authorization backend, migration PostgreSQL, OpenAPI, Angular responsive, i18n, audit, sécurité, tests, documentation, métriques et impact backup analysé.
