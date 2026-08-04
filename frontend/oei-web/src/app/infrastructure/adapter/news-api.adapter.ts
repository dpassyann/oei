import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { NewsPort } from '../../domain/port/news.port';
import { createNewsItem, NewsItem } from '../../domain/model/news-item';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation.
@Service()
export class NewsApiAdapter implements NewsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getLatestNews(limit: number, lang: string): Observable<NewsItem[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http
      .get<NewsItem[]>(`${this.runtimeConfig.apiBaseUrl()}/news/${lang}`, { params })
      .pipe(map((data) => data.map((item) => createNewsItem(item))));
  }
}
