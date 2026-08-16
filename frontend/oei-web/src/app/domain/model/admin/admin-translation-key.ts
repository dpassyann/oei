import { SupportedLanguage } from '../document';

// Every non-French language this admin screen tracks — `fr` itself is always the reference
// column, never a "status" column (task brief §CMS "traductions").
export type TranslationTargetLanguage = Exclude<SupportedLanguage, 'fr'>;

export type TranslationStatus = 'ok' | 'missing';

/** One dotted i18n key (e.g. `nav.home`), its FR reference value, and whether each other
 * language has a non-empty translation for it. Built by `AdminTranslationsApplicationService`
 * from the raw flattened dictionaries the port returns — never constructed directly by a
 * component. */
export interface TranslationKeyStatus {
  readonly key: string;
  readonly frValue: string;
  readonly statusByLanguage: Readonly<Record<TranslationTargetLanguage, TranslationStatus>>;
}
