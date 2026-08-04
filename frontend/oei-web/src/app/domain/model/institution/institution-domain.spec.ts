import { createInstitutionDomain } from './institution-domain';

describe('InstitutionDomain', () => {
  it('givenValidFields_whenCreateInstitutionDomain_thenReturnsFrozenValue', () => {
    const domain = createInstitutionDomain({ id: 'dom-1', domain: 'oei-demo.org', verified: true, verifiedAt: '2026-01-01T00:00:00Z' });
    expect(domain.domain).toBe('oei-demo.org');
    expect(Object.isFrozen(domain)).toBe(true);
  });
});
