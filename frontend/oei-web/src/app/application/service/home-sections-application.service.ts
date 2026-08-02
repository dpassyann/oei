import { Service, inject } from '@angular/core';
import { STATS_PORT } from '../../domain/port/stats.port';
import { DOMAINS_PORT } from '../../domain/port/domains.port';
import { NEWS_PORT } from '../../domain/port/news.port';
import { Stat } from '../../domain/model/stat';
import { DomainArea } from '../../domain/model/domain-area';
import { NewsItem } from '../../domain/model/news-item';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `RuntimeConfig` (see infrastructure/config/runtime-config.ts),
// where its availability in the installed @angular/core was confirmed.
@Service()
export class HomeSectionsApplicationService {
  private readonly statsPort = inject(STATS_PORT);
  private readonly domainsPort = inject(DOMAINS_PORT);
  private readonly newsPort = inject(NEWS_PORT);

  getStats(lang: string): Promise<Stat[]> {
    return this.statsPort.getHomeStats(lang);
  }

  getDomainAreas(lang: string): Promise<DomainArea[]> {
    return this.domainsPort.getDomainAreas(lang);
  }

  getLatestNews(limit: number, lang: string): Promise<NewsItem[]> {
    return this.newsPort.getLatestNews(limit, lang);
  }
}
