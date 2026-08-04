import { createInstitutionOpportunity } from './institution-opportunity';

describe('InstitutionOpportunity', () => {
  it('givenValidFields_whenCreateInstitutionOpportunity_thenReturnsFrozenValue', () => {
    const opportunity = createInstitutionOpportunity({
      id: 'opp-1',
      institutionId: 'inst-demo',
      type: 'MENTORING',
      title: 'Mentorat démonstration',
      description: 'Description',
      status: 'PUBLISHED',
      expiresAt: null,
      publishedAt: '2026-01-01T00:00:00Z',
    });
    expect(opportunity.type).toBe('MENTORING');
    expect(Object.isFrozen(opportunity)).toBe(true);
  });
});
