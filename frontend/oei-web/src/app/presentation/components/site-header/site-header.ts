import { Component, inject } from '@angular/core';
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
}
