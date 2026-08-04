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

// Espace membre institutionnel (doc 03) — 10 ports/adapters mock+api, un par tag OpenAPI
// `institution-*`/`public-institutions` (voir openapi/oei-api.yaml).
import { INSTITUTION_ACCOUNT_PORT } from './domain/port/institution/institution-account.port';
import { InstitutionAccountMockAdapter } from './infrastructure/adapter/institution-account-mock.adapter';
import { InstitutionAccountApiAdapter } from './infrastructure/adapter/institution-account-api.adapter';
import { INSTITUTION_ROLES_PORT } from './domain/port/institution/institution-roles.port';
import { InstitutionRolesMockAdapter } from './infrastructure/adapter/institution-roles-mock.adapter';
import { InstitutionRolesApiAdapter } from './infrastructure/adapter/institution-roles-api.adapter';
import { INSTITUTION_INVITATIONS_PORT } from './domain/port/institution/institution-invitations.port';
import { InstitutionInvitationsMockAdapter } from './infrastructure/adapter/institution-invitations-mock.adapter';
import { InstitutionInvitationsApiAdapter } from './infrastructure/adapter/institution-invitations-api.adapter';
import { INSTITUTION_AFFILIATIONS_PORT } from './domain/port/institution/institution-affiliations.port';
import { InstitutionAffiliationsMockAdapter } from './infrastructure/adapter/institution-affiliations-mock.adapter';
import { InstitutionAffiliationsApiAdapter } from './infrastructure/adapter/institution-affiliations-api.adapter';
import { INSTITUTION_DASHBOARD_PORT } from './domain/port/institution/institution-dashboard.port';
import { InstitutionDashboardMockAdapter } from './infrastructure/adapter/institution-dashboard-mock.adapter';
import { InstitutionDashboardApiAdapter } from './infrastructure/adapter/institution-dashboard-api.adapter';
import { INSTITUTION_PUBLICATIONS_PORT } from './domain/port/institution/institution-publications.port';
import { InstitutionPublicationsMockAdapter } from './infrastructure/adapter/institution-publications-mock.adapter';
import { InstitutionPublicationsApiAdapter } from './infrastructure/adapter/institution-publications-api.adapter';
import { INSTITUTION_OPPORTUNITIES_PORT } from './domain/port/institution/institution-opportunities.port';
import { InstitutionOpportunitiesMockAdapter } from './infrastructure/adapter/institution-opportunities-mock.adapter';
import { InstitutionOpportunitiesApiAdapter } from './infrastructure/adapter/institution-opportunities-api.adapter';
import { INSTITUTION_BADGE_PROPOSALS_PORT } from './domain/port/institution/institution-badge-proposals.port';
import { InstitutionBadgeProposalsMockAdapter } from './infrastructure/adapter/institution-badge-proposals-mock.adapter';
import { InstitutionBadgeProposalsApiAdapter } from './infrastructure/adapter/institution-badge-proposals-api.adapter';
import { INSTITUTION_AUDIT_LOG_PORT } from './domain/port/institution/institution-audit-log.port';
import { InstitutionAuditLogMockAdapter } from './infrastructure/adapter/institution-audit-log-mock.adapter';
import { InstitutionAuditLogApiAdapter } from './infrastructure/adapter/institution-audit-log-api.adapter';
import { INSTITUTION_PUBLIC_PORT } from './domain/port/institution/institution-public.port';
import { InstitutionPublicMockAdapter } from './infrastructure/adapter/institution-public-mock.adapter';
import { InstitutionPublicApiAdapter } from './infrastructure/adapter/institution-public-api.adapter';

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
      provide: INSTITUTION_ACCOUNT_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(InstitutionAccountMockAdapter) : inject(InstitutionAccountApiAdapter)),
    },
    {
      provide: INSTITUTION_ROLES_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(InstitutionRolesMockAdapter) : inject(InstitutionRolesApiAdapter)),
    },
    {
      provide: INSTITUTION_INVITATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionInvitationsMockAdapter) : inject(InstitutionInvitationsApiAdapter),
    },
    {
      provide: INSTITUTION_AFFILIATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionAffiliationsMockAdapter) : inject(InstitutionAffiliationsApiAdapter),
    },
    {
      provide: INSTITUTION_DASHBOARD_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionDashboardMockAdapter) : inject(InstitutionDashboardApiAdapter),
    },
    {
      provide: INSTITUTION_PUBLICATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionPublicationsMockAdapter) : inject(InstitutionPublicationsApiAdapter),
    },
    {
      provide: INSTITUTION_OPPORTUNITIES_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionOpportunitiesMockAdapter) : inject(InstitutionOpportunitiesApiAdapter),
    },
    {
      provide: INSTITUTION_BADGE_PROPOSALS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionBadgeProposalsMockAdapter) : inject(InstitutionBadgeProposalsApiAdapter),
    },
    {
      provide: INSTITUTION_AUDIT_LOG_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(InstitutionAuditLogMockAdapter) : inject(InstitutionAuditLogApiAdapter),
    },
    {
      provide: INSTITUTION_PUBLIC_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(InstitutionPublicMockAdapter) : inject(InstitutionPublicApiAdapter)),
    },
  ],
};
