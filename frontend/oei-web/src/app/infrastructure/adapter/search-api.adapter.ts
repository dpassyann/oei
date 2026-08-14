import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SearchPort } from '../../domain/port/search.port';
import { createSearchResult, SearchResult } from '../../domain/model/search-result';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation. Matches `GET /api/public/v1/search` in
// `openapi/oei-api.yaml` (tag `search`) — V1 scope is `types=RESOURCE,NEWS` only.
//
// Endpoints under `/api/public/v1/**` use a literal prefix rather than
// `RuntimeConfig.apiBaseUrl()` (which defaults to the legacy `/api/v1` public-site base and is
// only overridable for that historical `home-legacy` family of endpoints).
const SEARCH_API_BASE = '/api/public/v1';

@Service()
export class SearchApiAdapter implements SearchPort {
  private readonly http = inject(HttpClient);

  search(query: string, lang: string): Observable<SearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('types', 'RESOURCE,NEWS')
      .set('locale', lang);
    return this.http
      .get<SearchResult[]>(`${SEARCH_API_BASE}/search`, { params })
      .pipe(map((data) => data.map((item) => createSearchResult(item))));
  }
}
