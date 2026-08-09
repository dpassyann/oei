# Feature — Partenaires et comptes institutionnels

## Vision
Les comptes institutionnels sont créés ou validés par l'OEI après échange avec l'organisation.

## Création admin
Champs : raison sociale, nom public, type, pays, site, domaines email, logo, description, contact principal, email admin institutionnel, niveau partenariat, dates, notes internes.

## Workflow
`DRAFT`, `CONTACTED`, `DOCUMENTS_PENDING`, `APPROVED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, `ARCHIVED`.

## Provisioning Keycloak
À activation :
1. créer institution dans PostgreSQL ;
2. créer utilisateur via **Keycloak Admin API** ;
3. envoyer email d'activation ;
4. attribuer rôle institutionnel ;
5. associer `institutionId` ;
6. forcer activation/changement de mot de passe ;
7. journaliser.

Ne jamais écrire directement dans les tables Keycloak.

## Rôles
`INSTITUTION_OWNER`, `INSTITUTION_ADMIN`, `INSTITUTION_EDITOR`, `INSTITUTION_HR`, `INSTITUTION_VIEWER`.

## Page institutionnelle CMS
Logo, cover, présentation, domaines, actualités, certifications, événements, publications, membres publics affiliés, liens officiels.

Prévisualisation avant publication.

## Suspension/révocation
Pas de hard delete. Une suspension bloque les accès institutionnels et les nouvelles publications, conserve l'historique et masque ou marque la page inactive.

La suspension de l'institution ne sanctionne pas automatiquement les membres individuels. L'affiliation peut devenir `HISTORICAL`, `UNVERIFIED` ou `DISPUTED`.

Raison obligatoire de révocation et audit complet.

## API
```http
POST /api/admin/v1/institutions
PUT /api/admin/v1/institutions/{id}
POST /api/admin/v1/institutions/{id}/approve
POST /api/admin/v1/institutions/{id}/activate
POST /api/admin/v1/institutions/{id}/suspend
POST /api/admin/v1/institutions/{id}/revoke
POST /api/admin/v1/institutions/{id}/users
POST /api/institution/v1/admins/invitations
```
