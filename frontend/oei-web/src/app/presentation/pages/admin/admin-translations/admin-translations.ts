import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { AdminTranslationsApplicationService } from '../../../../application/service/admin-translations-application.service';
import { TranslationKeyStatus, TranslationTargetLanguage } from '../../../../domain/model/admin/admin-translation-key';
import { I18nService } from '../../../i18n/i18n.service';

const TARGET_LANGUAGES: readonly TranslationTargetLanguage[] = ['en', 'es', 'de', 'it', 'pt'];

/**
 * Admin "traductions" section (task brief §CMS "traductions"): lists every FR i18n key missing
 * or empty in at least one other language, with an OK/missing badge per language. Editing a row
 * opens a small mock form — `AdminTranslationsApplicationService.saveTranslation` only updates an
 * in-memory overlay (see `AdminTranslationsMockAdapter`'s doc comment): this screen never rewrites
 * `public/i18n/*.json` from the browser.
 */
@Component({
  selector: 'oei-admin-translations',
  imports: [FormsModule],
  templateUrl: './admin-translations.html',
  styleUrl: './admin-translations.scss',
})
export class AdminTranslations {
  private readonly translationsService = inject(AdminTranslationsApplicationService);
  protected readonly i18n = inject(I18nService);
  protected readonly targetLanguages = TARGET_LANGUAGES;

  private readonly rowsResource = rxResource({
    params: () => true,
    stream: () => this.translationsService.list(),
  });

  protected readonly allRows = computed(() => this.rowsResource.value() ?? []);
  protected readonly missingRows = computed(() => this.translationsService.missingOnly(this.allRows()));

  protected readonly editingRow = signal<TranslationKeyStatus | null>(null);
  protected readonly editingLang = signal<TranslationTargetLanguage>('en');
  protected readonly editingValue = signal('');
  protected readonly saved = signal(false);

  protected openEditor(row: TranslationKeyStatus, lang: TranslationTargetLanguage): void {
    this.editingRow.set(row);
    this.editingLang.set(lang);
    this.editingValue.set('');
    this.saved.set(false);
  }

  protected cancelEditor(): void {
    this.editingRow.set(null);
  }

  protected save(): void {
    const row = this.editingRow();
    if (!row) {
      return;
    }
    this.translationsService.saveTranslation(this.editingLang(), row.key, this.editingValue()).subscribe(() => {
      this.saved.set(true);
      this.rowsResource.reload();
    });
  }
}
