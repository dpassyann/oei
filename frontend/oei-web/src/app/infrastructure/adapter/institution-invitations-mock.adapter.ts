import { Service } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { InstitutionInvitationCreation, InstitutionInvitationsPort } from '../../domain/port/institution/institution-invitations.port';
import { createInstitutionInvitation, InstitutionInvitation } from '../../domain/model/institution/institution-invitation';
import { DEMO_INSTITUTION_ID, DEMO_INVITATIONS } from './institution-demo-data';

let nextInvitationSequence = 1;

@Service()
export class InstitutionInvitationsMockAdapter implements InstitutionInvitationsPort {
  private invitations: InstitutionInvitation[] = [...DEMO_INVITATIONS];

  listInvitations(): Observable<InstitutionInvitation[]> {
    return of(this.invitations);
  }

  createInvitation(creation: InstitutionInvitationCreation): Observable<InstitutionInvitation> {
    const now = new Date();
    const expires = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const invitation = createInstitutionInvitation({
      id: `invitation-demo-new-${nextInvitationSequence++}`,
      institutionId: DEMO_INSTITUTION_ID,
      email: creation.email,
      role: creation.role,
      status: 'PENDING',
      invitedBy: 'member-admin-demo',
      invitedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    });
    this.invitations = [...this.invitations, invitation];
    return of(invitation);
  }

  revokeInvitation(id: string): Observable<InstitutionInvitation> {
    const existing = this.invitations.find((invitation) => invitation.id === id);
    if (!existing) {
      return throwError(() => new Error(`Institution invitation not found: ${id}`));
    }
    const revoked = createInstitutionInvitation({ ...existing, status: 'REVOKED' });
    this.invitations = this.invitations.map((invitation) => (invitation.id === id ? revoked : invitation));
    return of(revoked);
  }
}
