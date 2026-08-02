import { Service, inject } from '@angular/core';
import { NewsPort } from '../../domain/port/news.port';
import { createNewsItem, NewsItem } from '../../domain/model/news-item';
import { RuntimeConfig } from '../config/runtime-config';

@Service()
export class NewsApiAdapter implements NewsPort {
  private readonly runtimeConfig = inject(RuntimeConfig);

  async getLatestNews(limit: number, lang: string): Promise<NewsItem[]> {
    const response = await fetch(`${this.runtimeConfig.apiBaseUrl()}/news/${lang}?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`getLatestNews failed with status ${response.status}`);
    }
    const data = (await response.json()) as NewsItem[];
    return data.map((item) => createNewsItem(item));
  }
}
