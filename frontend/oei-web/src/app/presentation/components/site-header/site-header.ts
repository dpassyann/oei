import { Component, inject, PendingTasks } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

interface NavLink {
  readonly path: string;
  readonly labelKey: string;
}

@Component({
  selector: 'oei-site-header',
  imports: [RouterLink, RouterLinkActive, LanguageSwitcher],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly i18n = inject(I18nService);
  private readonly pendingTasks = inject(PendingTasks);

  protected readonly navLinks: readonly NavLink[] = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/a-propos', labelKey: 'nav.about' },
    { path: '/nos-missions', labelKey: 'nav.missions' },
    { path: '/deontologie', labelKey: 'nav.ethics' },
    { path: '/certifications', labelKey: 'nav.certifications' },
    { path: '/ressources', labelKey: 'nav.resources' },
    { path: '/actualites', labelKey: 'nav.news' },
    { path: '/contact', labelKey: 'nav.contact' },
  ];

  constructor() {
    // The header/footer render on every route (outside <router-outlet>), so
    // this is the one place guaranteed to run once per app load regardless
    // of which page is opened first — priming the interface strings here
    // (rather than only in the Home page) ensures nav/footer labels never
    // show raw translation keys when a user lands directly on any route.
    void this.pendingTasks.run(async () => {
      try {
        await this.i18n.setLang(this.i18n.currentLang());
      } catch {
        // No i18n server / offline: labels fall back to their raw translation keys.
      }
    });
  }
}
