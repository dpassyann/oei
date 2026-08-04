// Les 8 rôles fonctionnels institutionnels existant déjà côté realm Keycloak (voir
// docs/architecture/keycloak-roles.md, §"Rôles institutionnels") — ce sont des rôles
// *transverses*, l'isolation multi-tenant est portée par le groupe Keycloak
// `/institutions/{institutionId}`, pas par le rôle.
export type InstitutionRole =
  | 'OWNER'
  | 'ADMIN'
  | 'HR'
  | 'TECH_LEAD'
  | 'COMMS'
  | 'READER'
  | 'CONTRIBUTOR'
  | 'AFFILIATION_VALIDATOR';

export const INSTITUTION_ROLES: readonly InstitutionRole[] = [
  'OWNER',
  'ADMIN',
  'HR',
  'TECH_LEAD',
  'COMMS',
  'READER',
  'CONTRIBUTOR',
  'AFFILIATION_VALIDATOR',
];
