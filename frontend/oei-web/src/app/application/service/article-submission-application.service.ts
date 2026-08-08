import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ARTICLE_SUBMISSION_PORT,
  ArticleSubmissionDraft,
} from '../../domain/port/article/article-submission.port';
import { ArticleSubmission } from '../../domain/model/article/article-submission';

@Service()
export class ArticleSubmissionApplicationService {
  private readonly port = inject(ARTICLE_SUBMISSION_PORT);

  submit(draft: ArticleSubmissionDraft): Observable<ArticleSubmission> {
    return this.port.submit(draft);
  }

  listMine(): Observable<ArticleSubmission[]> {
    return this.port.listMine();
  }
}
