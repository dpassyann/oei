import { Service, signal } from '@angular/core';
import { SupportedLanguage } from '../../domain/model/document';

// The interface dictionaries are nested (e.g. `{ nav: { home: '...' } }`) so keys are
// dotted paths (`nav.home`); `translate` walks the path rather than doing a flat lookup.
type TranslationDict = { readonly [key: string]: string | TranslationDict };

@Service()
export class I18nService {
  // A signal (not a plain Map) so that populating it — even when `currentLang`
  // itself doesn't change value (e.g. the very first load of the default
  // language) — notifies every template that calls `translate()`. A plain
  // Map mutation is invisible to Angular's zoneless change detection: only
  // the *signal write* schedules a re-render.
  private readonly cache = signal(new Map<SupportedLanguage, TranslationDict>());
  readonly currentLang = signal<SupportedLanguage>('en');

  async setLang(lang: SupportedLanguage): Promise<void> {
    if (!this.cache().has(lang)) {
      const response = await fetch(`/i18n/${lang}.json`);
      const dict = (await response.json()) as TranslationDict;
      this.cache.update((map) => new Map(map).set(lang, dict));
    }
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    const dict = this.cache().get(this.currentLang());
    if (!dict) {
      return key;
    }
    const value = key.split('.').reduce<string | TranslationDict | undefined>((node, segment) => {
      return node && typeof node === 'object' ? node[segment] : undefined;
    }, dict);
    return typeof value === 'string' ? value : key;
  }
}
