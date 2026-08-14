import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstitutionInvitationCreation, InstitutionInvitationsPort } from '../../domain/port/institution/institution-invitations.port';
import { InstitutionInvitation } from '../../domain/model/institution/institution-invitation';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionInvitationsApiAdapter implements InstitutionInvitationsPort {
  private readonly http = inject(HttpClient);

  listInvitations(): Observable<InstitutionInvitation[]> {
    return this.http.get<InstitutionInvitation[]>(`${INSTITUTION_API_BASE}/invitations`);
  }

  createInvitation(creation: InstitutionInvitationCreation): Observable<InstitutionInvitation> {
    return this.http.post<InstitutionInvitation>(`${INSTITUTION_API_BASE}/invitations`, creation);
  }

  revokeInvitation(id: string): Observable<InstitutionInvitation> {
    return this.http.post<InstitutionInvitation>(`${INSTITUTION_API_BASE}/invitations/${id}/revoke`, {});
  }
}
