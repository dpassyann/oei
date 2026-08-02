import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';

interface SocialLink {
  // Proper-noun brand names (LinkedIn, X, YouTube, Medium) are not translated —
  // they're identifiers, not localizable copy.
  readonly name: string;
  readonly href: string;
}

interface LegalLink {
  readonly labelKey: string;
  readonly path: string;
}

@Component({
  selector: 'oei-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);
  protected readonly currentYear = new Date().getFullYear();

  // Partner logos moved to the home page's dynamic "Ils nous soutiennent" section
  // (real Partner entities via PartnerApplicationService) — this static list was
  // a duplicate of that same concept and has been removed.

  protected readonly socialLinks: readonly SocialLink[] = [
    { name: 'LinkedIn', href: '#' },
    { name: 'X', href: '#' },
    { name: 'YouTube', href: '#' },
    { name: 'Medium', href: '#' },
  ];

  protected readonly legalLinks: readonly LegalLink[] = [
    { labelKey: 'nav.legalNotices', path: '/mentions-legales' },
    { labelKey: 'nav.sitemap', path: '/plan-du-site' },
  ];
}
