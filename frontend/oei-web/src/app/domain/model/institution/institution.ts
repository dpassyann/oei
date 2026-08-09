import { InstitutionDomain } from './institution-domain';

// Admin-side onboarding/lifecycle status (see `.prompt/plan/final/02-PARTNERS-AND-INSTITUTION-ADMIN.md`
// §Workflow and `domain/model/institution/institution-workflow.ts` for the pure transition
// functions). Optional and additive: existing institutions (e.g. `DEMO_INSTITUTION`) predate this
// field and are treated as `ACTIVE` by the admin UI when `status` is absent (see
// `AdminInstitutionsApplicationService`).
export const INSTITUTION_WORKFLOW_STATUS_VALUES = [
  'DRAFT',
  'CONTACTED',
  'DOCUMENTS_PENDING',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'REVOKED',
  'ARCHIVED',
] as const;
export type InstitutionWorkflowStatus = (typeof INSTITUTION_WORKFLOW_STATUS_VALUES)[number];

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
  /** Admin lifecycle status — optional/additive, see `InstitutionWorkflowStatus` above. */
  readonly status?: InstitutionWorkflowStatus;
}

export function createInstitution(fields: Institution): Institution {
  return Object.freeze({ ...fields, sectors: Object.freeze([...fields.sectors]), emailDomains: Object.freeze([...fields.emailDomains]) });
}
