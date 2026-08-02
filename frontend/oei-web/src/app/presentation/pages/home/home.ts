import { Component, effect, inject, PendingTasks, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApplicationService } from '../../../application/service/content-application.service';
import { HomeSectionsApplicationService } from '../../../application/service/home-sections-application.service';
import { PartnerApplicationService } from '../../../application/service/partner-application.service';
import { I18nService } from '../../i18n/i18n.service';
import { Stat } from '../../../domain/model/stat';
import { DomainArea } from '../../../domain/model/domain-area';
import { NewsItem } from '../../../domain/model/news-item';
import { Partner } from '../../../domain/model/partner';

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
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly content = inject(ContentApplicationService);
  private readonly sections = inject(HomeSectionsApplicationService);
  private readonly partners = inject(PartnerApplicationService);
  private readonly pendingTasks = inject(PendingTasks);
  protected readonly i18n = inject(I18nService);

  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly isFallback = signal(false);

  protected readonly stats = signal<Stat[]>([]);
  protected readonly domainAreas = signal<DomainArea[]>([]);
  protected readonly latestNews = signal<NewsItem[]>([]);
  protected readonly partnerList = signal<Partner[]>([]);

  // Excerpt of the full resource list from the `/ressources` page, truncated to 3
  // entries. Kept as a small local copy (rather than importing `Ressources`' private
  // list) since the home page only ever shows a teaser of it, plus a "see all" link.
  // Labels are never hardcoded: `key` resolves to `home.resources.items.<key>.label`.
  protected readonly resourceExcerpt: readonly ResourceExcerptLink[] = [
    { key: 'deontologie', path: '/deontologie' },
    { key: 'referentiel' },
    { key: 'livreBlanc', path: '/ressources', fragment: 'livre-blanc' },
  ];

  // The 4 founding commitments and the 4 home stats are each rendered from a fixed-size
  // index range: only the icon (not language content) is structural/static here — titles,
  // descriptions and stat labels all come from i18n keys or the stats port/adapter.
  protected readonly commitmentIndexes = Array.from({ length: COMMITMENT_COUNT }, (_, i) => i);

  constructor() {
    // Registered as a pending task so zoneless change detection (and
    // `ComponentFixture.whenStable()` in tests) actually waits for these
    // fetch-backed loads to settle instead of considering the app stable
    // before the signals/i18n dictionary are populated.
    void this.pendingTasks.run(() => this.loadInterfaceStrings());

    // Re-loads the hero content and the section data (stats, domains, news,
    // partners) whenever the current language changes: this effect runs once
    // immediately on creation (initial load) and again every time
    // `i18n.currentLang()` changes (e.g. via the language switcher), keeping
    // every home-page section in sync with the selected language.
    effect(() => {
      const lang = this.i18n.currentLang();
      void this.pendingTasks.run(() => this.loadContent(lang));
      void this.pendingTasks.run(() => this.loadSections(lang));
    });
  }

  private async loadContent(lang: string): Promise<void> {
    const dto = await this.content.getHomeContent(lang);
    this.title.set(dto.title);
    this.body.set(dto.body);
    this.isFallback.set(dto.isFallback);
  }

  private async loadSections(lang: string): Promise<void> {
    const [stats, domainAreas, latestNews, partnerList] = await Promise.all([
      this.sections.getStats(lang),
      this.sections.getDomainAreas(lang),
      this.sections.getLatestNews(NEWS_LIMIT, lang),
      this.partners.getPartners(lang),
    ]);
    this.stats.set(stats);
    this.domainAreas.set(domainAreas);
    this.latestNews.set(latestNews);
    this.partnerList.set(partnerList);
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
