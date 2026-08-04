import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { AdminContentApiAdapter } from './admin-content-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('AdminContentApiAdapter', () => {
  function createAdapter(): { adapter: AdminContentApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        AdminContentApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api/v1' } },
      ],
    });
    return { adapter: TestBed.inject(AdminContentApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenListWithCriteria_whenListed_thenBuildsQueryParamsAndUnwrapsPage', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.list({ type: 'ARTICLE', status: 'DRAFT', lang: 'fr', tag: 't', q: 'x' }));
    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/v1/admin/v1/content' &&
        r.params.get('type') === 'ARTICLE' &&
        r.params.get('status') === 'DRAFT' &&
        r.params.get('lang') === 'fr' &&
        r.params.get('tag') === 't' &&
        r.params.get('q') === 'x',
    );
    req.flush({ items: [{ id: 'c1' }], pageMetadata: { page: 0, pageSize: 20, totalItems: 1 } });

    expect((await result)[0].id).toBe('c1');
    httpMock.verify();
  });

  it('givenId_whenGetById_thenCallsExpectedUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getById('c1'));
    httpMock.expectOne('/api/v1/admin/v1/content/c1').flush({ id: 'c1' });

    expect((await result).id).toBe('c1');
    httpMock.verify();
  });

  it('givenCreation_whenCreate_thenPostsToBaseUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.create({ type: 'ARTICLE', slug: 's', sourceType: 'CMS', title: 'T' }));
    const req = httpMock.expectOne('/api/v1/admin/v1/content');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'c1' });

    expect((await result).id).toBe('c1');
    httpMock.verify();
  });

  it('givenNewVersion_whenCreateVersion_thenPutsToContentUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.createVersion('c1', { language: 'fr', title: 'T', body: 'B' }));
    const req = httpMock.expectOne('/api/v1/admin/v1/content/c1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 'v1' });

    expect((await result).id).toBe('v1');
    httpMock.verify();
  });

  const actionCases: readonly {
    readonly call: (adapter: AdminContentApiAdapter) => Observable<unknown>;
    readonly url: string;
  }[] = [
    { call: (a) => a.submit('c1'), url: '/api/v1/admin/v1/content/c1/submit' },
    { call: (a) => a.approve('c1', { role: 'LEGAL', decision: 'APPROVED' }), url: '/api/v1/admin/v1/content/c1/approve' },
    { call: (a) => a.reject('c1', 'nope'), url: '/api/v1/admin/v1/content/c1/reject' },
    { call: (a) => a.requestTranslation('c1'), url: '/api/v1/admin/v1/content/c1/translations/request' },
    { call: (a) => a.schedule('c1'), url: '/api/v1/admin/v1/content/c1/schedule' },
    { call: (a) => a.publish('c1'), url: '/api/v1/admin/v1/content/c1/publish' },
    { call: (a) => a.archive('c1'), url: '/api/v1/admin/v1/content/c1/archive' },
  ];

  for (const { call, url } of actionCases) {
    it(`givenAction_whenInvoked_thenPostsToExpectedUrl(${url})`, async () => {
      const { adapter, httpMock } = createAdapter();

      const result = firstValueFrom(call(adapter));
      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 'ok' });

      await result;
      httpMock.verify();
    });
  }

  it('givenTranslation_whenAdded_thenPostsToTranslationsUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.addTranslation('c1', { language: 'en' }));
    httpMock.expectOne('/api/v1/admin/v1/content/c1/translations').flush({ id: 't1' });

    expect((await result).id).toBe('t1');
    httpMock.verify();
  });

  it('givenTranslation_whenValidated_thenPostsToValidateUrl', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.validateTranslation('c1', 'en'));
    httpMock.expectOne('/api/v1/admin/v1/content/c1/translations/en/validate').flush({ id: 't1' });

    expect((await result).id).toBe('t1');
    httpMock.verify();
  });
});
