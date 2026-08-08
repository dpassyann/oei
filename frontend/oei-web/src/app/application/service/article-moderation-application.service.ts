import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ARTICLE_MODERATION_PORT } from '../../domain/port/article-moderation.port';
import { ArticleSubmission } from '../../domain/model/article/article-submission';

// `@Service()` for consistency with the other application services (see
// `application/service/admin-content-application.service.ts`). Returns `Observable`s end-to-end
// (see `infrastructure/adapter/README.md`).
@Service()
export class ArticleModerationApplicationService {
  private readonly port = inject(ARTICLE_MODERATION_PORT);

  listPending(): Observable<ArticleSubmission[]> {
    return this.port.listPending();
  }

  approve(id: string): Observable<void> {
    return this.port.approve(id);
  }

  reject(id: string, reason?: string): Observable<void> {
    return this.port.reject(id, reason);
  }
}
