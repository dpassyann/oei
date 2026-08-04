import { firstValueFrom } from 'rxjs';
import { InstitutionAffiliationsMockAdapter } from './institution-affiliations-mock.adapter';
import { OTHER_INSTITUTION_MEMBERS_NEVER_EXPOSED } from './institution-demo-data';

describe('InstitutionAffiliationsMockAdapter', () => {
  it('whenListMembers_thenOnlyReturnsApprovedDemoInstitutionMembers', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    const members = await firstValueFrom(adapter.listMembers());
    expect(members.every((member) => member.institutionId === 'inst-demo-institution')).toBe(true);
    expect(members.every((member) => member.status === 'APPROVED')).toBe(true);
  });

  it('multiTenantIsolation_neverReturnsOtherInstitutionMembers', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    const members = await firstValueFrom(adapter.listAffiliationRequests());
    const otherIds = OTHER_INSTITUTION_MEMBERS_NEVER_EXPOSED.map((m) => m.id);
    expect(members.some((member) => otherIds.includes(member.id))).toBe(false);
  });

  it('givenPendingAffiliation_whenApprove_thenStatusBecomesApproved', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    const approved = await firstValueFrom(adapter.approveAffiliation('affiliation-demo-2'));
    expect(approved.status).toBe('APPROVED');
    expect(approved.decidedBy).toBe('member-validator-demo');
  });

  it('givenPendingAffiliation_whenReject_thenStatusBecomesRejected', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    const rejected = await firstValueFrom(adapter.rejectAffiliation('affiliation-demo-2'));
    expect(rejected.status).toBe('REJECTED');
  });

  it('givenApprovedAffiliation_whenEndAffiliation_thenNoLongerListedAsMember', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    await firstValueFrom(adapter.endAffiliation('affiliation-demo-1'));
    const members = await firstValueFrom(adapter.listMembers());
    expect(members.some((member) => member.id === 'affiliation-demo-1')).toBe(false);
  });

  it('givenUnknownAffiliation_whenApprove_thenThrows', async () => {
    const adapter = new InstitutionAffiliationsMockAdapter();
    await expect(firstValueFrom(adapter.approveAffiliation('unknown'))).rejects.toThrow();
  });
});
