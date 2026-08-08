import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ArticleSubmission } from '../model/article/article-submission';

/**
 * CMS moderation queue for member-submitted articles (`ArticleSubmission`, see
 * `domain/model/article-submission.ts`). Distinct from `AdminContentPort` (which governs
 * editorial CMS content authored by admins through the full DRAFT→...→PUBLISHED workflow):
 * this port only covers the much simpler member-submission gate — `pending` → `approved` |
 * `rejected` — after which an approved submission is surfaced as a `NewsItem` (see
 * `NewsPort.getLatestNews`) rather than becoming a `Content` in its own right.
 */
export interface ArticleModerationPort {
  listPending(): Observable<ArticleSubmission[]>;
  approve(id: string): Observable<void>;
  reject(id: string, reason?: string): Observable<void>;
}

export const ARTICLE_MODERATION_PORT = new InjectionToken<ArticleModerationPort>('ArticleModerationPort');
