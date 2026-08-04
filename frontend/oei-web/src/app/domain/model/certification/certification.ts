export type CertificationStatus = 'DECLARED' | 'UNDER_REVIEW' | 'VALIDATED' | 'REJECTED' | 'EXPIRED' | 'REVOKED';

export interface CertificationDeclaration {
  readonly name: string;
  readonly issuingOrganization: string;
  readonly recognizedCertificationId?: string | null;
  readonly issuedAt?: string;
  readonly expiresAt?: string | null;
  readonly proofDocumentUrl?: string;
}

export interface Certification extends CertificationDeclaration {
  readonly id: string;
  readonly memberId: string;
  readonly status: CertificationStatus;
  readonly validatedBy?: string | null;
  readonly validatedAt?: string | null;
}

export function createCertification(fields: Certification): Certification {
  return Object.freeze({ ...fields });
}
