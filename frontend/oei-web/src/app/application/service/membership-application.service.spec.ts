import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { MembershipApplicationService } from './membership-application.service';
import { MEMBERSHIP_PORT, MembershipPort } from '../../domain/port/membership/membership.port';

describe('MembershipApplicationService', () => {
  function setup(fakePort: MembershipPort) {
    TestBed.configureTestingModule({ providers: [{ provide: MEMBERSHIP_PORT, useValue: fakePort }] });
    return TestBed.inject(MembershipApplicationService);
  }

  it('givenPortReturnsMembership_whenGetMembership_thenForwardsIt', async () => {
    const expected = {
      memberId: 'member-1',
      tier: 'SILVER' as const,
      status: 'ACTIVE' as const,
      startedAt: '2026-01-01T00:00:00Z',
    };
    const service = setup({
      getMembership: () => of(expected),
      signEthicalCharter: () => of(),
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: () => of(),
      listVerificationRequests: () => of([]),
      submitVerificationRequest: () => of(),
    } as unknown as MembershipPort);
    const membership = await firstValueFrom(service.getMembership());
    expect(membership).toEqual(expected);
  });

  it('givenVersion_whenSignEthicalCharter_thenForwardsVersionToPort', async () => {
    let receivedVersion: string | undefined;
    const expected = { id: 'signature-1', memberId: 'member-1', version: '2026-1', signedAt: '2026-01-01T00:00:00Z' };
    const service = setup({
      getMembership: () => of(),
      signEthicalCharter: (version: string) => {
        receivedVersion = version;
        return of(expected);
      },
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: () => of(),
      listVerificationRequests: () => of([]),
      submitVerificationRequest: () => of(),
    } as unknown as MembershipPort);
    const signature = await firstValueFrom(service.signEthicalCharter('2026-1'));
    expect(receivedVersion).toBe('2026-1');
    expect(signature).toEqual(expected);
  });

  it('givenPortReturnsAffiliations_whenListEmploymentAffiliations_thenForwardsThem', async () => {
    const service = setup({
      getMembership: () => of(),
      signEthicalCharter: () => of(),
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: () => of(),
      listVerificationRequests: () => of([]),
      submitVerificationRequest: () => of(),
    } as unknown as MembershipPort);
    const affiliations = await firstValueFrom(service.listEmploymentAffiliations());
    expect(affiliations).toEqual([]);
  });

  it('givenInstitutionAndMethod_whenRequestEmploymentAffiliation_thenForwardsBothArgumentsToPort', async () => {
    let receivedArgs: unknown;
    const expected = {
      id: 'affiliation-1',
      memberId: 'member-1',
      institutionId: 'institution-1',
      verificationMethod: 'EMAIL_DOMAIN',
      status: 'PENDING',
      startedAt: '2026-01-01T00:00:00Z',
    };
    const service = setup({
      getMembership: () => of(),
      signEthicalCharter: () => of(),
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: (institutionId: string, verificationMethod: string) => {
        receivedArgs = { institutionId, verificationMethod };
        return of(expected);
      },
      listVerificationRequests: () => of([]),
      submitVerificationRequest: () => of(),
    } as unknown as MembershipPort);
    const affiliation = await firstValueFrom(service.requestEmploymentAffiliation('institution-1', 'EMAIL_DOMAIN'));
    expect(receivedArgs).toEqual({ institutionId: 'institution-1', verificationMethod: 'EMAIL_DOMAIN' });
    expect(affiliation).toEqual(expected);
  });

  it('givenPortReturnsRequests_whenListVerificationRequests_thenForwardsThem', async () => {
    const service = setup({
      getMembership: () => of(),
      signEthicalCharter: () => of(),
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: () => of(),
      listVerificationRequests: () => of([]),
      submitVerificationRequest: () => of(),
    } as unknown as MembershipPort);
    const requests = await firstValueFrom(service.listVerificationRequests());
    expect(requests).toEqual([]);
  });

  it('givenCreation_whenSubmitVerificationRequest_thenForwardsItToPort', async () => {
    let receivedCreation: unknown;
    const expected = {
      id: 'request-1',
      memberId: 'member-1',
      type: 'IDENTITY',
      status: 'PENDING',
      submittedAt: '2026-01-01T00:00:00Z',
    };
    const service = setup({
      getMembership: () => of(),
      signEthicalCharter: () => of(),
      listEmploymentAffiliations: () => of([]),
      requestEmploymentAffiliation: () => of(),
      listVerificationRequests: () => of([]),
      submitVerificationRequest: (creation: unknown) => {
        receivedCreation = creation;
        return of(expected);
      },
    } as unknown as MembershipPort);
    const request = await firstValueFrom(service.submitVerificationRequest({ type: 'IDENTITY' }));
    expect(receivedCreation).toEqual({ type: 'IDENTITY' });
    expect(request).toEqual(expected);
  });
});
