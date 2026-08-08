import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ArticleSubmission } from '../../model/article/article-submission';

// What a member fills in on the submission form — never includes `id`/`authorId`/`status`/
// `submittedAt`, which are always server/adapter-assigned (mirrors the `ProfessionalProfile`
// vs. onboarding-draft split elsewhere in this codebase).
export interface ArticleSubmissionDraft {
  readonly title: string;
  readonly body: string;
  readonly coverImageUrl?: string;
}

export interface ArticleSubmissionPort {
  submit(draft: ArticleSubmissionDraft): Observable<ArticleSubmission>;
  listMine(): Observable<ArticleSubmission[]>;
}

export const ARTICLE_SUBMISSION_PORT = new InjectionToken<ArticleSubmissionPort>('ArticleSubmissionPort');
