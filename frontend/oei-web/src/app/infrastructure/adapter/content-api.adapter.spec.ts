import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ContentApiAdapter } from './content-api.adapter';

describe('ContentApiAdapter', () => {
  function createAdapter(): { adapter: ContentApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [ContentApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(ContentApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenBackendReturnsDocument_whenGetHomeContent_thenMapsToDomainDocument', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getHomeContent('fr'));
    const req = httpMock.expectOne((request) => request.url.endsWith('/content/fr/home'));
    expect(req.request.method).toBe('GET');
    req.flush({ slug: 'home', lang: 'fr', title: 'Titre API', body: 'Corps API', isFallback: false });

    const doc = await result;
    expect(doc.title).toBe('Titre API');
    httpMock.verify();
  });

  it('givenAnotherLanguage_whenGetHomeContent_thenBuildsUrlWithoutApiPrefix', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getHomeContent('en'));
    const req = httpMock.expectOne((request) => request.url.endsWith('/content/en/home'));
    expect(req.request.method).toBe('GET');
    req.flush({ slug: 'home', lang: 'en', title: 'Custom Title', body: 'Custom Body', isFallback: false });

    const doc = await result;
    expect(doc.title).toBe('Custom Title');
    httpMock.verify();
  });

  it('givenNonOkResponse_whenGetHomeContent_thenThrows', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.getHomeContent('fr'));
    const req = httpMock.expectOne((request) => request.url.endsWith('/content/fr/home'));
    req.flush(null, { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toThrow();
    httpMock.verify();
  });
});
