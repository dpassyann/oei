import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MembershipPort } from '../../domain/port/membership/membership.port';
import { Membership } from '../../domain/model/membership/membership';
import { EthicalCharterSignature } from '../../domain/model/membership/ethical-charter-signature';
import {
  AffiliationVerificationMethod,
  EmploymentAffiliation,
} from '../../domain/model/membership/employment-affiliation';
import { VerificationRequest, VerificationRequestCreation } from '../../domain/model/membership/verification-request';

// Demonstration membership for `demo-member-1` — mirrors `DEMO_MEMBER.membership` in
// `member-mock.adapter.ts` (tier SILVER, status ACTIVE) so the whole mocked member space
// stays consistent.
export const DEMO_MEMBERSHIP: Membership = {
  memberId: 'demo-member-1',
  tier: 'SILVER',
  status: 'ACTIVE',
  startedAt: '2026-01-15T09:00:00Z',
  renewedAt: '2026-01-15T09:00:00Z',
  endsAt: null,
};

@Service()
export class MembershipMockAdapter implements MembershipPort {
  getMembership(): Observable<Membership> {
    return of(DEMO_MEMBERSHIP);
  }

  signEthicalCharter(version: string): Observable<EthicalCharterSignature> {
    return of({
      id: 'demo-charter-signature-1',
      memberId: 'demo-member-1',
      version,
      signedAt: new Date().toISOString(),
    });
  }

  listEmploymentAffiliations(): Observable<EmploymentAffiliation[]> {
    return of([]);
  }

  // Never auto-VERIFIED from a single call — see the port's doc comment on the
  // "Gold via employeur partenaire" workflow.
  requestEmploymentAffiliation(
    institutionId: string,
    verificationMethod: AffiliationVerificationMethod,
  ): Observable<EmploymentAffiliation> {
    return of({
      id: crypto.randomUUID(),
      memberId: 'demo-member-1',
      institutionId,
      verificationMethod,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
    });
  }

  listVerificationRequests(): Observable<VerificationRequest[]> {
    return of([]);
  }

  submitVerificationRequest(creation: VerificationRequestCreation): Observable<VerificationRequest> {
    return of({
      ...creation,
      id: crypto.randomUUID(),
      memberId: 'demo-member-1',
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    });
  }
}
