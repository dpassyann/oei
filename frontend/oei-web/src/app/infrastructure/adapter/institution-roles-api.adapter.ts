import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InstitutionRolesPort } from '../../domain/port/institution/institution-roles.port';
import { InstitutionMembership } from '../../domain/model/institution/institution-membership';
import { InstitutionRole } from '../../domain/model/institution/institution-role';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

@Service()
export class InstitutionRolesApiAdapter implements InstitutionRolesPort {
  private readonly http = inject(HttpClient);

  listRoleAssignments(): Observable<InstitutionMembership[]> {
    return this.http.get<InstitutionMembership[]>(`${INSTITUTION_API_BASE}/roles`);
  }

  updateRoleAssignment(memberId: string, role: InstitutionRole): Observable<InstitutionMembership> {
    return this.http.put<InstitutionMembership>(`${INSTITUTION_API_BASE}/roles/${memberId}`, { role });
  }

  removeRoleAssignment(memberId: string): Observable<void> {
    return this.http.delete(`${INSTITUTION_API_BASE}/roles/${memberId}`).pipe(map(() => undefined));
  }
}
