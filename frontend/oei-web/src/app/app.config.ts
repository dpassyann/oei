import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthConfig, OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import { bearerTokenInterceptor } from './infrastructure/auth/bearer-token.interceptor';
import { httpLoggingInterceptor } from './infrastructure/logging/http-logging.interceptor';

import { routes } from './app.routes';
import { RuntimeConfig } from './infrastructure/config/runtime-config';
import { CONTENT_REPOSITORY_PORT } from './domain/port/content-repository.port';
import { ContentMockAdapter } from './infrastructure/adapter/content-mock.adapter';
import { ContentApiAdapter } from './infrastructure/adapter/content-api.adapter';
import { LEAD_CAPTURE_PORT } from './domain/port/lead-capture.port';
import { LeadCaptureMockAdapter } from './infrastructure/adapter/lead-capture-mock.adapter';
import { LeadCaptureApiAdapter } from './infrastructure/adapter/lead-capture-api.adapter';
import { CONTACT_PORT } from './domain/port/contact.port';
import { ContactMockAdapter } from './infrastructure/adapter/contact-mock.adapter';
import { ContactApiAdapter } from './infrastructure/adapter/contact-api.adapter';
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
import { ADMIN_CONTENT_PORT } from './domain/port/cms/admin-content.port';
import { AdminContentMockAdapter } from './infrastructure/adapter/admin-content-mock.adapter';
import { AdminContentApiAdapter } from './infrastructure/adapter/admin-content-api.adapter';
import { PUBLIC_CONTENT_PORT } from './domain/port/cms/public-content.port';
import { PublicContentMockAdapter } from './infrastructure/adapter/public-content-mock.adapter';
import { PublicContentApiAdapter } from './infrastructure/adapter/public-content-api.adapter';
import { ARTICLE_SUBMISSION_PORT } from './domain/port/article/article-submission.port';
import { ArticleSubmissionMockAdapter } from './infrastructure/adapter/article-submission-mock.adapter';
import { ArticleSubmissionApiAdapter } from './infrastructure/adapter/article-submission-api.adapter';
import { ARTICLE_MODERATION_PORT } from './domain/port/article-moderation.port';
import { ArticleModerationMockAdapter } from './infrastructure/adapter/article-moderation-mock.adapter';
import { ArticleModerationApiAdapter } from './infrastructure/adapter/article-moderation-api.adapter';
import { CONTRIBUTION_PORT } from './domain/port/governance/contribution.port';
import { ContributionMockAdapter } from './infrastructure/adapter/contribution-mock.adapter';
import { ContributionApiAdapter } from './infrastructure/adapter/contribution-api.adapter';
import { GIT_SYNCHRONIZATION_PORT } from './domain/port/governance/git-synchronization.port';
import { GitSynchronizationMockAdapter } from './infrastructure/adapter/git-synchronization-mock.adapter';
import { GitSynchronizationApiAdapter } from './infrastructure/adapter/git-synchronization-api.adapter';

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
import { CERTIFICATION_GOAL_PORT } from './domain/port/certification/member-certification-goal.port';
import { MemberCertificationGoalMockAdapter } from './infrastructure/adapter/member-certification-goal-mock.adapter';
import { MemberCertificationGoalApiAdapter } from './infrastructure/adapter/member-certification-goal-api.adapter';
import { BADGE_PORT } from './domain/port/badge/badge.port';
import { BadgeMockAdapter } from './infrastructure/adapter/badge-mock.adapter';
import { BadgeApiAdapter } from './infrastructure/adapter/badge-api.adapter';
import { WALLET_PORT } from './domain/port/wallet/wallet.port';
import { WalletMockAdapter } from './infrastructure/adapter/wallet-mock.adapter';
import { WalletApiAdapter } from './infrastructure/adapter/wallet-api.adapter';
import { DIGITAL_BUSINESS_CARD_PORT } from './domain/port/wallet/digital-business-card.port';
import { DigitalBusinessCardMockAdapter } from './infrastructure/adapter/digital-business-card-mock.adapter';
import { DigitalBusinessCardApiAdapter } from './infrastructure/adapter/digital-business-card-api.adapter';
import { SALARY_BENCHMARK_PORT } from './domain/port/profile/salary-benchmark.port';
import { SalaryBenchmarkMockAdapter } from './infrastructure/adapter/salary-benchmark-mock.adapter';
import { SalaryBenchmarkApiAdapter } from './infrastructure/adapter/salary-benchmark-api.adapter';

