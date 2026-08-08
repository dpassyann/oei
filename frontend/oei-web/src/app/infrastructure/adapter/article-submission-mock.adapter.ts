import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ArticleSubmissionDraft,
  ArticleSubmissionPort,
} from '../../domain/port/article/article-submission.port';
import { ArticleSubmission, createArticleSubmission } from '../../domain/model/article/article-submission';

// Same demo member as `member-mock.adapter.ts`'s `DEMO_MEMBER` / `professional-profile-mock
// .adapter.ts`'s `DEMO_PROFESSIONAL_PROFILE`, so the whole mocked member space agrees on who
// "the current member" is.
const DEMO_AUTHOR_ID = 'demo-member-1';

// `@Service()`-decorated classes are provided via `useFactory`/`inject(...)` in `app.config.ts`,
// i.e. as application-wide singletons — an in-memory instance field is therefore enough to make
// a submitted article "stick" for the rest of the session without a real backend, exactly like
// every other `*-mock.adapter.ts` in this codebase.
@Service()
export class ArticleSubmissionMockAdapter implements ArticleSubmissionPort {
  private readonly submissions: ArticleSubmission[] = [];
  private sequence = 0;

  submit(draft: ArticleSubmissionDraft): Observable<ArticleSubmission> {
    this.sequence += 1;
    const submission = createArticleSubmission({
      id: `demo-article-submission-${this.sequence}`,
      title: draft.title,
      body: draft.body,
      coverImageUrl: draft.coverImageUrl,
      authorId: DEMO_AUTHOR_ID,
      // Always `pending` on submission — never appears on `/actualites` until a CMS
      // moderator approves it (out of scope for this adapter).
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    this.submissions.push(submission);
    return of(submission);
  }

  listMine(): Observable<ArticleSubmission[]> {
    return of([...this.submissions]);
  }
}
