// Per the functional spec ("Gold via employeur partenaire"), a Gold tier granted through
// a partner employer must be PROVEN — an email address alone is never sufficient. The two
// allowed verification methods below are the only ways `EmploymentAffiliation.status` can
// reach `VERIFIED`; there is deliberately no free-text/self-declared proof field.
export type AffiliationVerificationMethod = 'EMAIL_DOMAIN' | 'INSTITUTION_VALIDATION';

export type AffiliationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ENDED';

export interface EmploymentAffiliation {
  readonly id: string;
  readonly memberId: string;
  readonly institutionId: string;
  readonly verificationMethod: AffiliationVerificationMethod;
  readonly status: AffiliationStatus;
  readonly startedAt: string;
  readonly endedAt?: string | null;
}

export function createEmploymentAffiliation(fields: EmploymentAffiliation): EmploymentAffiliation {
  return Object.freeze({ ...fields });
}
