// Les 6 types d'opportunité (doc 03 §"Opportunités").
export type InstitutionOpportunityType = 'JOB' | 'INTERNSHIP' | 'MENTORING' | 'PRO_BONO' | 'WORKING_GROUP' | 'CALL_FOR_EXPERTS';

export type InstitutionOpportunityStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'REPORTED';

export interface InstitutionOpportunity {
  readonly id: string;
  readonly institutionId: string;
  readonly type: InstitutionOpportunityType;
  readonly title: string;
  readonly description: string;
  readonly status: InstitutionOpportunityStatus;
  readonly expiresAt: string | null;
  readonly publishedAt: string | null;
}

export interface InstitutionOpportunityCreation {
  readonly type: InstitutionOpportunityType;
  readonly title: string;
  readonly description: string;
  readonly expiresAt: string | null;
}

export function createInstitutionOpportunity(fields: InstitutionOpportunity): InstitutionOpportunity {
  return Object.freeze({ ...fields });
}
