import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MembershipPort } from '../../domain/port/membership/membership.port';
import { Membership } from '../../domain/model/membership/membership';
import { EthicalCharterSignature } from '../../domain/model/membership/ethical-charter-signature';
import {
  AffiliationVerificationMethod,
  EmploymentAffiliation,
} from '../../domain/model/membership/employment-affiliation';
import { VerificationRequest, VerificationRequestCreation } from '../../domain/model/membership/verification-request';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal
// prefix rather than `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1`
// public-site base and is only overridable for that historical family of endpoints).
const MEMBERSHIP_API_BASE = '/api/member/v1';

@Service()
export class MembershipApiAdapter implements MembershipPort {
  private readonly http = inject(HttpClient);

  getMembership(): Observable<Membership> {
    return this.http.get<Membership>(`${MEMBERSHIP_API_BASE}/membership`);
  }

  signEthicalCharter(version: string): Observable<EthicalCharterSignature> {
    return this.http.post<EthicalCharterSignature>(`${MEMBERSHIP_API_BASE}/ethical-charter/sign`, { version });
  }

  listEmploymentAffiliations(): Observable<EmploymentAffiliation[]> {
    return this.http.get<EmploymentAffiliation[]>(`${MEMBERSHIP_API_BASE}/employment-affiliations`);
  }

  // The OpenAPI `requestEmploymentAffiliation` requestBody only declares `institutionId`
  // (the verification method is decided/enforced server-side, not accepted as client
  // input) — `verificationMethod` stays a port parameter for the caller/UI's own display
  // logic (e.g. which CTA the member picked) but is intentionally not sent in the body.
  requestEmploymentAffiliation(
    institutionId: string,
    _verificationMethod: AffiliationVerificationMethod,
  ): Observable<EmploymentAffiliation> {
    return this.http.post<EmploymentAffiliation>(`${MEMBERSHIP_API_BASE}/employment-affiliations`, {
      institutionId,
    });
  }

  listVerificationRequests(): Observable<VerificationRequest[]> {
    return this.http.get<VerificationRequest[]>(`${MEMBERSHIP_API_BASE}/verification-requests`);
  }

  submitVerificationRequest(creation: VerificationRequestCreation): Observable<VerificationRequest> {
    return this.http.post<VerificationRequest>(`${MEMBERSHIP_API_BASE}/verification-requests`, creation);
  }
}
