import { firstValueFrom } from 'rxjs';
import { MembershipMockAdapter } from './membership-mock.adapter';

describe('MembershipMockAdapter', () => {
  it('givenDemoMembership_whenGetMembership_thenReturnsSilverActiveForDemoMember', async () => {
    const adapter = new MembershipMockAdapter();
    const membership = await firstValueFrom(adapter.getMembership());
    expect(membership.memberId).toBe('demo-member-1');
    expect(membership.tier).toBe('SILVER');
    expect(membership.status).toBe('ACTIVE');
  });

  it('givenVersion_whenSignEthicalCharter_thenReturnsSignatureForDemoMember', async () => {
    const adapter = new MembershipMockAdapter();
    const signature = await firstValueFrom(adapter.signEthicalCharter('2026-1'));
    expect(signature.memberId).toBe('demo-member-1');
    expect(signature.version).toBe('2026-1');
  });

  it('givenNoAffiliations_whenListEmploymentAffiliations_thenReturnsEmptyArray', async () => {
    const adapter = new MembershipMockAdapter();
    const affiliations = await firstValueFrom(adapter.listEmploymentAffiliations());
    expect(affiliations).toEqual([]);
  });

  it('givenInstitutionAndMethod_whenRequestEmploymentAffiliation_thenReturnsPendingAffiliation', async () => {
    const adapter = new MembershipMockAdapter();
    const affiliation = await firstValueFrom(adapter.requestEmploymentAffiliation('institution-1', 'EMAIL_DOMAIN'));
    expect(affiliation.institutionId).toBe('institution-1');
    expect(affiliation.verificationMethod).toBe('EMAIL_DOMAIN');
    expect(affiliation.status).toBe('PENDING');
    expect(affiliation.memberId).toBe('demo-member-1');
  });

  it('givenNoRequests_whenListVerificationRequests_thenReturnsEmptyArray', async () => {
    const adapter = new MembershipMockAdapter();
    const requests = await firstValueFrom(adapter.listVerificationRequests());
    expect(requests).toEqual([]);
  });

  it('givenCreation_whenSubmitVerificationRequest_thenReturnsPendingRequest', async () => {
    const adapter = new MembershipMockAdapter();
    const request = await firstValueFrom(adapter.submitVerificationRequest({ type: 'IDENTITY' }));
    expect(request.type).toBe('IDENTITY');
    expect(request.status).toBe('PENDING');
    expect(request.memberId).toBe('demo-member-1');
  });
});
