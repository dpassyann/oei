import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PublicationsPort } from '../../domain/port/publications.port';
import { createPublication, Publication } from '../../domain/model/publication';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) is used
// here (not `fetch()`/Promise).
@Service()
export class PublicationsApiAdapter implements PublicationsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getPublications(lang: string): Observable<Publication[]> {
    return this.http
      .get<Publication[]>(`${this.runtimeConfig.apiBaseUrl()}/publications/${lang}`)
      .pipe(map((data) => data.map((item) => createPublication(item))));
  }
}
