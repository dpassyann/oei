import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { AdminTranslationsPort, FlatDictionary } from '../../domain/port/admin/admin-translations.port';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../domain/model/document';
import { flattenDictionary } from './translation-dictionary-flatten';

// Reading is identical to the mock adapter: both simply fetch the public `/i18n/*.json` assets,
// there is no backend "translations" service to call instead (the dictionaries are static files
// served by the web server, not a database-backed resource). Writing, however, has no
// corresponding endpoint at all in `openapi/oei-api.yaml` yet — a real "save this translation"
// action would need something like `PUT /api/admin/v1/translations/{lang}/{key}` that doesn't
// exist today, so `updateValue` here documents that gap instead of silently no-op'ing: it throws
// so a real (non-mock) environment fails loudly rather than pretending to save.
@Service()
export class AdminTranslationsApiAdapter implements AdminTranslationsPort {
  private readonly http = inject(HttpClient);

  getDictionaries(): Observable<Readonly<Record<SupportedLanguage, FlatDictionary>>> {
    const requests = SUPPORTED_LANGUAGES.map((lang) =>
      this.http.get(`/i18n/${lang}.json`).pipe(map((raw) => [lang, flattenDictionary(raw as never)] as const)),
    );
    return forkJoin(requests).pipe(
      map((entries) => {
        const result = {} as Record<SupportedLanguage, FlatDictionary>;
        for (const [lang, flat] of entries) {
          result[lang] = flat;
        }
        return result;
      }),
    );
  }

  updateValue(): Observable<void> {
    throw new Error(
      'No backend endpoint exists yet to persist a translation edit (see this adapter\'s doc comment) — only the mock adapter simulates saving, in memory.',
    );
  }
}
