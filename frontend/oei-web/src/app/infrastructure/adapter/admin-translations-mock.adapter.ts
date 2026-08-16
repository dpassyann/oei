import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of } from 'rxjs';
import { AdminTranslationsPort, FlatDictionary } from '../../domain/port/admin/admin-translations.port';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../domain/model/document';
import { flattenDictionary } from './translation-dictionary-flatten';

/**
 * Reads the real `/i18n/*.json` public assets via `HttpClient` (same URL pattern
 * `I18nService.setLang` uses), which keeps this admin screen from ever statically importing the
 * 6 (large) JSON files into the JS bundle. `updateValue` is intentionally mock-only: it layers an
 * in-memory overlay on top of the fetched dictionaries rather than writing anything back to disk
 * — there is no browser API that could safely rewrite `public/i18n/*.json` anyway, and doing so
 * would race with the very content pipeline (`scripts/copy-content-assets.mjs` et al.) that
 * produces those files. A real "save" action would need a backend endpoint that this frontend
 * doesn't have yet (see `AdminTranslationsApiAdapter`'s doc comment).
 */
@Service()
export class AdminTranslationsMockAdapter implements AdminTranslationsPort {
  private readonly http = inject(HttpClient);
  private readonly overlay = new Map<SupportedLanguage, Map<string, string>>();

  getDictionaries(): Observable<Readonly<Record<SupportedLanguage, FlatDictionary>>> {
    const requests = SUPPORTED_LANGUAGES.map((lang) =>
      this.http.get(`/i18n/${lang}.json`).pipe(map((raw) => [lang, flattenDictionary(raw as never)] as const)),
    );
    return forkJoin(requests).pipe(
      map((entries) => {
        const result = {} as Record<SupportedLanguage, FlatDictionary>;
        for (const [lang, flat] of entries) {
          const overlayForLang = this.overlay.get(lang);
          result[lang] = overlayForLang ? { ...flat, ...Object.fromEntries(overlayForLang) } : flat;
        }
        return result;
      }),
    );
  }

  updateValue(lang: SupportedLanguage, key: string, value: string): Observable<void> {
    const overlayForLang = this.overlay.get(lang) ?? new Map<string, string>();
    overlayForLang.set(key, value);
    this.overlay.set(lang, overlayForLang);
    return of(undefined);
  }
}
