import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { NewsItem } from '../model/news-item';

export interface NewsPort {
  getLatestNews(limit: number, lang: string): Observable<NewsItem[]>;
}

export const NEWS_PORT = new InjectionToken<NewsPort>('NewsPort');
