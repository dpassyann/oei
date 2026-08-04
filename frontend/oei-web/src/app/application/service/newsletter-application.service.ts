import { Service, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { NEWSLETTER_SUBSCRIPTION_PORT } from '../../domain/port/newsletter-subscription.port';
import { NewsletterInterest } from '../../domain/model/newsletter-subscription';

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

  subscribe(
    email: string,
    lang: string,
    interests: readonly NewsletterInterest[],
    consent: boolean,
  ): Observable<NewsletterSubscriptionOutcome> {
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      return of({ success: false, reason: 'invalidEmail' });
    }
    // The consent checkbox is a hard requirement (GDPR): no subscription request is ever
    // sent to the backend without it, regardless of what a malicious client might submit.
    if (!consent) {
      return of({ success: false, reason: 'consentRequired' });
    }
    return this.port.subscribe({ email: trimmed, lang, interests, consent }).pipe(
      map(() => ({ success: true }) as const),
      catchError(() => of({ success: false, reason: 'submissionFailed' }) as Observable<NewsletterSubscriptionOutcome>),
    );
  }
}
