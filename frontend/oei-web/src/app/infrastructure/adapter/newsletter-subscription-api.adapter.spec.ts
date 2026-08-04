import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { NewsletterSubscriptionApiAdapter } from './newsletter-subscription-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('NewsletterSubscriptionApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: NewsletterSubscriptionApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        NewsletterSubscriptionApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(NewsletterSubscriptionApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenRequest_whenSubscribe_thenPostsToNewsletterSubscriptionsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');
    const request = { email: 'jane.doe@example.com', lang: 'fr', interests: ['ai' as const], consent: true };

    const result = firstValueFrom(adapter.subscribe(request));
    const req = httpMock.expectOne('/api/v1/newsletter/subscriptions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ status: 'pendingConfirmation' });

    expect(await result).toEqual({ status: 'pendingConfirmation' });
    httpMock.verify();
  });
});
