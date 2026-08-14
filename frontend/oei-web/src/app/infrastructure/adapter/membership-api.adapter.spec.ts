import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { MembershipApiAdapter } from './membership-api.adapter';

describe('MembershipApiAdapter', () => {
  function createAdapter(): { adapter: MembershipApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [MembershipApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(MembershipApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsMembership_whenGetMembership_thenCallsMembershipEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.getMembership());
    const req = httpMock.expectOne('/api/member/v1/membership');
    expect(req.request.method).toBe('GET');
    req.flush({
      memberId: 'member-1',
      tier: 'SILVER',
      status: 'ACTIVE',
      startedAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).tier).toBe('SILVER');
    httpMock.verify();
  });

  it('givenVersion_whenSignEthicalCharter_thenPostsVersionToSignEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.signEthicalCharter('2026-1'));
    const req = httpMock.expectOne('/api/member/v1/ethical-charter/sign');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ version: '2026-1' });
    req.flush({ id: 'signature-1', memberId: 'member-1', version: '2026-1', signedAt: '2026-01-01T00:00:00Z' });
    expect((await result).version).toBe('2026-1');
    httpMock.verify();
  });

  it('givenBackendReturnsAffiliations_whenListEmploymentAffiliations_thenCallsAffiliationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listEmploymentAffiliations());
    const req = httpMock.expectOne('/api/member/v1/employment-affiliations');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'affiliation-1',
        memberId: 'member-1',
        institutionId: 'institution-1',
        verificationMethod: 'EMAIL_DOMAIN',
        status: 'PENDING',
        startedAt: '2026-01-01T00:00:00Z',
      },
    ]);
    expect((await result)[0].institutionId).toBe('institution-1');
    httpMock.verify();
  });

  it('givenInstitutionAndMethod_whenRequestEmploymentAffiliation_thenPostsBodyToAffiliationsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.requestEmploymentAffiliation('institution-1', 'INSTITUTION_VALIDATION'));
    const req = httpMock.expectOne('/api/member/v1/employment-affiliations');
    expect(req.request.method).toBe('POST');
    // The OpenAPI requestBody only declares `institutionId` — `verificationMethod` is not
    // part of the wire contract (decided/enforced server-side).
    expect(req.request.body).toEqual({ institutionId: 'institution-1' });
    req.flush({
      id: 'affiliation-1',
      memberId: 'member-1',
      institutionId: 'institution-1',
      verificationMethod: 'INSTITUTION_VALIDATION',
      status: 'PENDING',
      startedAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).status).toBe('PENDING');
    httpMock.verify();
  });

  it('givenBackendReturnsRequests_whenListVerificationRequests_thenCallsVerificationRequestsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.listVerificationRequests());
    const req = httpMock.expectOne('/api/member/v1/verification-requests');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'request-1',
        memberId: 'member-1',
        type: 'IDENTITY',
        status: 'PENDING',
        submittedAt: '2026-01-01T00:00:00Z',
      },
    ]);
    expect((await result)[0].type).toBe('IDENTITY');
    httpMock.verify();
  });

  it('givenCreation_whenSubmitVerificationRequest_thenPostsBodyToVerificationRequestsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const result = firstValueFrom(adapter.submitVerificationRequest({ type: 'PROFILE', referenceId: 'ref-1' }));
    const req = httpMock.expectOne('/api/member/v1/verification-requests');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'PROFILE', referenceId: 'ref-1' });
    req.flush({
      id: 'request-1',
      memberId: 'member-1',
      type: 'PROFILE',
      referenceId: 'ref-1',
      status: 'PENDING',
      submittedAt: '2026-01-01T00:00:00Z',
    });
    expect((await result).referenceId).toBe('ref-1');
    httpMock.verify();
  });
});
