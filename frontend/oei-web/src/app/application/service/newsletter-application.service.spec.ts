import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { NewsletterApplicationService } from './newsletter-application.service';
import { NEWSLETTER_SUBSCRIPTION_PORT, NewsletterSubscriptionPort } from '../../domain/port/newsletter-subscription.port';

describe('NewsletterApplicationService', () => {
  function createService(port: NewsletterSubscriptionPort): NewsletterApplicationService {
    TestBed.configureTestingModule({
      providers: [{ provide: NEWSLETTER_SUBSCRIPTION_PORT, useValue: port }],
    });
    return TestBed.inject(NewsletterApplicationService);
  }

  it('givenValidEmailAndConsent_whenSubscribe_thenCallsPortAndReturnsSuccess', async () => {
    const subscribe = vi.fn().mockReturnValue(of({ status: 'pendingConfirmation' as const }));
    const service = createService({ subscribe });

    const result = await firstValueFrom(service.subscribe('jane.doe@example.com', 'fr', ['ai'], true));

    expect(subscribe).toHaveBeenCalledWith({ email: 'jane.doe@example.com', lang: 'fr', interests: ['ai'], consent: true });
    expect(result).toEqual({ success: true });
  });

  it('givenMalformedEmail_whenSubscribe_thenRejectsWithoutCallingPort', async () => {
    const subscribe = vi.fn().mockReturnValue(of({ status: 'pendingConfirmation' as const }));
    const service = createService({ subscribe });

    const result = await firstValueFrom(service.subscribe('not-an-email', 'fr', [], true));

    expect(subscribe).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, reason: 'invalidEmail' });
  });

  it('givenMissingConsent_whenSubscribe_thenRejectsWithoutCallingPort', async () => {
    const subscribe = vi.fn().mockReturnValue(of({ status: 'pendingConfirmation' as const }));
    const service = createService({ subscribe });

    const result = await firstValueFrom(service.subscribe('jane.doe@example.com', 'fr', [], false));

    expect(subscribe).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, reason: 'consentRequired' });
  });

  it('givenPortRejects_whenSubscribe_thenReturnsSubmissionFailedOutcome', async () => {
    const subscribe = vi.fn().mockReturnValue(throwError(() => new Error('network down')));
    const service = createService({ subscribe });

    const result = await firstValueFrom(service.subscribe('jane.doe@example.com', 'fr', [], true));

    expect(result).toEqual({ success: false, reason: 'submissionFailed' });
  });
});
