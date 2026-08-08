import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ArticleSubmissionApplicationService } from './article-submission-application.service';
import {
  ARTICLE_SUBMISSION_PORT,
  ArticleSubmissionPort,
} from '../../domain/port/article/article-submission.port';

describe('ArticleSubmissionApplicationService', () => {
  function createService(port: Partial<ArticleSubmissionPort>): ArticleSubmissionApplicationService {
    TestBed.configureTestingModule({ providers: [{ provide: ARTICLE_SUBMISSION_PORT, useValue: port }] });
    return TestBed.inject(ArticleSubmissionApplicationService);
  }

  it('givenDraft_whenSubmit_thenDelegatesToPort', async () => {
    const submit = vi.fn().mockReturnValue(of({ id: 'sub-1' }));
    const service = createService({ submit });
    const draft = { title: 'Titre', body: 'Corps' };

    await firstValueFrom(service.submit(draft));

    expect(submit).toHaveBeenCalledWith(draft);
  });

  it('whenListMine_thenDelegatesToPort', async () => {
    const listMine = vi.fn().mockReturnValue(of([]));
    const service = createService({ listMine });

    await firstValueFrom(service.listMine());

    expect(listMine).toHaveBeenCalled();
  });
});
