import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { NewsApiAdapter } from './news-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('NewsApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: NewsApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        NewsApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(NewsApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsNews_whenGetLatestNews_thenBuildsUrlWithLimitAndMapsResults', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getLatestNews(3, 'fr'));
    const req = httpMock.expectOne('/api/v1/news/fr?limit=3');
    req.flush([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]);

    expect(await result).toEqual([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]);
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenGetLatestNews_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.getLatestNews(5, 'en'));
    const req = httpMock.expectOne('/custom-api/news/en?limit=5');
    req.flush([]);

    await result;
    httpMock.verify();
  });
});
