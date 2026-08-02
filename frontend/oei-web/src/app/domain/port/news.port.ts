import { InjectionToken } from '@angular/core';
import { NewsItem } from '../model/news-item';

export interface NewsPort {
  getLatestNews(limit: number, lang: string): Promise<NewsItem[]>;
}

export const NEWS_PORT = new InjectionToken<NewsPort>('NewsPort');
