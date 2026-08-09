import { Component, computed, inject, PendingTasks } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ContentApplicationService } from '../../../application/service/content-application.service';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { MembershipFeeApplicationService } from '../../../application/service/membership-fee-application.service';
import { KeycloakAuthService } from '../../auth/keycloak-auth.service';
import { I18nService } from '../../i18n/i18n.service';
import { HeroGlobe } from '../../components/hero-globe/hero-globe';

interface ResourceExcerptLink {
  // `key` is the structural identifier used to build the i18n path
  // `home.resources.items.<key>.label` — the label itself is never hardcoded here.
  readonly key: string;
  readonly path?: string;
  readonly fragment?: string;
}

const NEWS_LIMIT = 3;
const COMMITMENT_COUNT = 4;

@Component({
  selector: 'oei-home',
  imports: [RouterLink, HeroGlobe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly content = inject(ContentApplicationService);
  private readonly sections = inject(HomeSectionsApplicationService);
  private readonly partners = inject(PartnerApplicationService);
  private readonly membershipFeeService = inject(MembershipFeeApplicationService);
  private readonly keycloakAuth = inject(KeycloakAuthService);
  private readonly router = inject(Router);
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly i18n = inject(I18nService);

  // Each `rxResource` re-runs its `stream` (an RxJS `Observable`, see
  // `src/app/infrastructure/adapter/README.md` for the architecture decision) whenever its
  // `params` signal changes — here, whenever `i18n.currentLang()` changes (e.g. via the
  // language switcher) — keeping every home-page section in sync with the selected language.
  // `resource`/`rxResource` register themselves with Angular's `PendingTasks` internally, so
  // zoneless change detection (and `ComponentFixture.whenStable()` in tests) already waits for
  // them to settle without any manual `pendingTasks.run()` wrapping.
  private readonly contentResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.content.getHomeContent(params),
  });

  private readonly statsResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.sections.getStats(params),
  });

  private readonly domainAreasResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.sections.getDomainAreas(params),
  });

  private readonly latestNewsResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.sections.getLatestNews(NEWS_LIMIT, params),
  });

  private readonly partnerListResource = rxResource({
    params: () => this.i18n.currentLang(),
    stream: ({ params }) => this.partners.getPartners(params),
  });

  protected readonly title = computed(() => this.contentResource.value()?.title ?? '');
  protected readonly body = computed(() => this.contentResource.value()?.body ?? '');
  protected readonly isFallback = computed(() => this.contentResource.value()?.isFallback ?? false);

  protected readonly stats = computed(() => this.statsResource.value() ?? []);
  protected readonly domainAreas = computed(() => this.domainAreasResource.value() ?? []);
  protected readonly latestNews = computed(() => this.latestNewsResource.value() ?? []);
  protected readonly partnerList = computed(() => this.partnerListResource.value() ?? []);

  // Excerpt of the full resource list from the `/ressources` page, truncated to 3
  // entries. Kept as a small local copy (rather than importing `Ressources`' private
  // list) since the home page only ever shows a teaser of it, plus a "see all" link.
  // Labels are never hardcoded: `key` resolves to `home.resources.items.<key>.label`.
  protected readonly resourceExcerpt: readonly ResourceExcerptLink[] = [
    { key: 'deontologie', path: '/deontologie' },
    { key: 'referentiel' },
    { key: 'livreBlanc', path: '/livre-blanc' },
  ];

  // The 4 founding commitments and the 4 home stats are each rendered from a fixed-size
  // index range: only the icon (not language content) is structural/static here — titles,
  // descriptions and stat labels all come from i18n keys or the stats port/adapter.
  protected readonly commitmentIndexes = Array.from({ length: COMMITMENT_COUNT }, (_, i) => i);

  constructor() {
    // Registered as a pending task so zoneless change detection (and
    // `ComponentFixture.whenStable()` in tests) actually waits for the i18n dictionary load to
    // settle before the app is considered stable. Unlike the section/content resources above,
    // this isn't a `rxResource` because `I18nService.setLang` isn't a per-language-param data
    // load reused elsewhere — it mutates the shared dictionary used by `i18n.translate(...)`.
    void this.pendingTasks.run(() => this.loadInterfaceStrings());
  }

  /**
   * "Rejoignez le mouvement" hero button routing logic (product spec, point 1):
   * - not authenticated -> Keycloak's native registration screen (see
   *   `KeycloakAuthService.register()` — the former homemade `/inscription` Angular page was
   *   removed to avoid duplicating Keycloak's own enrollment screen);
   * - authenticated but the current cotisation cycle isn't paid -> the (mocked) cotisation
   *   payment page (`/espace-membre/cotisation`);
   * - authenticated and up to date -> neutral behaviour: the member's own profile page.
   * The fee status check is a one-shot subscribe (like `LeadCapturePort.submit` — see
   * `infrastructure/adapter/README.md`), not a resource, since it only needs to run once per
   * click, not stay reactively bound to a template.
   */
  protected onJoinClick(): void {
    if (!this.keycloakAuth.isAuthenticated()) {
      this.keycloakAuth.register();
      return;
    }

    this.membershipFeeService.getStatus().subscribe((status) => {
      if (!status.isPaid) {
        void this.router.navigateByUrl('/espace-membre/cotisation');
      } else {
        void this.router.navigateByUrl('/espace-membre/profil');
      }
    });
  }

  private async loadInterfaceStrings(): Promise<void> {
    // Ensures the header/nav labels for the current (default) language are
    // fetched once on load — `I18nService.setLang` is otherwise only invoked
    // when the user picks a language from the switcher.
    try {
      await this.i18n.setLang(this.i18n.currentLang());
    } catch {
      // No i18n server / offline / test environment without `fetch` base URL:
      // interface labels fall back to their raw translation keys (see `I18nService.translate`).
    }
  }
}
