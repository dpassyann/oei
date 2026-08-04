import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PUBLICATIONS_PORT } from '../../domain/port/publications.port';
import { Publication } from '../../domain/model/publication';

// Note: `@Service()` is used instead of `@Injectable({ providedIn: 'root' })` for
// consistency with `PartnerApplicationService` (see application/service/partner-application.service.ts).
//
// Returns `Observable`s (not `Promise`s) — see `src/app/infrastructure/adapter/README.md`
// for the RxJS-end-to-end architecture this service is part of.
@Service()
export class PublicationsApplicationService {
  private readonly port = inject(PUBLICATIONS_PORT);

  getPublications(lang: string): Observable<Publication[]> {
    return this.port.getPublications(lang);
  }
}
