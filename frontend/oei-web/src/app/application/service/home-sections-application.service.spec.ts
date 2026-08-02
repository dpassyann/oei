import { TestBed } from '@angular/core/testing';
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
      getHomeStats: () => Promise.resolve([createStat({ label: 'Members', value: 42 })]),
    };
    const fakeDomainsPort: DomainsPort = overrides?.domains ?? {
      getDomainAreas: () =>
        Promise.resolve([createDomainArea({ icon: 'icon.svg', title: 'Health', description: 'About health' })]),
    };
    const fakeNewsPort: NewsPort = overrides?.news ?? {
      getLatestNews: () =>
        Promise.resolve([
          createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' }),
        ]),
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

  it('givenPortReturnsStats_whenGetStats_thenReturnsThem', async () => {
    const service = setup();
    const stats = await service.getStats();
    expect(stats).toEqual([createStat({ label: 'Members', value: 42 })]);
  });

  it('givenPortReturnsDomainAreas_whenGetDomainAreas_thenReturnsThem', async () => {
    const service = setup();
    const domainAreas = await service.getDomainAreas();
    expect(domainAreas).toEqual([createDomainArea({ icon: 'icon.svg', title: 'Health', description: 'About health' })]);
  });

  it('givenPortReturnsNews_whenGetLatestNews_thenForwardsLimitAndReturnsThem', async () => {
    let receivedLimit: number | undefined;
    const service = setup({
      news: {
        getLatestNews: (limit) => {
          receivedLimit = limit;
          return Promise.resolve([
            createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' }),
          ]);
        },
      },
    });
    const news = await service.getLatestNews(3);
    expect(receivedLimit).toBe(3);
    expect(news).toEqual([createNewsItem({ title: 'News 1', excerpt: 'Excerpt', imageUrl: 'img.png', path: '/news/1' })]);
  });
});
