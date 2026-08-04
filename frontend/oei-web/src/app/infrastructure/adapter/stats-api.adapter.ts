import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { StatsPort } from '../../domain/port/stats.port';
import { createStat, Stat } from '../../domain/model/stat';
import { RuntimeConfig } from '../config/runtime-config';

// Uses `HttpClient` (RxJS `Observable` end-to-end) rather than `fetch()`/`Promise` — see the
// architecture note in `src/app/infrastructure/adapter/README.md` for why. `HttpClient` already
// surfaces non-2xx responses as an `Observable` error (`HttpErrorResponse`), so there is no need
// for a manual `response.ok` check like the previous `fetch()`-based version had.
@Service()
export class StatsApiAdapter implements StatsPort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  getHomeStats(lang: string): Observable<Stat[]> {
    return this.http
      .get<Stat[]>(`${this.runtimeConfig.apiBaseUrl()}/stats/${lang}`)
      .pipe(map((data) => data.map((stat) => createStat(stat))));
  }
}
