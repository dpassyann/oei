# Feature — Console d'administration OEI

## Objectif
Créer `/admin`, console sécurisée pour le fondateur et les administrateurs.

## RBAC
`SUPER_ADMIN`, `FOUNDATION_ADMIN`, `CONTENT_ADMIN`, `INSTITUTION_ADMIN_OEI`, `EVENT_ADMIN`, `MEMBERSHIP_SUPPORT`, `REVIEWER`, `AUDITOR_READONLY`.

MFA obligatoire. Principe du moindre privilège.

## Dashboard
KPI : membres actifs, cotisations expirées, institutions, publications à valider, événements, signalements, emails, erreurs et activités sensibles.

## Articles
Workflow :
`DRAFT -> SUBMITTED -> IN_REVIEW -> CHANGES_REQUESTED -> APPROVED -> SCHEDULED -> PUBLISHED -> ARCHIVED`
avec rejet possible.

Admin : preview, métadonnées, demande de correction, approbation, programmation, choix de zone de publication, mise en avant, dépublication.

Une publication validée doit alimenter automatiquement la zone du site configurée.

## CMS
Administrer :
- pages ;
- articles ;
- actualités ;
- événements ;
- partenaires ;
- institutions ;
- ressources ;
- documents ;
- blocs home ;
- menus ;
- traductions ;
- templates email.

## Membres
Les droits liés à la cotisation sont automatiques. L'admin peut consulter le statut, resynchroniser un paiement, suspendre pour abus, lever une suspension et gérer les statuts exceptionnels.

## Soft delete
Pas de hard delete UI sur les entités métier sensibles : `archive`, `suspend`, `revoke`, `anonymize`.

## Audit
Chaque action sensible journalise : adminId, timestamp, IP, action, entité, before, after, reason, correlationId.

## Sécurité
MFA, session courte, re-auth actions critiques, CSRF, CSP, rate limiting, permissions backend obligatoires. Aucun contrôle d'accès ne repose seulement sur l'UI.
