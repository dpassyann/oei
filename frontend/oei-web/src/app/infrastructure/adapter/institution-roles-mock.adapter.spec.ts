import { firstValueFrom } from 'rxjs';
import { InstitutionRolesMockAdapter } from './institution-roles-mock.adapter';

describe('InstitutionRolesMockAdapter', () => {
  it('whenListRoleAssignments_thenReturnsDemoMemberships', async () => {
    const adapter = new InstitutionRolesMockAdapter();
    const memberships = await firstValueFrom(adapter.listRoleAssignments());
    expect(memberships.length).toBeGreaterThan(0);
    expect(memberships.every((membership) => membership.institutionId === 'inst-demo-institution')).toBe(true);
  });

  it('givenExistingMember_whenUpdateRoleAssignment_thenChangesRole', async () => {
    const adapter = new InstitutionRolesMockAdapter();
    const updated = await firstValueFrom(adapter.updateRoleAssignment('member-admin-demo', 'HR'));
    expect(updated.role).toBe('HR');
  });

  it('givenUnknownMember_whenUpdateRoleAssignment_thenThrows', async () => {
    const adapter = new InstitutionRolesMockAdapter();
    await expect(firstValueFrom(adapter.updateRoleAssignment('unknown', 'HR'))).rejects.toThrow();
  });

  it('givenExistingMember_whenRemoveRoleAssignment_thenNoLongerListed', async () => {
    const adapter = new InstitutionRolesMockAdapter();
    await firstValueFrom(adapter.removeRoleAssignment('member-admin-demo'));
    const memberships = await firstValueFrom(adapter.listRoleAssignments());
    expect(memberships.some((membership) => membership.memberId === 'member-admin-demo')).toBe(false);
  });
});
