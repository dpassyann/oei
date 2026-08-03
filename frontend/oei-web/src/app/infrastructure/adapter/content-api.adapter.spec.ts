import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ContentApiAdapter } from './content-api.adapter';
import { RuntimeConfig } from '../config/runtime-config';

describe('ContentApiAdapter', () => {
  function createAdapter(apiBaseUrl: string): { adapter: ContentApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [
        ContentApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RuntimeConfig, useValue: { apiBaseUrl: () => apiBaseUrl } },
      ],
    });
    return { adapter: TestBed.inject(ContentApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsDocument_whenGetHomeContent_thenMapsToDomainDocument', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getHomeContent('fr'));
    const req = httpMock.expectOne('/api/v1/content/fr/home');
    req.flush({ slug: 'home', lang: 'fr', title: 'Titre API', body: 'Corps API', isFallback: false });

    const doc = await result;
    expect(doc.title).toBe('Titre API');
    httpMock.verify();
  });

  it('givenNonDefaultApiBaseUrl_whenGetHomeContent_thenBuildsUrlFromRuntimeConfig', async () => {
    const { adapter, httpMock } = createAdapter('/custom-api');

    const result = firstValueFrom(adapter.getHomeContent('en'));
    const req = httpMock.expectOne('/custom-api/content/en/home');
    req.flush({ slug: 'home', lang: 'en', title: 'Custom Title', body: 'Custom Body', isFallback: false });

    const doc = await result;
    expect(doc.title).toBe('Custom Title');
    httpMock.verify();
  });

  it('givenNonOkResponse_whenGetHomeContent_thenThrows', async () => {
    const { adapter, httpMock } = createAdapter('/api/v1');

    const result = firstValueFrom(adapter.getHomeContent('fr'));
    const req = httpMock.expectOne('/api/v1/content/fr/home');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toThrow();
    httpMock.verify();
  });
});
