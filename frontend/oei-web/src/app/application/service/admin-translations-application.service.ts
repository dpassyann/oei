import { Service, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ADMIN_TRANSLATIONS_PORT } from '../../domain/port/admin/admin-translations.port';
import { TranslationKeyStatus, TranslationStatus, TranslationTargetLanguage } from '../../domain/model/admin/admin-translation-key';
import { SupportedLanguage } from '../../domain/model/document';

const TARGET_LANGUAGES: readonly TranslationTargetLanguage[] = ['en', 'es', 'de', 'it', 'pt'];

/**
 * Computes, for every key present and non-empty in the FR dictionary, whether each other
 * language has a matching non-empty value (task brief §CMS "traductions": "pour chaque clé
 * présente et non-vide en fr.json, vérifie si elle est absente ou vide dans les 5 autres
 * langues"). This diffing is the "logique non triviale" the task brief asks to keep out of the
 * component — `AdminTranslations` only renders whatever this service computes.
 */
@Service()
export class AdminTranslationsApplicationService {
  private readonly port = inject(ADMIN_TRANSLATIONS_PORT);

  list(): Observable<TranslationKeyStatus[]> {
    return this.port.getDictionaries().pipe(map((dictionaries) => this.diff(dictionaries)));
  }

  /** Only the rows with at least one missing translation — the default filtered view. */
  missingOnly(rows: readonly TranslationKeyStatus[]): TranslationKeyStatus[] {
    return rows.filter((row) => Object.values(row.statusByLanguage).some((status) => status === 'missing'));
  }

  saveTranslation(lang: SupportedLanguage, key: string, value: string): Observable<void> {
    return this.port.updateValue(lang, key, value);
  }

  private diff(dictionaries: Readonly<Record<SupportedLanguage, Readonly<Record<string, string>>>>): TranslationKeyStatus[] {
    const frDictionary = dictionaries.fr ?? {};
    const rows: TranslationKeyStatus[] = [];
    for (const [key, frValue] of Object.entries(frDictionary)) {
      if (!frValue.trim()) {
        continue;
      }
      const statusByLanguage = {} as Record<TranslationTargetLanguage, TranslationStatus>;
      for (const lang of TARGET_LANGUAGES) {
        const value = dictionaries[lang]?.[key];
        statusByLanguage[lang] = value && value.trim() ? 'ok' : 'missing';
      }
      rows.push({ key, frValue, statusByLanguage });
    }
    return rows.sort((a, b) => a.key.localeCompare(b.key));
  }
}
