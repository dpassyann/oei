import { Component, inject, PendingTasks, signal } from '@angular/core';
import { ContentApplicationService } from '../../../application/service/content-application.service';
import { I18nService } from '../../../infrastructure/adapter/i18n.service';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';

@Component({
  selector: 'oei-home',
  imports: [LanguageSwitcher],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly content = inject(ContentApplicationService);
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly i18n = inject(I18nService);

  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly isFallback = signal(false);

  constructor() {
    // Registered as a pending task so zoneless change detection (and
    // `ComponentFixture.whenStable()` in tests) actually waits for these
    // fetch-backed loads to settle instead of considering the app stable
    // before the signals/i18n dictionary are populated.
    void this.pendingTasks.run(() => Promise.all([this.loadContent(), this.loadInterfaceStrings()]));
  }

  private async loadContent(): Promise<void> {
    const dto = await this.content.getHomeContent(this.i18n.currentLang());
    this.title.set(dto.title);
    this.body.set(dto.body);
    this.isFallback.set(dto.isFallback);
  }

  private async loadInterfaceStrings(): Promise<void> {
    // Ensures the header/nav labels for the current (default) language are
    // fetched once on load — `I18nService.setLang` is otherwise only invoked
    // when the user picks a language from the switcher.
    try {
      await this.i18n.setLang(this.i18n.currentLang());
    } catch {
      // No i18n server / offline / test environment without `fetch` base URL:
      // interface labels fall back to their raw translation keys (see `I18nService.translate`).
    }
  }
}
