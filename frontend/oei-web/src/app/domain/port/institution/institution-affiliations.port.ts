import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MemberInstitutionAffiliation } from '../../model/institution/member-institution-affiliation';

// Membres affiliés et demandes d'affiliation — isolation stricte : une institution ne voit
// que SES propres membres/demandes (voir docs/architecture/keycloak-roles.md). Correspond à
// `GET /api/institution/v1/members`, `GET /api/institution/v1/affiliations`,
// `POST /api/institution/v1/affiliations/{id}/approve|reject`,
// `DELETE /api/institution/v1/affiliations/{id}`.
export interface InstitutionAffiliationsPort {
  listMembers(): Observable<MemberInstitutionAffiliation[]>;
  listAffiliationRequests(): Observable<MemberInstitutionAffiliation[]>;
  approveAffiliation(id: string): Observable<MemberInstitutionAffiliation>;
  rejectAffiliation(id: string): Observable<MemberInstitutionAffiliation>;
  endAffiliation(id: string): Observable<void>;
}

export const INSTITUTION_AFFILIATIONS_PORT = new InjectionToken<InstitutionAffiliationsPort>('InstitutionAffiliationsPort');
