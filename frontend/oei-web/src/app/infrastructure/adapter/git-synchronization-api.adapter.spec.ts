import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { GitSynchronizationApiAdapter } from './git-synchronization-api.adapter';

describe('GitSynchronizationApiAdapter', () => {
  function createAdapter(): { adapter: GitSynchronizationApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [GitSynchronizationApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(GitSynchronizationApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenTrigger_whenCalled_thenPostsToSynchronizeUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.trigger());
    const req = httpMock.expectOne('/api/admin/v1/git/synchronize');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'sync-1', status: 'SUCCESS' });

    expect((await result).id).toBe('sync-1');
    httpMock.verify();
  });

  it('givenList_whenCalled_thenGetsSynchronizationsUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.list());
    httpMock.expectOne('/api/admin/v1/git/synchronizations').flush([{ id: 'sync-1', status: 'SUCCESS' }]);

    expect((await result)[0].id).toBe('sync-1');
    httpMock.verify();
  });

  it('givenId_whenGetById_thenGetsDetailUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getById('sync-1'));
    httpMock.expectOne('/api/admin/v1/git/synchronizations/sync-1').flush({ id: 'sync-1', status: 'SUCCESS' });

    expect((await result).id).toBe('sync-1');
    httpMock.verify();
  });

  it('givenListSyncedFiles_whenCalled_thenGetsLatestFilesUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listSyncedFiles());
    httpMock.expectOne('/api/admin/v1/git/synchronizations/latest/files').flush([{ path: 'a.md' }]);

    expect((await result)[0].path).toBe('a.md');
    httpMock.verify();
  });
});
