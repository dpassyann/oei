import { Service, signal } from '@angular/core';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../domain/model/document';

// The interface dictionaries are nested (e.g. `{ nav: { home: '...' } }`) so keys are
// dotted paths (`nav.home`); `translate`/`translateList` walk the path rather than doing
// a flat lookup. A leaf can also be a string array (`translateList`), used for content
// that's a variable-length list of localized strings (e.g. a checklist).
type TranslationValue = string | readonly string[] | TranslationDict;
type TranslationDict = { readonly [key: string]: TranslationValue };

const STORAGE_KEY = 'oei-lang';

// A manually-selected language must survive a full page reload — notably the Keycloak
// Authorization Code + PKCE redirect round-trip (login/logout genuinely navigate away from the
// SPA and back), which would otherwise silently reset the UI to the browser-detected language
// and undo the visitor's own choice. `localStorage` is guarded (private browsing, etc.).
function readStoredLanguage(): SupportedLanguage | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
      ? (stored as SupportedLanguage)
      : undefined;
  } catch {
    return undefined;
  }
}

function storeLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage unavailable (private browsing, etc.) — not blocking, just not persisted.
  }
}

// Default language: a previously-selected language wins, then the visitor's browser language
// when we support it, English otherwise (never French by default — the site targets an
// international audience). `navigator` is guarded for non-browser test/SSR environments, where
// it falls back to English.
function detectBrowserLanguage(): SupportedLanguage {
  const stored = readStoredLanguage();
  if (stored) {
    return stored;
  }
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const primary = candidate?.split('-')[0]?.toLowerCase();
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(primary)) {
      return primary as SupportedLanguage;
    }
  }
  return 'en';
}

@Service()
export class I18nService {
  // A signal (not a plain Map) so that populating it — even when `currentLang`
  // itself doesn't change value (e.g. the very first load of the default
  // language) — notifies every template that calls `translate()`. A plain
  // Map mutation is invisible to Angular's zoneless change detection: only
  // the *signal write* schedules a re-render.
  private readonly cache = signal(new Map<SupportedLanguage, TranslationDict>());
  readonly currentLang = signal<SupportedLanguage>(detectBrowserLanguage());

  async setLang(lang: SupportedLanguage): Promise<void> {
    if (!this.cache().has(lang)) {
      const response = await fetch(`/i18n/${lang}.json`);
      const dict = (await response.json()) as TranslationDict;
      this.cache.update((map) => new Map(map).set(lang, dict));
    }
    this.currentLang.set(lang);
    storeLanguage(lang);
  }

  translate(key: string): string {
    const value = this.resolve(key);
    return typeof value === 'string' ? value : key;
  }

  translateList(key: string): readonly string[] {
    const value = this.resolve(key);
    return Array.isArray(value) ? value : [];
  }

  private resolve(key: string): TranslationValue | undefined {
    const dict = this.cache().get(this.currentLang());
    if (!dict) {
      return undefined;
    }
    return key.split('.').reduce<TranslationValue | undefined>((node, segment) => {
      return node && typeof node === 'object' && !Array.isArray(node)
        ? (node as TranslationDict)[segment]
        : undefined;
    }, dict);
  }
}
