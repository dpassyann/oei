import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { HomeSectionsApplicationService } from './home-sections-application.service';
import { STATS_PORT, StatsPort } from '../../domain/port/stats.port';
import { DOMAINS_PORT, DomainsPort } from '../../domain/port/domains.port';
import { NEWS_PORT, NewsPort } from '../../domain/port/news.port';
import { createStat } from '../../domain/model/stat';
import { createDomainArea } from '../../domain/model/domain-area';
import { createNewsItem } from '../../domain/model/news-item';

describe('HomeSectionsApplicationService', () => {
  function setup(overrides?: { stats?: StatsPort; domains?: DomainsPort; news?: NewsPort }) {
    const fakeStatsPort: StatsPort = overrides?.stats ?? {
      getHomeStats: () => of([createStat({ label: 'Members', value: 42 })]),
    };
    const fakeDomainsPort: DomainsPort = overrides?.domains ?? {
      getDomainAreas: () =>
        of([
          createDomainArea({
            slug: 'health',
            icon: 'icon.svg',
            title: 'Health',
            description: 'About health',
            lastModified: '2026-01-01',
          }),
        ]),
      getDomainArea: (slug) =>
        of(
          createDomainArea({
            slug,
            icon: 'icon.svg',
            title: 'Health',
            description: 'About health',
            lastModified: '2026-01-01',
          }),
        ),
    };
    const fakeNewsPort: NewsPort = overrides?.news ?? {
      getLatestNews: () =>
        of([createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' })]),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: STATS_PORT, useValue: fakeStatsPort },
        { provide: DOMAINS_PORT, useValue: fakeDomainsPort },
        { provide: NEWS_PORT, useValue: fakeNewsPort },
      ],
    });
    return TestBed.inject(HomeSectionsApplicationService);
  }

  it('givenPortReturnsStats_whenGetStats_thenForwardsLangAndReturnsThem', async () => {
    let receivedLang: string | undefined;
    const service = setup({
      stats: {
        getHomeStats: (lang) => {
          receivedLang = lang;
          return of([createStat({ label: 'Members', value: 42 })]);
        },
      },
    });
    const stats = await firstValueFrom(service.getStats('fr'));
    expect(receivedLang).toBe('fr');
    expect(stats).toEqual([createStat({ label: 'Members', value: 42 })]);
  });

  it('givenPortReturnsDomainAreas_whenGetDomainAreas_thenForwardsLangAndReturnsThem', async () => {
    let receivedLang: string | undefined;
    const service = setup({
      domains: {
        getDomainAreas: (lang) => {
          receivedLang = lang;
          return of([
            createDomainArea({
              slug: 'health',
              icon: 'icon.svg',
              title: 'Health',
              description: 'About health',
              lastModified: '2026-01-01',
            }),
          ]);
        },
        getDomainArea: (slug) =>
          of(
            createDomainArea({
              slug,
              icon: 'icon.svg',
              title: 'Health',
              description: 'About health',
              lastModified: '2026-01-01',
            }),
          ),
      },
    });
    const domainAreas = await firstValueFrom(service.getDomainAreas('fr'));
    expect(receivedLang).toBe('fr');
    expect(domainAreas).toEqual([
      createDomainArea({
        slug: 'health',
        icon: 'icon.svg',
        title: 'Health',
        description: 'About health',
        lastModified: '2026-01-01',
      }),
    ]);
  });

  it('givenPortReturnsDomainArea_whenGetDomainArea_thenForwardsSlugAndLangAndReturnsIt', async () => {
    let receivedSlug: string | undefined;
    let receivedLang: string | undefined;
    const service = setup({
      domains: {
        getDomainAreas: () => of([]),
        getDomainArea: (slug, lang) => {
          receivedSlug = slug;
          receivedLang = lang;
          return of(
            createDomainArea({
              slug,
              icon: 'icon.svg',
              title: 'Health',
              description: 'About health',
              lastModified: '2026-01-01',
            }),
          );
        },
      },
    });
    const domainArea = await firstValueFrom(service.getDomainArea('health', 'fr'));
    expect(receivedSlug).toBe('health');
    expect(receivedLang).toBe('fr');
    expect(domainArea.title).toBe('Health');
  });

  it('givenPortReturnsNews_whenGetLatestNews_thenForwardsLimitAndLangAndReturnsThem', async () => {
    let receivedLimit: number | undefined;
    let receivedLang: string | undefined;
    const service = setup({
      news: {
        getLatestNews: (limit, lang) => {
          receivedLimit = limit;
          receivedLang = lang;
          return of([createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' })]);
        },
      },
    });
    const news = await firstValueFrom(service.getLatestNews(3, 'fr'));
    expect(receivedLimit).toBe(3);
    expect(receivedLang).toBe('fr');
    expect(news).toEqual([createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' })]);
  });
});
