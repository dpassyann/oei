import { ContentMockAdapter } from './content-mock.adapter';

describe('ContentMockAdapter', () => {
  it('givenFrenchLang_whenGetHomeContent_thenReturnsFrenchFixture', async () => {
    const adapter = new ContentMockAdapter();
    const doc = await adapter.getHomeContent('fr');
    expect(doc.lang).toBe('fr');
    expect(doc.isFallback).toBe(false);
    expect(doc.title.length).toBeGreaterThan(0);
  });

  it('givenUnsupportedLang_whenGetHomeContent_thenFallsBackToEnglish', async () => {
    const adapter = new ContentMockAdapter();
    const doc = await adapter.getHomeContent('de');
    expect(doc.lang).toBe('en');
    expect(doc.isFallback).toBe(true);
  });
});