// Adhésion & cotisation (free account creation + annual cotisation cycle — see
// domain/model/membership-fee/ and the home hero "Rejoignez le mouvement" button). Account
// creation itself is now handled by Keycloak's native registration screen (see
// `KeycloakAuthService.register()`) rather than the former `AccountRegistrationPort`/adapters,
// which have been removed along with the homemade `/inscription` page.
import { MEMBERSHIP_FEE_PORT } from './domain/port/membership-fee/membership-fee.port';
import { MembershipFeeMockAdapter } from './infrastructure/adapter/membership-fee-mock.adapter';
import { MembershipFeeApiAdapter } from './infrastructure/adapter/membership-fee-api.adapter';

// Livre Blanc page (`/livre-blanc`): reads `content/<lang>/200-WHITE-PAPERS/livre-blanc-complet.md`
// straight out of the static `assets/content/` bundle — there is no backend endpoint for it, so
// there is a single adapter (no mock/api split, see its own comment for why).
import { MARKDOWN_ASSET_PORT } from './domain/port/markdown-asset.port';
import { MarkdownAssetAdapter } from './infrastructure/adapter/markdown-asset.adapter';

// Events & community feed (docs `.prompt/plan/final/03-EVENTS-FEED-MODERATION-V2.md` and
// `04-EVENTS-COMMUNITY-FEED.md`) — 6 ports/adapters, all mock-only for now (no real backend yet,
// a future agent will redo the mock in a cleaner DDD shape per that task's brief).
import { EVENT_PORT } from './domain/port/event/event.port';
import { EventMockAdapter } from './infrastructure/adapter/event-mock.adapter';
import { EventApiAdapter } from './infrastructure/adapter/event-api.adapter';
import { EVENT_REGISTRATION_PORT } from './domain/port/event/event-registration.port';
import { EventRegistrationMockAdapter } from './infrastructure/adapter/event-registration-mock.adapter';
import { EventRegistrationApiAdapter } from './infrastructure/adapter/event-registration-api.adapter';
import { EVENT_FEED_PORT } from './domain/port/event/event-feed.port';
import { EventFeedMockAdapter } from './infrastructure/adapter/event-feed-mock.adapter';
import { EventFeedApiAdapter } from './infrastructure/adapter/event-feed-api.adapter';
import { EVENT_PROPOSAL_PORT } from './domain/port/event/event-proposal.port';
import { EventProposalMockAdapter } from './infrastructure/adapter/event-proposal-mock.adapter';
import { EventProposalApiAdapter } from './infrastructure/adapter/event-proposal-api.adapter';
import { EVENT_PHOTO_CONSENT_PORT } from './domain/port/event/event-photo-consent.port';
import { EventPhotoConsentMockAdapter } from './infrastructure/adapter/event-photo-consent-mock.adapter';
import { EventPhotoConsentApiAdapter } from './infrastructure/adapter/event-photo-consent-api.adapter';
import { EVENT_MODERATION_PORT } from './domain/port/event/event-moderation.port';
import { EventModerationMockAdapter } from './infrastructure/adapter/event-moderation-mock.adapter';
import { EventModerationApiAdapter } from './infrastructure/adapter/event-moderation-api.adapter';

// Global search (header search icon, see plan doc 02-DYNAMIC-NEWS-GLOBAL-SEARCH-RESOURCES):
// V1 scope is resources + news only.
import { SEARCH_PORT } from './domain/port/search.port';
import { SearchMockAdapter } from './infrastructure/adapter/search-mock.adapter';
import { SearchApiAdapter } from './infrastructure/adapter/search-api.adapter';

