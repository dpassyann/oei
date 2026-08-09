import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { I18nService } from '../../i18n/i18n.service';
import {
  FloatingSideMenu,
  FloatingSideMenuLink,
} from '../../components/floating-side-menu/floating-side-menu';

// Each of the 9 expertise domains gets its own page instance ("son propre univers") via this
// single generic template, resolved by slug through `HomeSectionsApplicationService.getDomainArea`.
// The editorial body (`DomainArea.sections`) is authored FR/EN-only for now — see the doc
// comment on `DomainArea` in `domain/model/domain-area.ts` — the other 4 site languages borrow
// the English content (`isContentFallback: true`) rather than showing an empty page.
//
// SEO metadata: this app has no Angular `Title`/`Meta` service wired anywhere yet — no route
// `title:` property in `app.routes.ts`, no `Meta`/`Title` injection on any existing page (À
// propos, Livre Blanc…). Per-page <title>/description/OpenGraph tags are therefore deliberately
// NOT invented here as a one-off, page-local mechanism; they should be introduced once, app-wide
// (e.g. `provideRouter(routes, withTitleStrategy(...))` or a shared `SeoService`), and this page
// should then adopt it like every other page.
@Component({
  selector: 'oei-domaine-detail',
  imports: [RouterLink, FloatingSideMenu],
  templateUrl: './domaine-detail.html',
  styleUrl: './domaine-detail.scss',
})
export class DomaineDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly sections = inject(HomeSectionsApplicationService);
  protected readonly i18n = inject(I18nService);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    {
      initialValue: '',
    },
  );

  private readonly domainResource = rxResource({
    params: () => ({ slug: this.slug(), lang: this.i18n.currentLang() }),
    stream: ({ params }) => this.sections.getDomainArea(params.slug, params.lang),
  });

  // `resource.value()` throws when the resource is in an error state (e.g. an unknown
  // slug) — `hasValue()` must be checked first to safely read a possibly-absent value.
  protected readonly domain = computed(() =>
    this.domainResource.hasValue() ? this.domainResource.value() : undefined,
  );
  protected readonly notFound = computed(() => this.domainResource.error() !== undefined);

  protected readonly isContentFallback = computed(() => this.domain()?.isContentFallback ?? false);

  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    (this.domain()?.sections ?? []).map((section) => ({
      fragment: section.id,
      label: section.title,
    })),
  );

  protected readonly formattedLastModified = computed(() => {
    const domain = this.domain();
    if (!domain) {
      return '';
    }
    return new Intl.DateTimeFormat(this.i18n.currentLang(), { dateStyle: 'long' }).format(
      new Date(domain.lastModified),
    );
  });
}
