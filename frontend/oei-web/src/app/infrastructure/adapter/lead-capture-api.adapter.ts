import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LeadCapturePort } from '../../domain/port/lead-capture.port';
import { RuntimeConfig } from '../config/runtime-config';

// See `src/app/infrastructure/adapter/README.md` for why `HttpClient` (Observable) replaces
// the previous `fetch()`/Promise implementation.
@Service()
export class LeadCaptureApiAdapter implements LeadCapturePort {
  private readonly http = inject(HttpClient);
  private readonly runtimeConfig = inject(RuntimeConfig);

  submit(email: string): Observable<void> {
    return this.http
      .post(`${this.runtimeConfig.apiBaseUrl()}/leads`, { email })
      .pipe(map(() => undefined));
  }
}
