import { DomainsMockAdapter } from './domains-mock.adapter';

describe('DomainsMockAdapter', () => {
  it('givenRealVisionCategories_whenGetDomainAreasFr_thenReturnsAllEightDomainsInFrench', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await adapter.getDomainAreas('fr');
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

  it('givenEnglishLang_whenGetDomainAreas_thenReturnsEnglishTitles', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await adapter.getDomainAreas('en');
    expect(domains.map((domain) => domain.title)).toEqual([
      'Cybersecurity',
      'Artificial Intelligence',
      'Green IT',
      'Critical Software',
      'Continuing Education',
      'Architecture & Quality',
      'Data Protection',
      'Ethics & Society',
    ]);
  });

  it('givenUnsupportedLang_whenGetDomainAreas_thenFallsBackToEnglish', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await adapter.getDomainAreas('xx');
    expect(domains[0].title).toBe('Cybersecurity');
  });
});
