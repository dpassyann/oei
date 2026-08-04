import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { RuntimeConfig } from './infrastructure/config/runtime-config';
import { CONTENT_REPOSITORY_PORT } from './domain/port/content-repository.port';
import { ContentMockAdapter } from './infrastructure/adapter/content-mock.adapter';
import { ContentApiAdapter } from './infrastructure/adapter/content-api.adapter';
import { LEAD_CAPTURE_PORT } from './domain/port/lead-capture.port';
import { LeadCaptureMockAdapter } from './infrastructure/adapter/lead-capture-mock.adapter';
import { LeadCaptureApiAdapter } from './infrastructure/adapter/lead-capture-api.adapter';
import { STATS_PORT } from './domain/port/stats.port';
import { StatsMockAdapter } from './infrastructure/adapter/stats-mock.adapter';
import { StatsApiAdapter } from './infrastructure/adapter/stats-api.adapter';
import { DOMAINS_PORT } from './domain/port/domains.port';
import { DomainsMockAdapter } from './infrastructure/adapter/domains-mock.adapter';
import { DomainsApiAdapter } from './infrastructure/adapter/domains-api.adapter';
import { NEWS_PORT } from './domain/port/news.port';
import { NewsMockAdapter } from './infrastructure/adapter/news-mock.adapter';
import { NewsApiAdapter } from './infrastructure/adapter/news-api.adapter';
import { PARTNER_REPOSITORY_PORT } from './domain/port/partner-repository.port';
import { PartnerMockAdapter } from './infrastructure/adapter/partner-mock.adapter';
import { PartnerApiAdapter } from './infrastructure/adapter/partner-api.adapter';
import { PUBLICATIONS_PORT } from './domain/port/publications.port';
import { PublicationsMockAdapter } from './infrastructure/adapter/publications-mock.adapter';
import { PublicationsApiAdapter } from './infrastructure/adapter/publications-api.adapter';
import { NEWSLETTER_SUBSCRIPTION_PORT } from './domain/port/newsletter-subscription.port';
import { NewsletterSubscriptionMockAdapter } from './infrastructure/adapter/newsletter-subscription-mock.adapter';
import { NewsletterSubscriptionApiAdapter } from './infrastructure/adapter/newsletter-subscription-api.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => inject(RuntimeConfig).load()),
    {
      provide: CONTENT_REPOSITORY_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(ContentMockAdapter) : inject(ContentApiAdapter)),
    },
    {
      provide: LEAD_CAPTURE_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(LeadCaptureMockAdapter) : inject(LeadCaptureApiAdapter)),
    },
    {
      provide: STATS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(StatsMockAdapter) : inject(StatsApiAdapter)),
    },
    {
      provide: DOMAINS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(DomainsMockAdapter) : inject(DomainsApiAdapter)),
    },
    {
      provide: NEWS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(NewsMockAdapter) : inject(NewsApiAdapter)),
    },
    {
      provide: PARTNER_REPOSITORY_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(PartnerMockAdapter) : inject(PartnerApiAdapter)),
    },
    {
      provide: PUBLICATIONS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(PublicationsMockAdapter) : inject(PublicationsApiAdapter)),
    },
    {
      provide: NEWSLETTER_SUBSCRIPTION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(NewsletterSubscriptionMockAdapter) : inject(NewsletterSubscriptionApiAdapter),
    },
  ],
};
