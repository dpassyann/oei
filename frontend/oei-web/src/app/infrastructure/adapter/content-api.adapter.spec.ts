import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContentApiAdapter } from './content-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('ContentApiAdapter', () => {
  let httpMock: HttpTestingController;

  function createAdapter(apiBaseUrl: string): ContentApiAdapter {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContentApiAdapter,
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    return TestBed.inject(ContentApiAdapter);
  }

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsDocument_whenGetHomeContent_thenMapsToDomainDocument', async () => {
    const adapter = createAdapter('/api/v1');
    const promise = adapter.getHomeContent('fr');
    const req = httpMock.expectOne('/api/v1/content/fr/home');
    req.flush({ slug: 'home', lang: 'fr', title: 'Titre API', body: 'Corps API', isFallback: false });
    const doc = await promise;
    expect(doc.title).toBe('Titre API');
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeContent_thenBuildsUrlFromRuntimeConfig', async () => {
    const adapter = createAdapter('/custom-api');
    const promise = adapter.getHomeContent('en');
    const req = httpMock.expectOne('/custom-api/content/en/home');
    req.flush({ slug: 'home', lang: 'en', title: 'Custom Title', body: 'Custom Body', isFallback: false });
    const doc = await promise;
    expect(doc.title).toBe('Custom Title');
  });
});
