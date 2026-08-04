import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DomainsPort } from '../../domain/port/domains.port';
import { createDomainArea, DomainArea } from '../../domain/model/domain-area';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation.
@Service()
export class DomainsApiAdapter implements DomainsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getDomainAreas(lang: string): Observable<DomainArea[]> {
    return this.http
      .get<DomainArea[]>(`${this.runtimeConfig.apiBaseUrl()}/domains/${lang}`)
      .pipe(map((data) => data.map((domain) => createDomainArea(domain))));
  }
}
