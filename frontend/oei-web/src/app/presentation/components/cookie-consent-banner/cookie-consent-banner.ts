import { Component, computed, inject } from '@angular/core';
import { CookieConsentService } from '../../../infrastructure/privacy/cookie-consent.service';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'oei-cookie-consent-banner',
  templateUrl: './cookie-consent-banner.html',
  styleUrl: './cookie-consent-banner.scss',
})
export class CookieConsentBanner {
  private readonly i18n = inject(I18nService);
  protected readonly consent = inject(CookieConsentService);

  protected readonly copy = computed(() => {
    return {
      title: this.i18n.translate('cookieConsent.title'),
      description: this.i18n.translate('cookieConsent.description'),
      acceptLabel: this.i18n.translate('cookieConsent.acceptLabel'),
      rejectLabel: this.i18n.translate('cookieConsent.rejectLabel'),
      ariaLabel: this.i18n.translate('cookieConsent.ariaLabel'),
    };
  });
}


