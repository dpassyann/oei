import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ArticleSubmissionApiAdapter } from './article-submission-api.adapter';

describe('ArticleSubmissionApiAdapter', () => {
  function createAdapter(): { adapter: ArticleSubmissionApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [ArticleSubmissionApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(ArticleSubmissionApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenDraft_whenSubmit_thenPostsToArticleSubmissionsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();
    const draft = { title: 'Titre', body: 'Corps' };

    const result = firstValueFrom(adapter.submit(draft));
    const req = httpMock.expectOne('/api/member/v1/article-submissions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(draft);
    req.flush({ id: 'sub-1', ...draft, authorId: 'demo-member-1', status: 'pending', submittedAt: 'now' });

    expect((await result).status).toBe('pending');
    httpMock.verify();
  });

  it('whenListMine_thenGetsArticleSubmissionsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listMine());
    httpMock.expectOne('/api/member/v1/article-submissions').flush([]);

    expect(await result).toEqual([]);
    httpMock.verify();
  });
});
