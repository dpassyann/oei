import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InstitutionRolesPort } from '../../domain/port/institution/institution-roles.port';
import { InstitutionMembership } from '../../domain/model/institution/institution-membership';
import { InstitutionRole } from '../../domain/model/institution/institution-role';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionRolesApiAdapter implements InstitutionRolesPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listRoleAssignments(): Observable<InstitutionMembership[]> {
    return this.http.get<InstitutionMembership[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/roles`);
  }

  updateRoleAssignment(memberId: string, role: InstitutionRole): Observable<InstitutionMembership> {
    return this.http.put<InstitutionMembership>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/roles/${memberId}`, { role });
  }

  removeRoleAssignment(memberId: string): Observable<void> {
    return this.http
      .delete(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/roles/${memberId}`)
      .pipe(map(() => undefined));
  }
}
