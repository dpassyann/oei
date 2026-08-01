import { Injectable, signal } from '@angular/core';
import { SupportedLanguage } from '../../domain/model/document';

// The interface dictionaries are nested (e.g. `{ nav: { home: '...' } }`) so keys are
// dotted paths (`nav.home`); `translate` walks the path rather than doing a flat lookup.
type TranslationDict = { readonly [key: string]: string | TranslationDict };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly cache = new Map<SupportedLanguage, TranslationDict>();
  readonly currentLang = signal<SupportedLanguage>('fr');

  async setLang(lang: SupportedLanguage): Promise<void> {
    if (!this.cache.has(lang)) {
      const response = await fetch(`/i18n/${lang}.json`);
      this.cache.set(lang, await response.json());
    }
    this.currentLang.set(lang);
  }

  translate(key: string): string {
    const dict = this.cache.get(this.currentLang());
    if (!dict) {
      return key;
    }
    const value = key.split('.').reduce<string | TranslationDict | undefined>((node, segment) => {
      return node && typeof node === 'object' ? node[segment] : undefined;
    }, dict);
    return typeof value === 'string' ? value : key;
  }
}
