import { createInstitutionDashboard } from './institution-dashboard';

describe('InstitutionDashboard', () => {
  it('givenValidFields_whenCreateInstitutionDashboard_thenReturnsFrozenValue', () => {
    const dashboard = createInstitutionDashboard({
      institutionId: 'inst-demo',
      affiliatedMembers: 3,
      activeMembers: 2,
      verifiedProfiles: 1,
      certifications: 0,
      badges: 0,
      signedCharters: 1,
      contributions: 0,
      trainings: 0,
      opportunities: 2,
      publications: 1,
      invitations: 1,
      dataMaturity: 'IN_PROGRESS',
    });
    expect(dashboard.dataMaturity).toBe('IN_PROGRESS');
    expect(Object.isFrozen(dashboard)).toBe(true);
  });
});
