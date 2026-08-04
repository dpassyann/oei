import { firstValueFrom } from 'rxjs';
import { DomainsMockAdapter } from './domains-mock.adapter';

describe('DomainsMockAdapter', () => {
  it('givenRealVisionCategories_whenGetDomainAreasFr_thenReturnsAllEightDomainsInFrench', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await firstValueFrom(adapter.getDomainAreas('fr'));
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
    const domains = await firstValueFrom(adapter.getDomainAreas('en'));
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
    const domains = await firstValueFrom(adapter.getDomainAreas('xx'));
    expect(domains[0].title).toBe('Cybersecurity');
  });

  it('givenKnownSlug_whenGetDomainArea_thenReturnsMatchingDomain', async () => {
    const adapter = new DomainsMockAdapter();
    const domain = await firstValueFrom(adapter.getDomainArea('cybersecurite', 'fr'));
    expect(domain.title).toBe('Cybersécurité');
    expect(domain.slug).toBe('cybersecurite');
    expect(domain.lastModified.length).toBeGreaterThan(0);
  });

  it('givenUnknownSlug_whenGetDomainArea_thenErrors', async () => {
    const adapter = new DomainsMockAdapter();
    await expect(firstValueFrom(adapter.getDomainArea('does-not-exist', 'fr'))).rejects.toThrow();
  });
});
