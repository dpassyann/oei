// Les 8 types de publication institutionnelle (doc 03 §"Publications institutionnelles").
export type InstitutionPublicationType =
  | 'OPINION'
  | 'EXPERIENCE_REPORT'
  | 'CIO_DECISION'
  | 'STUDY'
  | 'REPORT'
  | 'EVENT'
  | 'TRAINING'
  | 'OPPORTUNITY';

// Le workflow complet en 9 étapes (doc 03 §"Publications institutionnelles" — même contrat
// que `PublicationWorkflowStatus` dans openapi/oei-api.yaml).
export type PublicationWorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CHECKS'
  | 'REVIEW'
  | 'CHANGES_REQUESTED'
  | 'VALIDATED'
  | 'TRANSLATED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export const PUBLICATION_WORKFLOW_STEPS: readonly PublicationWorkflowStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'CHECKS',
  'REVIEW',
  'CHANGES_REQUESTED',
  'VALIDATED',
  'TRANSLATED',
  'PUBLISHED',
  'ARCHIVED',
];

export interface InstitutionPublication {
  readonly id: string;
  readonly institutionId: string;
  readonly type: InstitutionPublicationType;
  readonly title: string;
  readonly body: string;
  readonly status: PublicationWorkflowStatus;
  readonly authorMemberId: string;
  readonly submittedAt: string | null;
  readonly publishedAt: string | null;
}

export interface InstitutionPublicationCreation {
  readonly type: InstitutionPublicationType;
  readonly title: string;
  readonly body: string;
}

export function createInstitutionPublication(fields: InstitutionPublication): InstitutionPublication {
  return Object.freeze({ ...fields });
}