// Admin console (.prompt/plan/final/03-ADMIN-CONSOLE.md / 02-PARTNERS-AND-INSTITUTION-ADMIN.md) —
// 3 ports/adapters appended last so this never reorders any pre-existing provider.
import { ADMIN_DASHBOARD_PORT } from './domain/port/admin/admin-dashboard.port';
import { AdminDashboardMockAdapter } from './infrastructure/adapter/admin-dashboard-mock.adapter';
import { AdminDashboardApiAdapter } from './infrastructure/adapter/admin-dashboard-api.adapter';
import { ADMIN_AUDIT_LOG_PORT } from './domain/port/admin/admin-audit-log.port';
import { AdminAuditLogMockAdapter } from './infrastructure/adapter/admin-audit-log-mock.adapter';
import { AdminAuditLogApiAdapter } from './infrastructure/adapter/admin-audit-log-api.adapter';
import { ADMIN_INSTITUTIONS_PORT } from './domain/port/admin/admin-institutions.port';
import { AdminInstitutionsMockAdapter } from './infrastructure/adapter/admin-institutions-mock.adapter';
import { AdminInstitutionsApiAdapter } from './infrastructure/adapter/admin-institutions-api.adapter';
import { ADMIN_CERTIFICATION_CATALOG_PORT } from './domain/port/admin/admin-certification-catalog.port';
import { AdminCertificationCatalogMockAdapter } from './infrastructure/adapter/admin-certification-catalog-mock.adapter';
import { AdminCertificationCatalogApiAdapter } from './infrastructure/adapter/admin-certification-catalog-api.adapter';
import { ADMIN_MEMBERS_PORT } from './domain/port/admin/admin-members.port';
import { AdminMembersMockAdapter } from './infrastructure/adapter/admin-members-mock.adapter';
import { AdminMembersApiAdapter } from './infrastructure/adapter/admin-members-api.adapter';
import { ADMIN_MENUS_PORT } from './domain/port/admin/admin-menus.port';
import { AdminMenusMockAdapter } from './infrastructure/adapter/admin-menus-mock.adapter';
import { AdminMenusApiAdapter } from './infrastructure/adapter/admin-menus-api.adapter';
import { ADMIN_TRANSLATIONS_PORT } from './domain/port/admin/admin-translations.port';
import { AdminTranslationsMockAdapter } from './infrastructure/adapter/admin-translations-mock.adapter';
import { AdminTranslationsApiAdapter } from './infrastructure/adapter/admin-translations-api.adapter';
import { ADMIN_EMAIL_TEMPLATES_PORT } from './domain/port/admin/admin-email-templates.port';
import { AdminEmailTemplatesMockAdapter } from './infrastructure/adapter/admin-email-templates-mock.adapter';
import { AdminEmailTemplatesApiAdapter } from './infrastructure/adapter/admin-email-templates-api.adapter';
import { ADMIN_HOME_BLOCKS_PORT } from './domain/port/admin/admin-home-blocks.port';
import { AdminHomeBlocksMockAdapter } from './infrastructure/adapter/admin-home-blocks-mock.adapter';
import { AdminHomeBlocksApiAdapter } from './infrastructure/adapter/admin-home-blocks-api.adapter';

// Professional Neural Network canvas explorer (`/reseau-neuronal`) — progressive domain →
// topics/certifications → paginated experts loading, see `NetworkGraphPort`'s doc comment.
// Appended last, as instructed, to avoid conflicting with other work in progress on this file.
import { NETWORK_GRAPH_PORT } from './domain/port/network/network-graph.port';
import { NetworkGraphMockAdapter } from './infrastructure/adapter/network-graph-mock.adapter';
import { NetworkGraphApiAdapter } from './infrastructure/adapter/network-graph-api.adapter';

