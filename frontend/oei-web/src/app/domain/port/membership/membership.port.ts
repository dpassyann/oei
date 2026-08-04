import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Membership } from '../../model/membership/membership';
import { EthicalCharterSignature } from '../../model/membership/ethical-charter-signature';
import {
  AffiliationVerificationMethod,
  EmploymentAffiliation,
} from '../../model/membership/employment-affiliation';
import { VerificationRequest, VerificationRequestCreation } from '../../model/membership/verification-request';

export interface MembershipPort {
  getMembership(): Observable<Membership>;
  signEthicalCharter(version: string): Observable<EthicalCharterSignature>;
  listEmploymentAffiliations(): Observable<EmploymentAffiliation[]>;
  // Corresponds to the mocked "Gold via employeur partenaire" workflow: the affiliation
  // starts PENDING until the chosen verification method (verified email domain or
  // institutional validation) is honored — never auto-VERIFIED from a free-text claim.
  requestEmploymentAffiliation(
    institutionId: string,
    verificationMethod: AffiliationVerificationMethod,
  ): Observable<EmploymentAffiliation>;
  listVerificationRequests(): Observable<VerificationRequest[]>;
  submitVerificationRequest(creation: VerificationRequestCreation): Observable<VerificationRequest>;
}

export const MEMBERSHIP_PORT = new InjectionToken<MembershipPort>('MembershipPort');
