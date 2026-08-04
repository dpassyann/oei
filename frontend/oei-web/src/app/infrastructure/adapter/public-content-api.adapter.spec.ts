import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { PublicContentApiAdapter } from './public-content-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('PublicContentApiAdapter', () => {
  function createAdapter(): { adapter: PublicContentApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        PublicContentApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => '/api/v1' } },
      ],
    });
    return { adapter: TestBed.inject(PublicContentApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenSlugAndLang_whenGetPublishedBySlug_thenBuildsUrlWithLangParam', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getPublishedBySlug('livre-blanc', 'fr'));
    const req = httpMock.expectOne((r) => r.url === '/api/v1/public/v1/content/livre-blanc' && r.params.get('lang') === 'fr');
    req.flush({ id: 'v1', title: 'Livre Blanc' });

    expect((await result).title).toBe('Livre Blanc');
    httpMock.verify();
  });

  it('givenSlug_whenListDocumentVersions_thenUnwrapsPage', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.listDocumentVersions('livre-blanc'));
    httpMock
      .expectOne('/api/v1/public/v1/documents/livre-blanc/versions')
      .flush({ items: [{ id: 'v1' }], pageMetadata: { page: 0, pageSize: 20, totalItems: 1 } });

    expect((await result)[0].id).toBe('v1');
    httpMock.verify();
  });
});
