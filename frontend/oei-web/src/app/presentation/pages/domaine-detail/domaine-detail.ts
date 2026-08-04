import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { FloatingSideMenu, FloatingSideMenuLink } from '../../components/floating-side-menu/floating-side-menu';

// Each domain gets its own page instance ("son propre univers") via this single generic
// template, resolved by slug — sections are placeholders today, filled in progressively per
// domain as content becomes available (per the user's explicit "au fur et à mesure").
const SECTION_FRAGMENTS = ['apercu', 'groupe-de-travail', 'ressources', 'contenu-cms'] as const;

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

  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')), {
    initialValue: '',
  });

  private readonly domainResource = rxResource({
    params: () => ({ slug: this.slug(), lang: this.i18n.currentLang() }),
    stream: ({ params }) => this.sections.getDomainArea(params.slug, params.lang),
  });

  // `resource.value()` throws when the resource is in an error state (e.g. an unknown
  // slug) — `hasValue()` must be checked first to safely read a possibly-absent value.
  protected readonly domain = computed(() => (this.domainResource.hasValue() ? this.domainResource.value() : undefined));
  protected readonly notFound = computed(() => this.domainResource.error() !== undefined);

  protected readonly sideMenuLinks = computed<FloatingSideMenuLink[]>(() =>
    SECTION_FRAGMENTS.map((fragment) => ({ fragment, label: this.i18n.translate(`domaineDetail.sections.${fragment}`) })),
  );

  protected readonly formattedLastModified = computed(() => {
    const domain = this.domain();
    if (!domain) {
      return '';
    }
    return new Intl.DateTimeFormat(this.i18n.currentLang(), { dateStyle: 'long' }).format(new Date(domain.lastModified));
  });
}
