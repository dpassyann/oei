import { DomainsMockAdapter } from './domains-mock.adapter';

describe('DomainsMockAdapter', () => {
  it('givenRealVisionCategories_whenGetDomainAreas_thenReturnsAllEightDomains', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await adapter.getDomainAreas();
    expect(domains.length).toBe(8);
    expect(domains.map((domain) => domain.title)).toEqual([
      'Cybersécurité',
      'Intelligence Artificielle',
      'Informatique Verte',
      'Logiciels Critiques',
      'Formation Continue',
      'Architecture & Qualité',
      'Protection des Données',
      'Éthique & Société',
    ]);
    expect(domains.every((domain) => domain.icon.length > 0 && domain.description.length > 0)).toBe(true);
  });
});
