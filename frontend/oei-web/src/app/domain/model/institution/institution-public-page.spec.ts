import { createInstitutionPublicPage } from './institution-public-page';
import { createInstitution } from './institution';

describe('InstitutionPublicPage', () => {
  it('givenValidFields_whenCreateInstitutionPublicPage_thenReturnsFrozenValueWithFrozenArrays', () => {
    const page = createInstitutionPublicPage({
      institution: createInstitution({
        id: 'inst-demo',
        legalName: 'OEI Démonstration SA',
        publicName: 'OEI Démonstration',
        logoUrl: '/img/institutions/demo-logo.svg',
        country: 'CH',
        sectors: ['banking'],
        description: 'Institution fictive de démonstration.',
        emailDomains: [],
        publicSlug: 'demo-institution',
        isDemoData: true,
      }),
      partnership: null,
      publications: [],
      opportunities: [],
    });
    expect(page.institution.publicSlug).toBe('demo-institution');
    expect(Object.isFrozen(page)).toBe(true);
    expect(Object.isFrozen(page.publications)).toBe(true);
  });
});
