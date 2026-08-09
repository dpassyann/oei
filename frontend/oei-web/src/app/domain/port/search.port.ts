import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResult } from '../model/search-result';

// V1 global search scope is deliberately narrow: resources and news only (see the header's
// search icon in `SiteHeader`). Events, members, institutions and the graph are explicitly
// out of scope for now — see plan doc 02-DYNAMIC-NEWS-GLOBAL-SEARCH-RESOURCES.
export interface SearchPort {
  search(query: string, lang: string): Observable<SearchResult[]>;
}

export const SEARCH_PORT = new InjectionToken<SearchPort>('SearchPort');
