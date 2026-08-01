import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContentApiAdapter } from './content-api.adapter';

describe('ContentApiAdapter', () => {
  let httpMock: HttpTestingController;
  let adapter: ContentApiAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ContentApiAdapter],
    });
    httpMock = TestBed.inject(HttpTestingController);
    adapter = TestBed.inject(ContentApiAdapter);
  });

  afterEach(() => httpMock.verify());

  it('givenBackendReturnsDocument_whenGetHomeContent_thenMapsToDomainDocument', async () => {
    const promise = adapter.getHomeContent('fr');
    const req = httpMock.expectOne('/api/v1/content/fr/home');
    req.flush({ slug: 'home', lang: 'fr', title: 'Titre API', body: 'Corps API', isFallback: false });
    const doc = await promise;
    expect(doc.title).toBe('Titre API');
  });
});
