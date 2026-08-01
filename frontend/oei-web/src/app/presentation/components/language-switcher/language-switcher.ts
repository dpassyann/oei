import { Component, inject } from '@angular/core';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../../domain/model/document';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-language-switcher',
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss',
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18nService);
  protected readonly languages = SUPPORTED_LANGUAGES;

  protected select(lang: SupportedLanguage): void {
    void this.i18n.setLang(lang);
  }
}
