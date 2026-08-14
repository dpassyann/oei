import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InstitutionAffiliationsPort } from '../../domain/port/institution/institution-affiliations.port';
import { MemberInstitutionAffiliation } from '../../domain/model/institution/member-institution-affiliation';

// Endpoints under `/api/institution/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const INSTITUTION_API_BASE = '/api/institution/v1';

// The real `MemberInstitutionAffiliation` OpenAPI schema does not (yet) carry
// `memberDisplayName`/`emailDomainVerified` — those are frontend-only fields consumed by the
// members list UI (see `presentation/pages/espace-institution/membres`). Until the backend
// enriches this response (or a member lookup is composed in here), fall back to `memberId` for
// display and `false` for the verification flag rather than surfacing `undefined` to templates.
function toDomainAffiliation(dto: MemberInstitutionAffiliation): MemberInstitutionAffiliation {
  return {
    ...dto,
    memberDisplayName: dto.memberDisplayName ?? dto.memberId,
    emailDomainVerified: dto.emailDomainVerified ?? false,
  };
}

@Service()
export class InstitutionAffiliationsApiAdapter implements InstitutionAffiliationsPort {
  private readonly http = inject(HttpClient);

  listMembers(): Observable<MemberInstitutionAffiliation[]> {
    return this.http
      .get<MemberInstitutionAffiliation[]>(`${INSTITUTION_API_BASE}/members`)
      .pipe(map((affiliations) => affiliations.map(toDomainAffiliation)));
  }

  listAffiliationRequests(): Observable<MemberInstitutionAffiliation[]> {
    return this.http
      .get<MemberInstitutionAffiliation[]>(`${INSTITUTION_API_BASE}/affiliations`)
      .pipe(map((affiliations) => affiliations.map(toDomainAffiliation)));
  }

  approveAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.http
      .post<MemberInstitutionAffiliation>(`${INSTITUTION_API_BASE}/affiliations/${id}/approve`, {})
      .pipe(map(toDomainAffiliation));
  }

  rejectAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.http
      .post<MemberInstitutionAffiliation>(`${INSTITUTION_API_BASE}/affiliations/${id}/reject`, {})
      .pipe(map(toDomainAffiliation));
  }

  endAffiliation(id: string): Observable<void> {
    return this.http.delete(`${INSTITUTION_API_BASE}/affiliations/${id}`).pipe(map(() => undefined));
  }
}