// Real Keycloak Authorization Code + PKCE config (realm `oei`, client `oei-frontend` — see
// `keycloak/realm-export/oei-realm.json`: publicClient, standardFlowEnabled,
// directAccessGrantsEnabled=false, pkce.code.challenge.method=S256, redirectUris
// `http://localhost:4300/*`). `requireHttps`/`strictDiscoveryDocumentValidation` are relaxed only
// because this targets a local, unencrypted Keycloak (`http://localhost:8081`) — both must be
// revisited before any non-local deployment.
const OEI_AUTH_CONFIG: AuthConfig = {
  issuer: 'http://localhost:8081/realms/oei',
  clientId: 'oei-frontend',
  redirectUri: window.location.origin + '/',
  responseType: 'code',
  scope: 'openid',
  requireHttps: false,
  strictDiscoveryDocumentValidation: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      // Enables direct deep-links (`/deontologie#principe-1`) to land already scrolled to that
      // section on first load — the smooth-scroll-on-click behaviour for in-page navigation
      // once already on the page is handled separately by `FloatingSideMenu`.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    // `httpLoggingInterceptor` (see `infrastructure/logging/`) stamps same-origin requests with
    // `X-Correlation-Id` and logs request/response/error as structured JSON — added last so it
    // does not change existing HTTP behavior, only observes it.
    provideHttpClient(withFetch(), withInterceptors([bearerTokenInterceptor, httpLoggingInterceptor])),
    provideOAuthClient(),
    provideAppInitializer(() => inject(RuntimeConfig).load()),
    // Blocking app initializer (runs, like the one above, before the router resolves its first
    // navigation): loads Keycloak's discovery document and, if the URL carries a `?code=...`
    // from a Keycloak redirect, exchanges it for real tokens (`loadDiscoveryDocumentAndTryLogin`
    // covers both). Route guards (`memberSpaceGuard`, `institutionAccessGuard`, `cmsGuard`) rely
    // on `KeycloakAuthService.isAuthenticated()`/`hasAnyRole()` already reflecting a real,
    // possibly-just-obtained token by the time they run — without this being an app initializer,
    // there would be a race: the guard could see "not authenticated" and redirect to login even
    // though the user just came back from a successful Keycloak login.
    provideAppInitializer(() => {
      const oauthService = inject(OAuthService);
      oauthService.configure(OEI_AUTH_CONFIG);
      return oauthService.loadDiscoveryDocumentAndTryLogin();
    }),
    {
      provide: CONTENT_REPOSITORY_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(ContentMockAdapter) : inject(ContentApiAdapter),
    },
    {
      provide: LEAD_CAPTURE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(LeadCaptureMockAdapter)
          : inject(LeadCaptureApiAdapter),
    },
    {
      provide: CONTACT_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(ContactMockAdapter) : inject(ContactApiAdapter),
    },
    {
      provide: STATS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(StatsMockAdapter) : inject(StatsApiAdapter),
    },
    {
      provide: DOMAINS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(DomainsMockAdapter) : inject(DomainsApiAdapter),
    },
    {
      provide: NEWS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(NewsMockAdapter) : inject(NewsApiAdapter),
    },
    {
      provide: PARTNER_REPOSITORY_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(PartnerMockAdapter) : inject(PartnerApiAdapter),
    },
    {
      provide: PUBLICATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(PublicationsMockAdapter)
          : inject(PublicationsApiAdapter),
    },
    {
      provide: NEWSLETTER_SUBSCRIPTION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(NewsletterSubscriptionMockAdapter)
          : inject(NewsletterSubscriptionApiAdapter),
    },
    {
      provide: INSTITUTION_ACCOUNT_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionAccountMockAdapter)
          : inject(InstitutionAccountApiAdapter),
    },
    {
      provide: INSTITUTION_ROLES_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionRolesMockAdapter)
          : inject(InstitutionRolesApiAdapter),
    },
    {
      provide: INSTITUTION_INVITATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionInvitationsMockAdapter)
          : inject(InstitutionInvitationsApiAdapter),
    },
    {
      provide: INSTITUTION_AFFILIATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionAffiliationsMockAdapter)
          : inject(InstitutionAffiliationsApiAdapter),
    },
    {
      provide: INSTITUTION_DASHBOARD_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionDashboardMockAdapter)
          : inject(InstitutionDashboardApiAdapter),
    },
    {
      provide: INSTITUTION_PUBLICATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionPublicationsMockAdapter)
          : inject(InstitutionPublicationsApiAdapter),
    },
    {
      provide: INSTITUTION_OPPORTUNITIES_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionOpportunitiesMockAdapter)
          : inject(InstitutionOpportunitiesApiAdapter),
    },
    {
      provide: INSTITUTION_BADGE_PROPOSALS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionBadgeProposalsMockAdapter)
          : inject(InstitutionBadgeProposalsApiAdapter),
    },
    {
      provide: INSTITUTION_AUDIT_LOG_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionAuditLogMockAdapter)
          : inject(InstitutionAuditLogApiAdapter),
    },
    {
      provide: INSTITUTION_PUBLIC_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(InstitutionPublicMockAdapter)
          : inject(InstitutionPublicApiAdapter),
    },
    {
      provide: ADMIN_CONTENT_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(AdminContentMockAdapter)
          : inject(AdminContentApiAdapter),
    },
    {
      provide: PUBLIC_CONTENT_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(PublicContentMockAdapter)
          : inject(PublicContentApiAdapter),
    },
    {
      provide: ARTICLE_MODERATION_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(ArticleModerationMockAdapter) : inject(ArticleModerationApiAdapter)),
    },
    {
      provide: CONTRIBUTION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(ContributionMockAdapter)
          : inject(ContributionApiAdapter),
    },
    {
      provide: GIT_SYNCHRONIZATION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(GitSynchronizationMockAdapter)
          : inject(GitSynchronizationApiAdapter),
    },
    {
      provide: MEMBER_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(MemberMockAdapter) : inject(MemberApiAdapter),
    },
    {
      provide: MEMBERSHIP_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(MembershipMockAdapter)
          : inject(MembershipApiAdapter),
    },
    {
      provide: PROFESSIONAL_PROFILE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(ProfessionalProfileMockAdapter)
          : inject(ProfessionalProfileApiAdapter),
    },
    {
      provide: PUBLIC_PROFILE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(PublicProfileMockAdapter)
          : inject(PublicProfileApiAdapter),
    },
    {
      provide: CV_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(CvMockAdapter) : inject(CvApiAdapter),
    },
    {
      provide: CERTIFICATION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(CertificationMockAdapter)
          : inject(CertificationApiAdapter),
    },
    {
      provide: BADGE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(BadgeMockAdapter) : inject(BadgeApiAdapter),
    },
    {
      provide: WALLET_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(WalletMockAdapter) : inject(WalletApiAdapter),
    },
    {
      provide: DIGITAL_BUSINESS_CARD_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(DigitalBusinessCardMockAdapter)
          : inject(DigitalBusinessCardApiAdapter),
    },
    {
      provide: MEMBERSHIP_FEE_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(MembershipFeeMockAdapter)
          : inject(MembershipFeeApiAdapter),
    },
    { provide: MARKDOWN_ASSET_PORT, useClass: MarkdownAssetAdapter },
    {
      provide: ARTICLE_SUBMISSION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(ArticleSubmissionMockAdapter)
          : inject(ArticleSubmissionApiAdapter),
    },
    {
      provide: EVENT_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(EventMockAdapter) : inject(EventApiAdapter)),
    },
    {
      provide: EVENT_REGISTRATION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(EventRegistrationMockAdapter)
          : inject(EventRegistrationApiAdapter),
    },
    {
      provide: EVENT_FEED_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(EventFeedMockAdapter) : inject(EventFeedApiAdapter),
    },
    {
      provide: EVENT_PROPOSAL_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(EventProposalMockAdapter) : inject(EventProposalApiAdapter),
    },
    {
      provide: EVENT_PHOTO_CONSENT_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(EventPhotoConsentMockAdapter)
          : inject(EventPhotoConsentApiAdapter),
    },
    {
      provide: EVENT_MODERATION_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(EventModerationMockAdapter)
          : inject(EventModerationApiAdapter),
    },
    {
      provide: SEARCH_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(SearchMockAdapter) : inject(SearchApiAdapter),
    },
    {
      provide: ADMIN_DASHBOARD_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(AdminDashboardMockAdapter) : inject(AdminDashboardApiAdapter)),
    },
    {
      provide: ADMIN_AUDIT_LOG_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(AdminAuditLogMockAdapter) : inject(AdminAuditLogApiAdapter)),
    },
    {
      provide: ADMIN_INSTITUTIONS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(AdminInstitutionsMockAdapter) : inject(AdminInstitutionsApiAdapter)),
    },
    {
      provide: ADMIN_MEMBERS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(AdminMembersMockAdapter) : inject(AdminMembersApiAdapter)),
    },
    {
      provide: ADMIN_MENUS_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(AdminMenusMockAdapter) : inject(AdminMenusApiAdapter)),
    },
    {
      provide: ADMIN_TRANSLATIONS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(AdminTranslationsMockAdapter) : inject(AdminTranslationsApiAdapter),
    },
    {
      provide: ADMIN_EMAIL_TEMPLATES_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(AdminEmailTemplatesMockAdapter) : inject(AdminEmailTemplatesApiAdapter),
    },
    {
      provide: ADMIN_HOME_BLOCKS_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock() ? inject(AdminHomeBlocksMockAdapter) : inject(AdminHomeBlocksApiAdapter),
    },
    {
      provide: ADMIN_CERTIFICATION_CATALOG_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(AdminCertificationCatalogMockAdapter)
          : inject(AdminCertificationCatalogApiAdapter),
    },
    {
      provide: CERTIFICATION_GOAL_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(MemberCertificationGoalMockAdapter)
          : inject(MemberCertificationGoalApiAdapter),
    },
    {
      provide: SALARY_BENCHMARK_PORT,
      useFactory: () =>
        inject(RuntimeConfig).isMock()
          ? inject(SalaryBenchmarkMockAdapter)
          : inject(SalaryBenchmarkApiAdapter),
    },
    {
      provide: NETWORK_GRAPH_PORT,
      useFactory: () => (inject(RuntimeConfig).isMock() ? inject(NetworkGraphMockAdapter) : inject(NetworkGraphApiAdapter)),
    },
  ],
};
