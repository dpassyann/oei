import { InstitutionDomain } from './institution-domain';

export interface Institution {
  readonly id: string;
  readonly legalName: string;
  readonly publicName: string;
  readonly logoUrl: string;
  readonly country: string;
  readonly sectors: readonly string[];
  readonly description: string;
  readonly emailDomains: readonly InstitutionDomain[];
  readonly publicSlug: string;
  /**
   * Doit être explicitement vrai pour toute institution fictive utilisée en démonstration —
   * jamais présentée comme partenaire officiel sans validation (voir doc 03 et
   * `docs/architecture/keycloak-roles.md`, groupe `/institutions/demo-institution`).
   */
  readonly isDemoData: boolean;
}

export function createInstitution(fields: Institution): Institution {
  return Object.freeze({ ...fields, sectors: Object.freeze([...fields.sectors]), emailDomains: Object.freeze([...fields.emailDomains]) });
}
