import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsletterSubscriptionPort } from '../../domain/port/newsletter-subscription.port';
import { NewsletterSubscriptionRequest, NewsletterSubscriptionResult } from '../../domain/model/newsletter-subscription';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) is used
// here (not `fetch()`/Promise).
@Service()
export class NewsletterSubscriptionApiAdapter implements NewsletterSubscriptionPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  subscribe(request: NewsletterSubscriptionRequest): Observable<NewsletterSubscriptionResult> {
    return this.http.post<NewsletterSubscriptionResult>(`${this.runtimeConfig.apiBaseUrl()}/newsletter/subscriptions`, request);
  }
}
