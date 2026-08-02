import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NewsPort } from '../../domain/port/news.port';
import { createNewsItem, NewsItem } from '../../domain/model/news-item';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class NewsApiAdapter implements NewsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getLatestNews(limit: number): Promise<NewsItem[]> {
    const response = await firstValueFrom(
      this.http.get<NewsItem[]>(`${this.runtimeConfig.apiBaseUrl()}/news?limit=${limit}`),
    );
    return response.map((item) => createNewsItem(item));
  }
}
