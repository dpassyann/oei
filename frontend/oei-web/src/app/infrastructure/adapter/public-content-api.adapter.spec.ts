import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { PublicContentApiAdapter } from './public-content-api.adapter';

describe('PublicContentApiAdapter', () => {
  function createAdapter(): { adapter: PublicContentApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [PublicContentApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(PublicContentApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenSlugAndLang_whenGetPublishedBySlug_thenBuildsUrlWithLangParam', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getPublishedBySlug('livre-blanc', 'fr'));
    const req = httpMock.expectOne((r) => r.url === '/api/public/v1/content/livre-blanc' && r.params.get('lang') === 'fr');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'v1', title: 'Livre Blanc' });

    expect((await result).title).toBe('Livre Blanc');
    httpMock.verify();
  });

  it('givenNoLang_whenGetPublishedBySlug_thenOmitsLangParam', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getPublishedBySlug('livre-blanc'));
    const req = httpMock.expectOne((r) => r.url === '/api/public/v1/content/livre-blanc');
    expect(req.request.params.has('lang')).toBe(false);
    req.flush({ id: 'v1', title: 'Livre Blanc' });

    expect((await result).title).toBe('Livre Blanc');
    httpMock.verify();
  });

  it('givenSlug_whenListDocumentVersions_thenUnwrapsPage', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listDocumentVersions('livre-blanc'));
    const req = httpMock.expectOne('/api/public/v1/documents/livre-blanc/versions');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [{ id: 'v1' }], pageMetadata: { page: 0, pageSize: 20, totalItems: 1 } });

    expect((await result)[0].id).toBe('v1');
    httpMock.verify();
  });
});
