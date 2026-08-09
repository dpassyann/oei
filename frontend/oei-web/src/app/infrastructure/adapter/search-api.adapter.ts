import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SearchPort } from '../../domain/port/search.port';
import { createSearchResult, SearchResult } from '../../domain/model/search-result';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation. Matches `GET /api/public/v1/search` in
// `openapi/oei-api.yaml` (tag `search`) — V1 scope is `types=RESOURCE,NEWS` only.
@Service()
export class SearchApiAdapter implements SearchPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  search(query: string, lang: string): Observable<SearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('types', 'RESOURCE,NEWS')
      .set('locale', lang);
    return this.http
      .get<SearchResult[]>(`${this.runtimeConfig.apiBaseUrl()}/public/v1/search`, { params })
      .pipe(map((data) => data.map((item) => createSearchResult(item))));
  }
}
