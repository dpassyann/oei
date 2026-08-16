import { FlatDictionary } from '../../domain/port/admin/admin-translations.port';

// Same nested-dict shape `I18nService` loads from `/i18n/{lang}.json` (see
// `presentation/i18n/i18n.service.ts`). Shared by `AdminTranslationsMockAdapter` and
// `AdminTranslationsApiAdapter` — both fetch the raw JSON the same way, only their write path
// (`updateValue`) differs.
type NestedDictionary = { readonly [key: string]: string | readonly string[] | NestedDictionary };

/** Flattens a nested i18n dictionary into `{ 'nav.home': 'Accueil', ... }` dotted-path pairs.
 * String-array leaves (`translateList` targets) are skipped: this admin screen only tracks
 * scalar translation strings. */
export function flattenDictionary(dict: NestedDictionary, prefix = ''): FlatDictionary {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[path] = value;
    } else if (!Array.isArray(value) && typeof value === 'object' && value !== null) {
      Object.assign(result, flattenDictionary(value as NestedDictionary, path));
    }
  }
  return result;
}
