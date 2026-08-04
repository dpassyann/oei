import { createInstitution } from './institution';
import { createInstitutionDomain } from './institution-domain';

describe('Institution', () => {
  it('givenValidFields_whenCreateInstitution_thenReturnsFrozenValueWithFrozenArrays', () => {
    const institution = createInstitution({
      id: 'inst-demo',
      legalName: 'OEI Démonstration SA',
      publicName: 'OEI Démonstration',
      logoUrl: '/img/institutions/demo-logo.svg',
      country: 'CH',
      sectors: ['banking', 'insurance'],
      description: 'Institution fictive de démonstration.',
      emailDomains: [createInstitutionDomain({ id: 'dom-1', domain: 'oei-demo.org', verified: true, verifiedAt: null })],
      publicSlug: 'demo-institution',
      isDemoData: true,
    });

    expect(institution.publicSlug).toBe('demo-institution');
    expect(institution.isDemoData).toBe(true);
    expect(Object.isFrozen(institution)).toBe(true);
    expect(Object.isFrozen(institution.sectors)).toBe(true);
    expect(Object.isFrozen(institution.emailDomains)).toBe(true);
  });
});
