import { createInstitutionMembership } from './institution-membership';

describe('InstitutionMembership', () => {
  it('givenValidFields_whenCreateInstitutionMembership_thenReturnsFrozenValue', () => {
    const membership = createInstitutionMembership({
      memberId: 'member-1',
      institutionId: 'inst-demo',
      role: 'ADMIN',
      grantedAt: '2026-01-01T00:00:00Z',
      grantedBy: 'member-owner',
    });
    expect(membership.role).toBe('ADMIN');
    expect(Object.isFrozen(membership)).toBe(true);
  });
});
