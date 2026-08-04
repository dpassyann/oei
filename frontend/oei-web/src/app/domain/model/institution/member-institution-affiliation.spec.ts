import { createMemberInstitutionAffiliation } from './member-institution-affiliation';

describe('MemberInstitutionAffiliation', () => {
  it('givenValidFields_whenCreateMemberInstitutionAffiliation_thenReturnsFrozenValue', () => {
    const affiliation = createMemberInstitutionAffiliation({
      id: 'aff-1',
      memberId: 'member-42',
      memberDisplayName: 'A. Membre',
      institutionId: 'inst-demo',
      status: 'PENDING',
      requestedAt: '2026-01-01T00:00:00Z',
      decidedAt: null,
      decidedBy: null,
      emailDomainVerified: true,
    });
    expect(affiliation.status).toBe('PENDING');
    expect(Object.isFrozen(affiliation)).toBe(true);
  });
});
