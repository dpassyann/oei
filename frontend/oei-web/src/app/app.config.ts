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

// Espace membre individuel (bounded contexts: identity, membership, profile, cv,
// certification, badge, wallet — see docs/adr/0002-v2-foundations.md).
import { MEMBER_PORT } from './domain/port/identity/member.port';
import { MemberMockAdapter } from './infrastructure/adapter/member-mock.adapter';
import { MemberApiAdapter } from './infrastructure/adapter/member-api.adapter';
import { MEMBERSHIP_PORT } from './domain/port/membership/membership.port';
import { MembershipMockAdapter } from './infrastructure/adapter/membership-mock.adapter';
import { MembershipApiAdapter } from './infrastructure/adapter/membership-api.adapter';
import { PROFESSIONAL_PROFILE_PORT } from './domain/port/profile/professional-profile.port';
import { ProfessionalProfileMockAdapter } from './infrastructure/adapter/professional-profile-mock.adapter';
import { ProfessionalProfileApiAdapter } from './infrastructure/adapter/professional-profile-api.adapter';
import { PUBLIC_PROFILE_PORT } from './domain/port/profile/public-profile.port';
import { PublicProfileMockAdapter } from './infrastructure/adapter/public-profile-mock.adapter';
import { PublicProfileApiAdapter } from './infrastructure/adapter/public-profile-api.adapter';
import { CV_PORT } from './domain/port/cv/cv.port';
import { CvMockAdapter } from './infrastructure/adapter/cv-mock.adapter';
import { CvApiAdapter } from './infrastructure/adapter/cv-api.adapter';
import { CERTIFICATION_PORT } from './domain/port/certification/certification.port';
import { CertificationMockAdapter } from './infrastructure/adapter/certification-mock.adapter';
import { CertificationApiAdapter } from './infrastructure/adapter/certification-api.adapter';
import { BADGE_PORT } from './domain/port/badge/badge.port';
import { BadgeMockAdapter } from './infrastructure/adapter/badge-mock.adapter';
import { BadgeApiAdapter } from './infrastructure/adapter/badge-api.adapter';
import { WALLET_PORT } from './domain/port/wallet/wallet.port';
import { WalletMockAdapter } from './infrastructure/adapter/wallet-mock.adapter';
import { WalletApiAdapter } from './infrastructure/adapter/wallet-api.adapter';
import { DIGITAL_BUSINESS_CARD_PORT } from './domain/port/wallet/digital-business-card.port';
import { DigitalBusinessCardMockAdapter } from './infrastructure/adapter/digital-business-card-mock.adapter';
import { DigitalBusinessCardApiAdapter } from './infrastructure/adapter/digital-business-card-api.adapter';

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
    {
      provide: MEMBER_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(MemberMockAdapter) : inject(MemberApiAdapter)),
    },
    {
      provide: MEMBERSHIP_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(MembershipMockAdapter) : inject(MembershipApiAdapter)),
    },
    {
      provide: PROFESSIONAL_PROFILE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(ProfessionalProfileMockAdapter) : inject(ProfessionalProfileApiAdapter),
    },
    {
      provide: PUBLIC_PROFILE_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(PublicProfileMockAdapter) : inject(PublicProfileApiAdapter)),
    },
    {
      provide: CV_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(CvMockAdapter) : inject(CvApiAdapter)),
    },
    {
      provide: CERTIFICATION_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(CertificationMockAdapter) : inject(CertificationApiAdapter)),
    },
    {
      provide: BADGE_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(BadgeMockAdapter) : inject(BadgeApiAdapter)),
    },
    {
      provide: WALLET_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(WalletMockAdapter) : inject(WalletApiAdapter)),
    },
    {
      provide: DIGITAL_BUSINESS_CARD_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(DigitalBusinessCardMockAdapter) : inject(DigitalBusinessCardApiAdapter),
    },
  ],
};
