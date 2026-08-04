import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionInvitationCreation, InstitutionInvitationsPort } from '../../domain/port/institution/institution-invitations.port';
import { InstitutionInvitation } from '../../domain/model/institution/institution-invitation';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionInvitationsApiAdapter implements InstitutionInvitationsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listInvitations(): Observable<InstitutionInvitation[]> {
    return this.http.get<InstitutionInvitation[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/invitations`);
  }

  createInvitation(creation: InstitutionInvitationCreation): Observable<InstitutionInvitation> {
    return this.http.post<InstitutionInvitation>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/invitations`, creation);
  }

  revokeInvitation(id: string): Observable<InstitutionInvitation> {
    return this.http.post<InstitutionInvitation>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/invitations/${id}/revoke`, {});
  }
}
