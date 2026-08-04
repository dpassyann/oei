import { createInstitutionContribution } from './institution-contribution';

describe('InstitutionContribution', () => {
  it('givenValidFields_whenCreateInstitutionContribution_thenReturnsFrozenValue', () => {
    const contribution = createInstitutionContribution({
      id: 'contrib-1',
      institutionId: 'inst-demo',
      type: 'working-group',
      description: 'Participation au groupe de travail référentiel de compétences.',
      status: 'active',
    });
    expect(contribution.type).toBe('working-group');
    expect(Object.isFrozen(contribution)).toBe(true);
  });
});
