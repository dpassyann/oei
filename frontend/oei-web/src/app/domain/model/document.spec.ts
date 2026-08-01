import { createDocument, SUPPORTED_LANGUAGES } from './document';

describe('Document', () => {
  it('givenValidFields_whenCreateDocument_thenReturnsFrozenDocument', () => {
    const doc = createDocument({ slug: 'home', lang: 'fr', title: 'Titre', body: 'Corps', isFallback: false });
    expect(doc.slug).toBe('home');
    expect(Object.isFrozen(doc)).toBe(true);
  });

  it('exposesSixSupportedLanguages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['fr', 'en', 'de', 'es', 'it', 'pt']);
  });
});
