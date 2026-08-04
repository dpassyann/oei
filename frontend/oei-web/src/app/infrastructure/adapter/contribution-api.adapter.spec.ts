import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { ContributionApiAdapter } from './contribution-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('ContributionApiAdapter', () => {
  function createAdapter(): { adapter: ContributionApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        ContributionApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api/v1' } },
      ],
    });
    return { adapter: TestBed.inject(ContributionApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenNoArgs_whenListMine_thenCallsMemberEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listMine());
    httpMock.expectOne('/api/v1/member/v1/contributions').flush([{ id: 'c1' }]);

    expect((await result)[0].id).toBe('c1');
    httpMock.verify();
  });

  it('givenContentId_whenListForContent_thenCallsAdminEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listForContent('content-1'));
    httpMock.expectOne('/api/v1/admin/v1/content/content-1/contributions').flush([{ id: 'c1' }]);

    expect((await result)[0].id).toBe('c1');
    httpMock.verify();
  });

  it('givenInput_whenCreate_thenPostsToMemberEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.create({ contentId: 'content-1', patch: 'p' }));
    const req = httpMock.expectOne('/api/v1/member/v1/contributions');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'c1' });

    expect((await result).id).toBe('c1');
    httpMock.verify();
  });

  it('givenContributionId_whenListComments_thenCallsCommentsEndpoint', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listComments('c1'));
    httpMock.expectOne('/api/v1/member/v1/contributions/c1/comments').flush([{ id: 'm1' }]);

    expect((await result)[0].id).toBe('m1');
    httpMock.verify();
  });

  it('givenBody_whenAddComment_thenPostsBody', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.addComment('c1', 'hello'));
    const req = httpMock.expectOne('/api/v1/member/v1/contributions/c1/comments');
    expect(req.request.body).toEqual({ body: 'hello' });
    req.flush({ id: 'm1' });

    expect((await result).id).toBe('m1');
    httpMock.verify();
  });
});
