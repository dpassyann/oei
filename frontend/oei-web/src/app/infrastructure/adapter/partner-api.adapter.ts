import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PartnerRepositoryPort } from '../../domain/port/partner-repository.port';
import { createPartner, Partner } from '../../domain/model/partner';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation.
@Service()
export class PartnerApiAdapter implements PartnerRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getPartners(lang: string): Observable<Partner[]> {
    return this.http
      .get<Partner[]>(`${this.runtimeConfig.apiBaseUrl()}/partners/${lang}`)
      .pipe(map((data) => data.map((partner) => createPartner(partner))));
  }

  getPartner(id: string, lang: string): Observable<Partner> {
    return this.http
      .get<Partner>(`${this.runtimeConfig.apiBaseUrl()}/partners/${lang}/${id}`)
      .pipe(map((data) => createPartner(data)));
  }
}
