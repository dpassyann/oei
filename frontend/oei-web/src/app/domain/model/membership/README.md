# Bounded context: `membership`

Adhésion, niveau (`MembershipTier` : Standard, Silver, Gold, Founding, Honorary,
Institutional Affiliate) et statut (`MembershipStatus`).

Entités attendues : `Membership`, `MembershipTier`, `EmploymentAffiliation` (pour
la règle "Gold via employeur partenaire" — un email de domaine seul ne suffit pas,
voir doc 02 §"Gold via employeur partenaire").

Le rôle Keycloak `member-*` associé est documenté dans
`../../../../../../../.docs/architecture/keycloak-roles.md`.
