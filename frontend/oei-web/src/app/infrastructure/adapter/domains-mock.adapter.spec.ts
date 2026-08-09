import { firstValueFrom } from 'rxjs';
import { DomainsMockAdapter } from './domains-mock.adapter';

describe('DomainsMockAdapter', () => {
  it('givenRealVisionCategories_whenGetDomainAreasFr_thenReturnsAllNineDomainsInFrench', async () => {
    const adapter = new DomainsMockAdapter();
    const domains = await firstValueFrom(adapter.getDomainAreas('fr'));
    expect(domains.length).toBe(9);
    expect(domains.map((domain) => domain.title)).toEqual([
      'Cybersécurité',
      'Intelligence Artificielle',
      'Informatique Verte',
      'Logiciels Critiques',
      'Formation Continue',
      'Architecture & Qualité',
      'Protection des Données',
      'Éthique & Société',
      'Normes & Pratiques Professionnelles',
    ]);
    expect(domains.every((domain) => domain.icon.length > 0 && domain.description.length > 0)).toBe(
      true,
    );
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
      'Standards & Professional Practices',
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

  it('givenFrenchLang_whenGetDomainArea_thenReturnsFullEditorialSectionsAndNoFallbackFlag', async () => {
    const adapter = new DomainsMockAdapter();
    const domain = await firstValueFrom(adapter.getDomainArea('cybersecurite', 'fr'));
    expect(domain.sections?.length).toBeGreaterThan(0);
    expect(domain.sections?.[0].id).toBe('introduction');
    expect(domain.relatedResources?.length).toBeGreaterThan(0);
    expect(domain.relatedNews?.length).toBeGreaterThan(0);
    expect(domain.isContentFallback).toBeUndefined();
  });

  it('givenNinthDomainSlug_whenGetDomainAreaEn_thenReturnsStandardsAndPracticesContent', async () => {
    const adapter = new DomainsMockAdapter();
    const domain = await firstValueFrom(adapter.getDomainArea('normes-pratiques', 'en'));
    expect(domain.title).toBe('Standards & Professional Practices');
    expect(domain.sections?.map((section) => section.id)).toContain('oei-position');
  });

  it('givenNonFrEnLang_whenGetDomainArea_thenFallsBackToEnglishSectionsWithFallbackFlag', async () => {
    const adapter = new DomainsMockAdapter();
    const domain = await firstValueFrom(adapter.getDomainArea('cybersecurite', 'de'));
    expect(domain.title).toBe('Cybersicherheit');
    expect(domain.isContentFallback).toBe(true);
    expect(domain.sections?.[0].title).toBe('Introduction');
  });

  it('givenUnknownSlug_whenGetDomainArea_thenErrors', async () => {
    const adapter = new DomainsMockAdapter();
    await expect(firstValueFrom(adapter.getDomainArea('does-not-exist', 'fr'))).rejects.toThrow();
  });
});
