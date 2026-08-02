import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NewsApiAdapter } from './news-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('NewsApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): NewsApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NewsApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(NewsApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsNews_whenGetLatestNews_thenBuildsUrlWithLimitAndMapsResults', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getLatestNews(3);
    const req = httpMock.expectOne('/api/v1/news?limit=3');
    req.flush([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]);
    const news = await promise;
    expect(news).toEqual([{ title: 'Titre', excerpt: 'Extrait', imageUrl: '/img.jpg', path: '/news/titre' }]);
  });

  it('givenNonDefaultApiBaseUrl_whenGetLatestNews_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.getLatestNews(5);
    const req = httpMock.expectOne('/custom-api/news?limit=5');
    req.flush([]);
    await promise;
  });
});
