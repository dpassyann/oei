import { Component, effect, inject, PendingTasks, signal } from '@angular/core';
import { ContentApplicationService } from '../../../application/service/content-application.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-home',
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
    void this.pendingTasks.run(() => this.loadInterfaceStrings());

    // Re-loads the hero content whenever the current language changes: this effect
    // runs once immediately on creation (initial load) and again every time
    // `i18n.currentLang()` changes (e.g. via the language switcher), keeping the
    // hero title/body in sync with the selected language.
    effect(() => {
      const lang = this.i18n.currentLang();
      void this.pendingTasks.run(() => this.loadContent(lang));
    });
  }

  private async loadContent(lang: string): Promise<void> {
    const dto = await this.content.getHomeContent(lang);
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
