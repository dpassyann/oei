import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InstitutionAffiliationsPort } from '../../domain/port/institution/institution-affiliations.port';
import { MemberInstitutionAffiliation } from '../../domain/model/institution/member-institution-affiliation';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class InstitutionAffiliationsApiAdapter implements InstitutionAffiliationsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listMembers(): Observable<MemberInstitutionAffiliation[]> {
    return this.http.get<MemberInstitutionAffiliation[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/members`);
  }

  listAffiliationRequests(): Observable<MemberInstitutionAffiliation[]> {
    return this.http.get<MemberInstitutionAffiliation[]>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/affiliations`);
  }

  approveAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.http.post<MemberInstitutionAffiliation>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/affiliations/${id}/approve`, {});
  }

  rejectAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.http.post<MemberInstitutionAffiliation>(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/affiliations/${id}/reject`, {});
  }

  endAffiliation(id: string): Observable<void> {
    return this.http
      .delete(`${this.runtimeConfig.apiBaseUrl()}/institution/v1/affiliations/${id}`)
      .pipe(map(() => undefined));
  }
}
