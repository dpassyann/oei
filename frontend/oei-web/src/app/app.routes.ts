import { Routes } from '@angular/router';
import { Home } from './presentation/pages/home/home';
import { APropos } from './presentation/pages/a-propos/a-propos';
import { NosMissions } from './presentation/pages/nos-missions/nos-missions';
import { Deontologie } from './presentation/pages/deontologie/deontologie';
import { Certifications } from './presentation/pages/certifications/certifications';
import { Ressources } from './presentation/pages/ressources/ressources';
import { Actualites } from './presentation/pages/actualites/actualites';
import { Contact } from './presentation/pages/contact/contact';
import { MentionsLegales } from './presentation/pages/mentions-legales/mentions-legales';
import { PlanDuSite } from './presentation/pages/plan-du-site/plan-du-site';
import { MembresFondateurs } from './presentation/pages/membres-fondateurs/membres-fondateurs';
import { Adhesion } from './presentation/pages/adhesion/adhesion';
import { Publications } from './presentation/pages/publications/publications';
import { Partenaires } from './presentation/pages/partenaires/partenaires';
import { PartenaireDetail } from './presentation/pages/partenaire-detail/partenaire-detail';
import { DomaineDetail } from './presentation/pages/domaine-detail/domaine-detail';
import { LivreBlanc } from './presentation/pages/livre-blanc/livre-blanc';
import { institutionAccessGuard } from './presentation/auth/institution-access.guard';
import { InstitutionDashboard } from './presentation/pages/espace-institution/dashboard/dashboard';
import { InstitutionMembers } from './presentation/pages/espace-institution/membres/membres';
import { InstitutionPublicationsPage } from './presentation/pages/espace-institution/publications/publications';
import { InstitutionOpportunitiesPage } from './presentation/pages/espace-institution/opportunites/opportunites';
import { EspaceInstitutionLayout } from './presentation/pages/espace-institution/espace-institution-layout/espace-institution-layout';
import { InstitutionPublique } from './presentation/pages/institution-publique/institution-publique';
import { CmsContentList } from './presentation/pages/cms/cms-content-list/cms-content-list';
import { CmsContentEditor } from './presentation/pages/cms/cms-content-editor/cms-content-editor';
import { CmsContributions } from './presentation/pages/cms/cms-contributions/cms-contributions';
import { CmsModeration } from './presentation/pages/cms/cms-moderation/cms-moderation';
import { CmsLayout } from './presentation/pages/cms/cms-layout/cms-layout';
import { cmsGuard } from './presentation/auth/cms.guard';
import { memberSpaceGuard } from './presentation/auth/member-space.guard';
import { bootstrapGuard } from './presentation/auth/bootstrap.guard';
import { Onboarding } from './presentation/pages/espace-membre/onboarding/onboarding';
import { SmartOnboarding } from './presentation/pages/espace-membre/smart-onboarding/smart-onboarding';
import { LinkedinCallback } from './presentation/pages/espace-membre/smart-onboarding/linkedin-callback';
import { EspaceMembreLayout } from './presentation/pages/espace-membre/espace-membre-layout/espace-membre-layout';
import { Profil } from './presentation/pages/espace-membre/profil/profil';
import { CvBuilder } from './presentation/pages/espace-membre/cv-builder/cv-builder';
import { Badges } from './presentation/pages/espace-membre/badges/badges';
import { CarteNumerique } from './presentation/pages/espace-membre/carte/carte-numerique';
import { ProfilPublic } from './presentation/pages/espace-membre/profil-public/profil-public';
import { PublierArticle } from './presentation/pages/espace-membre/publier-article/publier-article';
import { ProposerEvenement } from './presentation/pages/espace-membre/proposer-evenement/proposer-evenement';
import { EventsList } from './presentation/pages/events/events-list/events-list';
import { EventDetail } from './presentation/pages/events/event-detail/event-detail';
import { CmsEventsModeration } from './presentation/pages/cms/cms-events-moderation/cms-events-moderation';
import { adminGuard } from './presentation/auth/admin.guard';
import { AdminLayout } from './presentation/pages/admin/admin-layout/admin-layout';
import { AdminDashboard } from './presentation/pages/admin/admin-dashboard/admin-dashboard';
import { AdminInstitutionsList } from './presentation/pages/admin/admin-institutions-list/admin-institutions-list';
import { AdminMembers } from './presentation/pages/admin/admin-members/admin-members';
import { AdminInstitutionNew } from './presentation/pages/admin/admin-institution-new/admin-institution-new';
import { AdminInstitutionDetail } from './presentation/pages/admin/admin-institution-detail/admin-institution-detail';
import { AdminAuditLogPage } from './presentation/pages/admin/admin-audit-log/admin-audit-log';
import { AdminCertificationsCatalogList } from './presentation/pages/admin/admin-certifications-catalog-list/admin-certifications-catalog-list';
import { AdminCertificationCatalogForm } from './presentation/pages/admin/admin-certification-catalog-form/admin-certification-catalog-form';
import { CartePublique } from './presentation/pages/carte-publique/carte-publique';
import { VerificationMembre } from './presentation/pages/verification-membre/verification-membre';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'a-propos', component: APropos },
  { path: 'nos-missions', component: NosMissions },
  { path: 'deontologie', component: Deontologie },
  { path: 'certifications', component: Certifications },
  { path: 'ressources', component: Ressources },
  { path: 'livre-blanc', component: LivreBlanc },
  { path: 'actualites', component: Actualites },
  { path: 'publications', component: Publications },
  { path: 'partenaires', component: Partenaires },
  { path: 'partenaires/:id', component: PartenaireDetail },
  { path: 'domaines/:slug', component: DomaineDetail },
  { path: 'contact', component: Contact },
  { path: 'membres-fondateurs', component: MembresFondateurs },
  // Public plan-selection page reached from `/membres-fondateurs`'s CTA (see `Adhesion`'s doc
  // comment) — comparing the 4 `MembershipFeeTier` values with a payment-method modal, then
  // forwarding to the placeholder checkout step below.
  { path: 'adhesion', component: Adhesion },
  // Lazy-loaded like `espace-membre/cotisation` below: a placeholder checkout step, only ever
  // needed once a visitor has actually picked a plan and payment method on `/adhesion`.
  {
    path: 'adhesion/finaliser',
    loadComponent: () =>
      import('./presentation/pages/adhesion/checkout/adhesion-checkout').then((m) => m.AdhesionCheckout),
  },
  // NOTE: there used to be a homemade `/inscription` public account-creation page here. It has
  // been removed in favor of redirecting straight to Keycloak's native registration screen
  // (see `KeycloakAuthService.register()` and `home.ts`'s `onJoinClick`) — the custom OEI login
  // theme (`keycloak/themes/oei/login/`) now carries the business fields (country, consent).
  // Distinct from `/espace-membre/inscription` (`Onboarding`), the detailed professional-profile
  // wizard for already-authenticated members, which is unaffected by this change.
  { path: 'mentions-legales', component: MentionsLegales },
  { path: 'plan-du-site', component: PlanDuSite },
  // Espace membre institutionnel (doc 03) — route racine protégée par un garde simple basé sur
  // KeycloakAuthService (voir `institution-access.guard.ts`). La page publique institutionnelle
  // (`/institutions/:slug`) reste, elle, accessible sans authentification (doc 03 §"Page publique").
  {
    path: 'espace-institution',
    canActivate: [institutionAccessGuard],
    // `EspaceInstitutionLayout` porte le menu latéral persistant (Tableau de bord / Membres /
    // Publications / Opportunités) + le `<router-outlet>` des sous-pages — avant son introduction,
    // la seule navigation entre sous-pages passait par le lien du header vers la racine.
    component: EspaceInstitutionLayout,
    children: [
      { path: '', component: InstitutionDashboard },
      { path: 'membres', component: InstitutionMembers },
      { path: 'publications', component: InstitutionPublicationsPage },
      { path: 'opportunites', component: InstitutionOpportunitiesPage },
    ],
  },
  { path: 'institutions/:slug', component: InstitutionPublique },
  {
    path: 'cms',
    canActivate: [cmsGuard],
    // Wrapped in `CmsLayout` (sidebar nav + `<router-outlet>`) so `/cms/**` finally shares a
    // consistent back-office shell across its pages, the same pattern as `AdminLayout`/
    // `EspaceMembreLayout` below — see that component's doc comment.
    children: [
      {
        path: '',
        component: CmsLayout,
        children: [
          { path: '', component: CmsContentList },
          { path: 'contributions', component: CmsContributions },
          { path: 'moderation', component: CmsModeration },
          // Events proposal moderation queue (docs "03-EVENTS-FEED-MODERATION-V2.md") — same
          // `cmsGuard`, sibling of `/cms/moderation` (articles). Kept before `:id` so it is never
          // swallowed by the editor's catch-all id route.
          { path: 'events-moderation', component: CmsEventsModeration },
          { path: ':id', component: CmsContentEditor },
        ],
      },
    ],
  },
  // Espace membre individuel (docs/adr/0002-v2-foundations.md, .prompt/plan/02-...):
  // guarded by `memberSpaceGuard` (real Keycloak session, see KeycloakAuthService). The
  // public-profile page is intentionally NOT under this guard — it's public by design.
  {
    path: 'espace-membre',
    canActivate: [memberSpaceGuard],
    children: [
      // `inscription` (the onboarding wizard) stays a sibling of the `EspaceMembreLayout`
      // shell below, not a child of it — it's a full-screen, one-time step flow.
      { path: 'inscription', component: Onboarding },
      // `smart-onboarding` — new import-first onboarding flow (spec §4-13).
      // Shown when profileStatus = ONBOARDING_REQUIRED (see MemberBootstrapApplicationService).
      // Kept as a direct child route; the smart-onboarding component itself handles
      // navigation back to /espace-membre/profil on completion.
      { path: 'smart-onboarding', component: SmartOnboarding },
      { path: 'smart-onboarding/linkedin/callback', component: LinkedinCallback },
      {
        path: '',
        component: EspaceMembreLayout,
        canActivate: [bootstrapGuard],
        children: [
          { path: '', redirectTo: 'profil', pathMatch: 'full' },
          { path: 'profil', component: Profil },
          { path: 'cv', component: CvBuilder },
          { path: 'badges', component: Badges },
          { path: 'carte', component: CarteNumerique },
          // Mocked cotisation payment page (adhésion & cotisation plan) — see `home.ts`'s
          // `onJoinClick` and the account-creation flow's (now Keycloak-native) "Payer
          // maintenant" choice. Lazy-loaded (`loadComponent`): its Stripe-Checkout-style
          // two-column layout/card-brand logic is sizeable and only ever needed by a member
          // actively paying a cotisation, so keeping it out of the eager initial bundle is
          // what keeps the production budget (`angular.json`) met.
          {
            path: 'cotisation',
            loadComponent: () => import('./presentation/pages/espace-membre/cotisation/cotisation').then((m) => m.Cotisation),
          },
          // Member-facing article submission form — feeds the CMS moderation queue built
          // separately; approved submissions are the only ones that ever reach `/actualites`.
          { path: 'publier', component: PublierArticle },
          // Member-facing event proposal form (docs "03-EVENTS-FEED-MODERATION-V2.md") — feeds
          // the `/cms/events-moderation` queue; approved proposals are the only ones that ever
          // reach the public `/events` agenda.
          { path: 'proposer-evenement', component: ProposerEvenement },
        ],
      },
    ],
  },
  { path: 'membres/:publicSlug', component: ProfilPublic },
  // Public events agenda (docs "04-EVENTS-COMMUNITY-FEED.md"/"03-EVENTS-FEED-MODERATION-V2.md")
  // — appended at the end so as not to reorder any pre-existing route.
  { path: 'events', component: EventsList },
  { path: 'events/:slug', component: EventDetail },
  // Admin console (task: .prompt/plan/final/03-ADMIN-CONSOLE.md), appended last so this never
  // reorders any pre-existing route. Guarded by `adminGuard` (any of the 8 admin realm roles —
  // see `domain/model/admin/admin-role.ts`); `AdminLayout` further filters its sidebar nav per
  // role via `visibleSections()` — `adminGuard` on the shell is sufficient section-level
  // enforcement for these 4 pages too, so none of them add their own `canActivate`.
  //
  // `menus`/`traductions`/`templates-email`/`blocs-home` used to all share a single
  // `AdminComingSoon` placeholder component; they're now real (mock-first) features, each
  // `loadComponent`-lazy so their code stays out of the eager initial bundle (same convention as
  // `cotisation`/`reseau-neuronal` below).
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminLayout,
    children: [
      { path: '', component: AdminDashboard },
      { path: 'institutions', component: AdminInstitutionsList },
      { path: 'institutions/new', component: AdminInstitutionNew },
      { path: 'institutions/:id', component: AdminInstitutionDetail },
      { path: 'members', component: AdminMembers },
      { path: 'certifications', component: AdminCertificationsCatalogList },
      { path: 'certifications/new', component: AdminCertificationCatalogForm },
      { path: 'certifications/:id/edit', component: AdminCertificationCatalogForm },
      { path: 'audit-log', component: AdminAuditLogPage },
      {
        path: 'menus',
        loadComponent: () => import('./presentation/pages/admin/admin-menus/admin-menus').then((m) => m.AdminMenus),
      },
      {
        path: 'traductions',
        loadComponent: () =>
          import('./presentation/pages/admin/admin-translations/admin-translations').then((m) => m.AdminTranslations),
      },
      {
        path: 'templates-email',
        loadComponent: () =>
          import('./presentation/pages/admin/admin-email-templates-list/admin-email-templates-list').then(
            (m) => m.AdminEmailTemplatesList,
          ),
      },
      {
        path: 'templates-email/:id',
        loadComponent: () =>
          import('./presentation/pages/admin/admin-email-template-detail/admin-email-template-detail').then(
            (m) => m.AdminEmailTemplateDetail,
          ),
      },
      {
        path: 'blocs-home',
        loadComponent: () =>
          import('./presentation/pages/admin/admin-home-blocks/admin-home-blocks').then((m) => m.AdminHomeBlocks),
      },
    ],
  },
  // Lazy-loaded (not eagerly imported like the rest of this file): the canvas explorer pulls
  // in a genuinely large amount of code for a page most visitors never open, and keeping it
  // out of the main bundle matters more here than for the small pages above.
  {
    path: 'reseau-neuronal',
    loadComponent: () =>
      import('./presentation/pages/reseau-neuronal/reseau-neuronal').then((m) => m.ReseauNeuronal),
  },
  // Public digital-card + wallet-pass-verification pages (task `07-WALLET.md`), appended
  // last so this never reorders any pre-existing route. Both are fully public/unauthenticated
  // — no guard — and never expose private member data (see `CartePublique`/`VerificationMembre`
  // doc comments).
  { path: 'card/:slug', component: CartePublique },
  { path: 'verify/member/:token', component: VerificationMembre },
];
