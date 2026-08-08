import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ArticleModerationPort } from '../../domain/port/article-moderation.port';
import { ArticleSubmission, createArticleSubmission } from '../../domain/model/article/article-submission';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation.
@Service()
export class ArticleModerationApiAdapter implements ArticleModerationPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  listPending(): Observable<ArticleSubmission[]> {
    return this.http
      .get<ArticleSubmission[]>(`${this.runtimeConfig.apiBaseUrl()}/articles/submissions?status=pending`)
      .pipe(map((data) => data.map((item) => createArticleSubmission(item))));
  }

  approve(id: string): Observable<void> {
    return this.http
      .post(`${this.runtimeConfig.apiBaseUrl()}/articles/submissions/${id}/approve`, {})
      .pipe(map(() => undefined));
  }

  reject(id: string, reason?: string): Observable<void> {
    return this.http
      .post(`${this.runtimeConfig.apiBaseUrl()}/articles/submissions/${id}/reject`, { reason })
      .pipe(map(() => undefined));
  }
}
