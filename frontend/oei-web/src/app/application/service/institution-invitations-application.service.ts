import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  INSTITUTION_INVITATIONS_PORT,
  InstitutionInvitationCreation,
} from '../../domain/port/institution/institution-invitations.port';
import { InstitutionInvitation } from '../../domain/model/institution/institution-invitation';

@Service()
export class InstitutionInvitationsApplicationService {
  private readonly port = inject(INSTITUTION_INVITATIONS_PORT);

  listInvitations(): Observable<InstitutionInvitation[]> {
    return this.port.listInvitations();
  }

  createInvitation(creation: InstitutionInvitationCreation): Observable<InstitutionInvitation> {
    return this.port.createInvitation(creation);
  }

  revokeInvitation(id: string): Observable<InstitutionInvitation> {
    return this.port.revokeInvitation(id);
  }
}
