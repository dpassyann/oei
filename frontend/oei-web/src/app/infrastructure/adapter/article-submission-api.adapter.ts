import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ArticleSubmissionDraft,
  ArticleSubmissionPort,
} from '../../domain/port/article/article-submission.port';
import { ArticleSubmission } from '../../domain/model/article/article-submission';

// Endpoints under `/api/member/v1/**` are role-versioned per ADR 0002 and use a literal prefix
// rather than `RuntimeConfig.apiBaseUrl()` — same convention as `badge-api.adapter.ts`.
const ARTICLE_SUBMISSION_API_BASE = '/api/member/v1';

@Service()
export class ArticleSubmissionApiAdapter implements ArticleSubmissionPort {
  private readonly http = inject(HttpClient);

  submit(draft: ArticleSubmissionDraft): Observable<ArticleSubmission> {
    return this.http.post<ArticleSubmission>(`${ARTICLE_SUBMISSION_API_BASE}/article-submissions`, draft);
  }

  listMine(): Observable<ArticleSubmission[]> {
    return this.http.get<ArticleSubmission[]>(`${ARTICLE_SUBMISSION_API_BASE}/article-submissions`);
  }
}
