import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsletterSubscriptionRequest, NewsletterSubscriptionResult } from '../model/newsletter-subscription';

export interface NewsletterSubscriptionPort {
  subscribe(request: NewsletterSubscriptionRequest): Observable<NewsletterSubscriptionResult>;
}

export const NEWSLETTER_SUBSCRIPTION_PORT = new InjectionToken<NewsletterSubscriptionPort>('NewsletterSubscriptionPort');
