import { InstitutionRole } from './institution-role';

export type InstitutionInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface InstitutionInvitation {
  readonly id: string;
  readonly institutionId: string;
  readonly email: string;
  readonly role: InstitutionRole;
  readonly status: InstitutionInvitationStatus;
  readonly invitedBy: string;
  readonly invitedAt: string;
  readonly expiresAt: string;
}

export function createInstitutionInvitation(fields: InstitutionInvitation): InstitutionInvitation {
  return Object.freeze({ ...fields });
}
