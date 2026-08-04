import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { InstitutionInvitation } from '../../model/institution/institution-invitation';
import { InstitutionRole } from '../../model/institution/institution-role';

export interface InstitutionInvitationCreation {
  readonly email: string;
  readonly role: InstitutionRole;
}

// `GET/POST /api/institution/v1/invitations`, `POST /api/institution/v1/invitations/{id}/revoke`.
export interface InstitutionInvitationsPort {
  listInvitations(): Observable<InstitutionInvitation[]>;
  createInvitation(creation: InstitutionInvitationCreation): Observable<InstitutionInvitation>;
  revokeInvitation(id: string): Observable<InstitutionInvitation>;
}

export const INSTITUTION_INVITATIONS_PORT = new InjectionToken<InstitutionInvitationsPort>('InstitutionInvitationsPort');
