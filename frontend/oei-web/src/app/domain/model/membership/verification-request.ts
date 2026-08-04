export type VerificationRequestType = 'IDENTITY' | 'PROFILE' | 'CERTIFICATION';

export type VerificationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationRequestCreation {
  readonly type: VerificationRequestType;
  readonly referenceId?: string;
}

export interface VerificationRequest extends VerificationRequestCreation {
  readonly id: string;
  readonly memberId: string;
  readonly status: VerificationRequestStatus;
  readonly submittedAt: string;
  readonly reviewedAt?: string | null;
  readonly reviewerId?: string | null;
}

export function createVerificationRequest(fields: VerificationRequest): VerificationRequest {
  return Object.freeze({ ...fields });
}
