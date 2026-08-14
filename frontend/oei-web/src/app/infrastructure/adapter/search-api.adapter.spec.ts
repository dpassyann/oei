import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { SearchApiAdapter } from './search-api.adapter';

describe('SearchApiAdapter', () => {
  function createAdapter(): { adapter: SearchApiAdapter; httpMock: HttpTestingController } {
    TestBed.configureTestingModule({
      providers: [SearchApiAdapter, provideHttpClient(), provideHttpClientTesting()],
    });
    return { adapter: TestBed.inject(SearchApiAdapter), httpMock: TestBed.inject(HttpTestingController) };
  }

  it('givenQueryAndLang_whenSearch_thenBuildsUrlWithFixedTypesAndLocaleAndMapsResults', async () => {
    const { adapter, httpMock } = createAdapter();

    const result = firstValueFrom(adapter.search('gouvernance', 'fr'));
    const req = httpMock.expectOne(
      (r) =>
        r.url === '/api/public/v1/search' &&
        r.params.get('q') === 'gouvernance' &&
        r.params.get('types') === 'RESOURCE,NEWS' &&
        r.params.get('locale') === 'fr',
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ type: 'news', title: 'Titre', excerpt: 'Extrait', path: '/actualites/titre' }]);

    expect(await result).toEqual([{ type: 'news', title: 'Titre', excerpt: 'Extrait', path: '/actualites/titre' }]);
    httpMock.verify();
  });
});
