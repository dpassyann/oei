import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { NewsletterApplicationService } from '../../../application/service/newsletter-application.service';

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

type NewsletterFormStatus = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'oei-site-footer',
  imports: [RouterLink, FormsModule],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly i18n = inject(I18nService);
  private readonly newsletter = inject(NewsletterApplicationService);
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

  // Doc 01, section 10 ("Newsletter") requires email + language + interests + consent +
  // double opt-in + unsubscribe + a GDPR log — the language and the double-opt-in/log parts
  // are handled server-side (see `NewsletterSubscriptionMockAdapter`). Interests are kept in
  // the domain/port for later, but deliberately not exposed in this V1 form (kept simple:
  // email + consent only) — always submitted as an empty list until a V2 UI adds them back.
  protected readonly email = signal('');
  protected readonly consent = signal(false);
  protected readonly formStatus = signal<NewsletterFormStatus>('idle');
  protected readonly formErrorReason = signal<'invalidEmail' | 'consentRequired' | 'submissionFailed' | null>(null);

  protected submitNewsletter(): void {
    this.formStatus.set('submitting');
    this.newsletter.subscribe(this.email(), this.i18n.currentLang(), [], this.consent()).subscribe((outcome) => {
      if (outcome.success) {
        this.formStatus.set('success');
        this.formErrorReason.set(null);
      } else {
        this.formStatus.set('error');
        this.formErrorReason.set(outcome.reason);
      }
    });
  }
}
