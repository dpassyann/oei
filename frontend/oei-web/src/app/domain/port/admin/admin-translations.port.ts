import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SupportedLanguage } from '../../model/document';

// Flattened dotted-key -> value dictionary for one language, e.g. `{ 'nav.home': 'Accueil' }` —
// same shape `I18nService`'s cache holds, just flattened (see
// `AdminTranslationsApplicationService.flatten`).
export type FlatDictionary = Readonly<Record<string, string>>;

/**
 * Read (and mock-only write) access to the 6 `public/i18n/*.json` dictionaries for the admin
 * "traductions" section (task brief §CMS "traductions"). `getDictionaries` fetches the same
 * public assets `I18nService.setLang` already loads (`/i18n/{lang}.json`), via `HttpClient`
 * rather than a static import, so the 6 (large) JSON files never end up bundled into the admin
 * chunk's JS. `updateValue` never writes back to those files from the browser — see
 * `AdminTranslationsMockAdapter`'s doc comment for why this is mock-only by design.
 */
export interface AdminTranslationsPort {
  getDictionaries(): Observable<Readonly<Record<SupportedLanguage, FlatDictionary>>>;
  updateValue(lang: SupportedLanguage, key: string, value: string): Observable<void>;
}

export const ADMIN_TRANSLATIONS_PORT = new InjectionToken<AdminTranslationsPort>('AdminTranslationsPort');
