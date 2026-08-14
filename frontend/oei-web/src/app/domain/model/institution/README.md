# Bounded context: `institution`

Espace membre institutionnel complet : compte institution, rôles internes,
invitations, affiliations de membres, partenariat, dashboard KPI, publications
institutionnelles avec workflow de modération, opportunités, propositions de
reconnaissance, audit.

Entités attendues (voir modèle minimal du doc 03) : `Institution`,
`InstitutionRole`, `InstitutionMembership`, `Partnership`, `InstitutionDomain`,
`MemberInstitutionAffiliation`, `InstitutionInvitation`, `InstitutionPublication`,
`InstitutionOpportunity`, `InstitutionBadgeProposal`, `InstitutionAuditLog`.

L'isolation multi-tenant (une institution ne voit que ses membres) est un
principe de domaine central de ce contexte — voir
`../../../../../../../../../.docs/architecture/keycloak-roles.md` §"Multi-tenant : rôles vs. groupes" pour la
façon dont Keycloak porte cette intention côté identité.
