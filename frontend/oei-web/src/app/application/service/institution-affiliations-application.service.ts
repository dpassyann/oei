import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { INSTITUTION_AFFILIATIONS_PORT } from '../../domain/port/institution/institution-affiliations.port';
import { MemberInstitutionAffiliation } from '../../domain/model/institution/member-institution-affiliation';

@Service()
export class InstitutionAffiliationsApplicationService {
  private readonly port = inject(INSTITUTION_AFFILIATIONS_PORT);

  listMembers(): Observable<MemberInstitutionAffiliation[]> {
    return this.port.listMembers();
  }

  listAffiliationRequests(): Observable<MemberInstitutionAffiliation[]> {
    return this.port.listAffiliationRequests();
  }

  approveAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.port.approveAffiliation(id);
  }

  rejectAffiliation(id: string): Observable<MemberInstitutionAffiliation> {
    return this.port.rejectAffiliation(id);
  }

  endAffiliation(id: string): Observable<void> {
    return this.port.endAffiliation(id);
  }
}
