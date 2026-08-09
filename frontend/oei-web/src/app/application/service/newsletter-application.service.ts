import { Service, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { NEWSLETTER_SUBSCRIPTION_PORT } from '../../domain/port/newsletter-subscription.port';
import { NewsletterInterest } from '../../domain/model/newsletter-subscription';
import { LoggingService } from '../../infrastructure/logging/logging.service';

// Deliberately simple (not RFC 5322-exhaustive), same pattern as `LeadCaptureApplicationService`.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NewsletterSubscriptionOutcome =
  | { readonly success: true }
  | { readonly success: false; readonly reason: 'invalidEmail' | 'consentRequired' | 'submissionFailed' };

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `LeadCaptureApplicationService`.
//
// Returns an `Observable` (not a `Promise`) — see `src/app/infrastructure/adapter/README.md`
// for the RxJS-end-to-end architecture this service is part of.
@Service()
export class NewsletterApplicationService {
  private readonly port = inject(NEWSLETTER_SUBSCRIPTION_PORT);
  private readonly logger = inject(LoggingService);

  subscribe(
    email: string,
    lang: string,
    interests: readonly NewsletterInterest[],
    consent: boolean,
  ): Observable<NewsletterSubscriptionOutcome> {
    const trimmed = email.trim();
    // Deliberately not logging the email address (PII) — only the submission's outcome and,
    // on rejection, the non-PII `reason` (invalid format / missing consent / backend failure).
    if (!EMAIL_PATTERN.test(trimmed)) {
      this.logger.warn(
        'Newsletter subscription rejected: invalid email format',
        { reason: 'invalidEmail' },
        'NewsletterApplicationService',
      );
      return of({ success: false, reason: 'invalidEmail' });
    }
    // The consent checkbox is a hard requirement (GDPR): no subscription request is ever
    // sent to the backend without it, regardless of what a malicious client might submit.
    if (!consent) {
      this.logger.warn(
        'Newsletter subscription rejected: consent not given',
        { reason: 'consentRequired' },
        'NewsletterApplicationService',
      );
      return of({ success: false, reason: 'consentRequired' });
    }
    this.logger.info('Newsletter subscription started', { lang, interests }, 'NewsletterApplicationService');
    return this.port.subscribe({ email: trimmed, lang, interests, consent }).pipe(
      map(() => {
        this.logger.info('Newsletter subscription succeeded', { lang, interests }, 'NewsletterApplicationService');
        return { success: true } as const;
      }),
      catchError((error: unknown) => {
        this.logger.error(
          'Newsletter subscription failed',
          { reason: 'submissionFailed', error: error instanceof Error ? error.message : String(error) },
          'NewsletterApplicationService',
        );
        return of({ success: false, reason: 'submissionFailed' }) as Observable<NewsletterSubscriptionOutcome>;
      }),
    );
  }
}
