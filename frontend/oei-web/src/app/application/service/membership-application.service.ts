import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MEMBERSHIP_PORT } from '../../domain/port/membership/membership.port';
import { Membership } from '../../domain/model/membership/membership';
import { EthicalCharterSignature } from '../../domain/model/membership/ethical-charter-signature';
import {
  AffiliationVerificationMethod,
  EmploymentAffiliation,
} from '../../domain/model/membership/employment-affiliation';
import { VerificationRequest, VerificationRequestCreation } from '../../domain/model/membership/verification-request';

@Service()
export class MembershipApplicationService {
  private readonly port = inject(MEMBERSHIP_PORT);

  getMembership(): Observable<Membership> {
    return this.port.getMembership();
  }

  signEthicalCharter(version: string): Observable<EthicalCharterSignature> {
    return this.port.signEthicalCharter(version);
  }

  listEmploymentAffiliations(): Observable<EmploymentAffiliation[]> {
    return this.port.listEmploymentAffiliations();
  }

  requestEmploymentAffiliation(
    institutionId: string,
    verificationMethod: AffiliationVerificationMethod,
  ): Observable<EmploymentAffiliation> {
    return this.port.requestEmploymentAffiliation(institutionId, verificationMethod);
  }

  listVerificationRequests(): Observable<VerificationRequest[]> {
    return this.port.listVerificationRequests();
  }

  submitVerificationRequest(creation: VerificationRequestCreation): Observable<VerificationRequest> {
    return this.port.submitVerificationRequest(creation);
  }
}
